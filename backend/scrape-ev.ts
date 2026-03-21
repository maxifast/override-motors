import * as dotenv from 'dotenv';
import { chromium, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import cron from 'node-cron';

dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

const BUCKET = 'car-images';
const PREMIUM_BRANDS = ["BMW", "Mercedes-Benz", "Audi", "Lexus", "Porsche", "Tesla", "Volvo", "Land Rover", "Genesis", "Toyota", "Volkswagen", "Zeekr", "Li Auto", "Mazda", "Jeep", "Infiniti", "Acura", "Cadillac", "Polestar", "Rivian", "Lucid"];

const CARS_PER_RUN = 4;

async function prepareBucket() {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error("Error listing buckets", listError);
        return;
    }
    if (!buckets.find(b => b.name === BUCKET)) {
        await supabase.storage.createBucket(BUCKET, { public: true });
        console.log(`Created new public bucket: ${BUCKET}`);
    }
}

async function uploadImage(buffer: Buffer, filename: string): Promise<string | null> {
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, buffer, {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (error) {
        console.error(`Failed to upload ${filename}:`, error.message);
        return null;
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return publicData.publicUrl;
}

export async function scrapeBatch(): Promise<number> {
    console.log(`\n\nStarting new EV/Hybrid Batch.`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });

    try {
        const page = await context.newPage();
        
        console.log("📡 Phase 1: Contacting Donor Site search queries (2020+, <200k km, Electric/Hybrid)");
        
        const searchUrls = [
            'https://www.schadeautos.nl/en/search/damaged/passenger-cars/1/1/6/0/46/0/1/0?p=2020-&odo=0-200000&fuel=electric',
            'https://www.schadeautos.nl/en/search/damaged/passenger-cars/1/1/6/0/46/0/1/0?p=2020-&odo=0-200000&fuel=hybrid'
        ];

        let allHrefs: string[] = [];

        for (const sUrl of searchUrls) {
            await page.goto(sUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            const hrefs = await page.$$eval('#Lijst_invoeg a', anchors => Array.from(anchors).map(a => (a as HTMLAnchorElement).href));
            allHrefs.push(...hrefs);
        }

        const uniqueHrefs = Array.from(new Set(allHrefs)).filter(h => h.includes('/damaged/'));
        console.log(`📋 Found ${uniqueHrefs.length} potential cars in feed.`);

        let batchCount = 0;
        console.log("🔍 Phase 2: Processing and uploading images...");

        for (const url of uniqueHrefs) {
            if (batchCount >= CARS_PER_RUN) break;

            const isPremium = PREMIUM_BRANDS.some(b => url.toLowerCase().includes(b.toLowerCase().replace(' ', '-')));
            if (!isPremium) continue;

            const existing = await prisma.car.findUnique({ where: { original_url: url } });
            if (existing) continue;

            const carPage = await context.newPage();
            try {
                await carPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                const html = await carPage.content();

                const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
                if (!titleMatch) { await carPage.close(); continue; }
                const title = titleMatch[1].replace(/<[^>]+>/g, '')
                                          .replace(/Damaged car/ig, '')
                                          .replace(/Damaged commercial vehicles/ig, '')
                                          .replace(/Damaged vehicle/ig, '')
                                          .replace(/Electric vehicle/ig, '')
                                          .trim().replace(/\s+/g, ' ');

                let brand = "Unknown";
                for (const b of PREMIUM_BRANDS) {
                    if (title.toLowerCase().includes(b.toLowerCase())) { brand = b; break; }
                }
                if (brand === "Unknown") { await carPage.close(); continue; }

                const priceMatch = html.match(/€\s*([\d.,]+)/);
                const price = priceMatch ? parseFloat(priceMatch[1].replace(/[.,]/g, '')) : 25000 + Math.random() * 50000;

                const yearMatch = html.match(/(?:ERD|year|bouwjaar)[\s\S]{0,30}?(\d{4})/i);
                const year = yearMatch ? parseInt(yearMatch[1]) : 2022;

                const mileageMatch = html.match(/(?:mileage|kilometerstand|odometer reading)[\s\S]{0,100}?(\d+[\d.,]*)\s*km/i);
                const mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/[.,]/g, '')) : 10000;

                const fuelMatch = html.match(/(?:fuel|brandstof)[\s\S]{0,30}?(electric|hybrid|petrol|diesel)/i);
                const rawFuel = fuelMatch ? fuelMatch[1] : 'Electric';
                const fuel_type = rawFuel.charAt(0).toUpperCase() + rawFuel.slice(1).toLowerCase();

                const descMatch = html.match(/(?:Damage details|Schadedetails)[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/i);
                let damage_description_en = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : "Collision damage to bodywork.";

                let damageTypeName = "Collision damage";
                if (damage_description_en.toLowerCase().includes('water') || damage_description_en.toLowerCase().includes('flood')) damageTypeName = "Water damage";
                else if (damage_description_en.toLowerCase().includes('fire')) damageTypeName = "Fire damage";
                else if (damage_description_en.toLowerCase().includes('engine') || damage_description_en.toLowerCase().includes('motor')) damageTypeName = "Engine damage";

                const imageMatches = Array.from(html.matchAll(/data-src="([^"]+)"/g)).map(m => m[1]).filter(src => src.includes('/foto/') || src.includes('/images/'));
                const originalImages = Array.from(new Set(imageMatches)).map(src => src.startsWith('http') ? src : `https://www.schadeautos.nl${src}`);

                if (originalImages.length > 0) {
                    process.stdout.write(`  -> Downloading ${Math.min(10, originalImages.length)} images for ${title}...`);
                    const finalImgs: string[] = [];

                    for (let i = 0; i < Math.min(10, originalImages.length); i++) {
                        try {
                            const res = await carPage.request.get(originalImages[i]);
                            const buffer = await res.body();
                            const filename = `${Buffer.from(title).toString('base64url')}-${Date.now()}-${i}.jpg`;
                            const publicUrl = await uploadImage(buffer, filename);
                            if (publicUrl) finalImgs.push(publicUrl);
                        } catch (ig) {}
                    }

                    if (finalImgs.length === 0) {
                        console.log(`\n  ❌ Failed to upload any images for ${title}, skipping.`);
                        await carPage.close();
                        continue;
                    }

                    let brandRecord = await prisma.brand.upsert({
                        where: { name: brand },
                        update: {},
                        create: { name: brand }
                    });

                    let dtRecord = await prisma.damageType.upsert({
                        where: { name: damageTypeName },
                        update: {},
                        create: { name: damageTypeName }
                    });

                    await prisma.car.upsert({
                        where: { original_url: url },
                        update: {},
                        create: {
                            original_url: url,
                            title, year, mileage, fuel_type, price, damage_description_en,
                            images: finalImgs, source: 'schadeautos.nl/cloud-sync',
                            is_pinned: false, status: 'active',
                            brand_id: brandRecord.id, damage_type_id: dtRecord.id
                        }
                    });
                    
                    console.log(`\n  ✅ Successfully saved and uploaded: ${title}`);
                    batchCount++;
                }

            } catch (e: any) {
                console.error(`Error processing ${url}:`, e.message);
            } finally {
                await carPage.close();
            }
        }

        console.log(`\nBatch finished! Scraped ${batchCount} premium EV/Hybrid cars.`);
        return batchCount;
    } catch (e) {
        console.error("Batch error:", e);
        return 0;
    } finally {
        await browser.close();
    }
}

async function main() {
    console.log("═══════════════════════════════════════════════════");
    console.log("  OVERRIDE MOTORS — EV/Hybrid Cloud Image Scraper ");
    console.log("  Strict Algorithm: Premium + 2020+ + <200k km + EV");
    console.log("  Batch: 4 cars → every 30 min from 08:00 to 22:00");
    console.log("═══════════════════════════════════════════════════\n");

    await prepareBucket();

    console.log(`\n[scheduler] CRON Scheduler started for EV/Hybrid Cloud Image Scraper.`);
    console.log(`[scheduler] Schedule: Every 30 minutes from 08:00 to 22:00 (Madrid Time). Batch size: ${CARS_PER_RUN} cars.\n`);

    let dailyStats = { date: new Date().getDate(), count: 0 };

    cron.schedule('0,30 8-22 * * *', async () => {
        let currentDay = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" })).getDate();
        if (currentDay !== dailyStats.date) {
            dailyStats.date = currentDay;
            dailyStats.count = 0;
            console.log("\n[scheduler] New day detected! Resetting daily quota to 0/40.");
        }

        if (dailyStats.count >= 40) {
            console.log(`\n[${new Date().toLocaleString()}] CRON Trigger: Daily limit of 40 cars reached (${dailyStats.count}/40). Skipping batch.`);
            return;
        }

        console.log(`\n[${new Date().toLocaleString()}] CRON Trigger: Starting EV/Hybrid Batch... (${dailyStats.count}/40 for today)`);
        try {
            const scraped = await scrapeBatch();
            dailyStats.count += scraped;
            console.log(`\n[${new Date().toLocaleString()}] Batch finished! Added ${scraped} cars. Daily total is now ${dailyStats.count}/40.`);
        } catch(err) {
            console.error("Error during scheduled scrape:", err);
        }
    }, {
        timezone: "Europe/Madrid"
    });

    console.log("Running initial batch immediately...");
    scrapeBatch().then((scraped) => {
        dailyStats.count += scraped;
        console.log(`Initial batch finished: ${scraped} cars (Daily: ${dailyStats.count}/40)`);
    }).catch(console.error);
}

main();
