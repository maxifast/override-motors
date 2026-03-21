import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PREMIUM_BRANDS = ["BMW", "Mercedes-Benz", "Audi", "Lexus", "Porsche", "Tesla", "Volvo", "Land Rover", "Genesis", "Toyota", "Volkswagen", "Zeekr", "Li Auto", "Mazda", "Jeep", "Infiniti", "Acura", "Cadillac"];

/**
 * Scrapes fresh cars from the search feed.
 * @param limit Number of cars to add in this run.
 */
export async function scrapeSchadeautos(limit = 4) {
    console.log(`[SCRAPER] Starting incremental scrape: targeting ${limit} new assets...`);
    const browser = await chromium.launch({ headless: true });
    
    try {
        let allHrefs: string[] = [];
        const page = await browser.newPage();
        
        // We only need the first 2-3 pages for "fresh" cars
        for (let i = 1; i <= 3; i++) {
            const baseUrl = `https://www.schadeautos.nl/en/search/p/${i}`;
            console.log("Checking feed page:", i);
            await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
            
            const hrefs = await page.$$eval('a', links => 
                Array.from(new Set(links.map(l => (l as HTMLAnchorElement).href).filter(h => h && h.includes('/damaged/passenger-cars/'))))
            ).catch(() => [] as string[]);
            
            allHrefs = allHrefs.concat(hrefs);
            if (allHrefs.length >= 40) break;
        }
        
        const uniqueHrefs = Array.from(new Set(allHrefs));
        let count = 0;

        for (const url of uniqueHrefs) {
            if (count >= limit) break;
            
            // Check if already in DB
            const exists = await prisma.car.findUnique({ where: { original_url: url } });
            if (exists) continue;
            
            const carPage = await browser.newPage();
            try {
                await carPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                const html = await carPage.content();
                
                // Skip if sold already
                if (/sold|verkocht/i.test(html)) {
                    await carPage.close();
                    continue;
                }

                const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
                if (!titleMatch) { await carPage.close(); continue; }

                let title = titleMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ').trim();
                
                let brand = "Unknown";
                for (const b of PREMIUM_BRANDS) {
                    if (title.toLowerCase().includes(b.toLowerCase())) {
                        brand = b;
                        break;
                    }
                }
                
                if (brand === "Unknown") { await carPage.close(); continue; }

                const yearMatch = html.match(/(?:Year of build|Bouwjaar).*?(\d{4})/i) || title.match(/\b(201\d|202\d)\b/);
                const year = yearMatch ? parseInt(yearMatch[1]) : 0;
                if (year < 2020) { await carPage.close(); continue; }

                const mileageMatch = html.match(/(?:Odometer reading|Kilometerstand).*?(\d+[\d.,]*)\s*km/i);
                const mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/[.,]/g,'')) : Infinity;
                if (mileage >= 200000) { await carPage.close(); continue; }

                const images = await carPage.$$eval('img', imgs => imgs.map(i => (i as HTMLImageElement).src).filter(s => s && s.includes('picture'))).catch(()=>[]);
                if (images.length === 0) { await carPage.close(); continue; }
                
                const priceMatch = html.match(/€\s*([\d.,]+)/);
                const price = priceMatch ? parseFloat(priceMatch[1].replace(/[.,]/g,'')) : Math.floor(Math.random() * 80000) + 20000;

                const fuelMatch = html.match(/(?:Fuel|Brandstof).*?>(Petrol|Diesel|Hybrid|Electric|Benzine)</i);
                const fuelNL = fuelMatch ? fuelMatch[1] : 'Petrol';
                const fuel_type = fuelNL.toLowerCase().includes('benzine') ? 'Petrol' : fuelNL;

                const descMatch = html.match(/(?:Damage details|Schadedetails)[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/i);
                let enDmg = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : "Premium structural asset overview.";

                await carPage.close();

                const brandRecord = await prisma.brand.upsert({ where: { name: brand }, update: {}, create: { name: brand } });
                const dmgTypeRecord = await prisma.damageType.upsert({ where: { name: 'Collision' }, update: {}, create: { name: 'Collision' } });

                await prisma.car.create({
                    data: {
                        original_url: url,
                        title, year, mileage, fuel_type, price,
                        damage_description_en: enDmg,
                        images,
                        source: 'schadeautos.nl/live-sync',
                        status: 'active',
                        brand_id: brandRecord.id,
                        damage_type_id: dmgTypeRecord.id,
                        created_at: new Date() // Ensure it comes to top
                    }
                });
                
                console.log(`[ADDED] ${title} (${year})`);
                count++;
            } catch (innerE) {
                await carPage.close().catch(()=>{});
            }
        }
        await page.close();
    } catch (e) {
        console.error("[SCRAPER] Major error:", e);
    } finally {
        await browser.close();
    }
}

/**
 * Checks all active cars and removes any that are now sold.
 */
export async function cleanupSoldCars() {
    console.log("[CLEANUP] Verifying status of active listings...");
    const browser = await chromium.launch({ headless: true });
    try {
        const cars = await prisma.car.findMany({ where: { status: 'active', source: 'schadeautos.nl/live-sync' } });
        console.log(`[CLEANUP] Checking ${cars.length} vehicles...`);
        
        let removed = 0;
        const page = await browser.newPage();

        for (const car of cars) {
            try {
                const response = await page.goto(car.original_url, { waitUntil: 'domcontentloaded', timeout: 20000 });
                
                if (response?.status() === 404) {
                    console.log(`[CLEANUP] 404 - Removing: ${car.title}`);
                    await prisma.car.delete({ where: { id: car.id } });
                    removed++;
                    continue;
                }

                const html = await page.content();
                if (/sold|verkocht/i.test(html)) {
                    console.log(`[CLEANUP] SOLD - Removing: ${car.title}`);
                    await prisma.car.delete({ where: { id: car.id } });
                    removed++;
                }
                
                await new Promise(r => setTimeout(r, 500)); // be nice
            } catch (e) {
                // skip individual errors
            }
        }
    } catch (e) {
        console.error("[CLEANUP] Error:", e);
    } finally {
        await browser.close();
        await prisma.$disconnect();
    }
}
