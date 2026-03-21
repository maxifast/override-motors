import { chromium } from 'playwright';
async function testUrl() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();
    
    const url = 'https://www.schadeautos.nl/en/search/damaged/passenger-cars+audi/1/1/6/0/46/0/1/0?p=2020-&odo=0-200000&fuel=electric';
    console.log("Navigating to:", url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Check results
    const cars = await page.$$eval('a', anchors => Array.from(anchors).map((a: any) => a.href).filter(h => h.includes('/o/')));
    console.log("Found cars count:", cars.length);
    if(cars.length > 0) {
        console.log("Cars:", Array.from(new Set(cars)).slice(0, 5));
    }
    await browser.close();
}
testUrl();
