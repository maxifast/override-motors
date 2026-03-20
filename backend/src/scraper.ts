import { chromium } from 'playwright';
import { translate } from '@vitalets/google-translate-api';
import { prisma } from './index';

const PREMIUM_BRANDS = ["Porsche", "Audi", "BMW", "Mercedes-Benz", "Land Rover", "Lexus", "Toyota", "Honda"];

export async function scrapeSchadeautos() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto("https://www.schadeautos.nl/en/search");
        
        // PSEUDO-CODE logic representing extraction based on the target DOM structure
        const cars = await page.locator('.car-item').all();
        
        for (const carDom of cars) {
            const brand = await carDom.locator('.brand-name').innerText().catch(() => '');
            if (!PREMIUM_BRANDS.includes(brand)) continue;
            
            const original_url = await carDom.locator('a').getAttribute('href');
            if (!original_url) continue;
            
            const exists = await prisma.car.findUnique({ where: { original_url } });
            if (exists) continue;
            
            const nl_description = await carDom.locator('.damage-info').innerText().catch(() => '');
            let en_description = '';
            if (nl_description) {
                const { text } = await translate(nl_description, { to: 'en' });
                en_description = text;
            }
            
            // Upsert brand & damage type dynamically
            const brandRecord = await prisma.brand.upsert({
                where: { name: brand },
                update: {},
                create: { name: brand }
            });
            
            const damageType = await carDom.locator('.damage-tag').innerText().catch(() => 'Collision');
            const damageRecord = await prisma.damageType.upsert({
                where: { name: damageType },
                update: {},
                create: { name: damageType }
            });

            await prisma.car.create({
                data: {
                    original_url,
                    title: await carDom.locator('.title').innerText(),
                    year: parseInt(await carDom.locator('.year').innerText().catch(() => '2020')),
                    mileage: parseInt(await carDom.locator('.mileage').innerText().catch(() => '10000')),
                    fuel_type: await carDom.locator('.fuel').innerText().catch(() => 'Diesel'),
                    price: parseFloat(await carDom.locator('.price').innerText().catch(() => '0')),
                    damage_description_en: en_description,
                    status: 'pending_publish',
                    source: 'scraped_schadeautos',
                    is_pinned: false,
                    brand_id: brandRecord.id,
                    damage_type_id: damageRecord.id,
                    images: [await carDom.locator('img').getAttribute('src') || '']
                }
            });
        }
    } catch (e) {
        console.error("Scraping error:", e);
    } finally {
        await browser.close();
    }
}
