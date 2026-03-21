import { chromium } from 'playwright';
async function testUI() {
    console.log("Launching HEADLESS: FALSE browser...");
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto('https://www.schadeautos.nl/en/damaged/passenger-cars', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Check if we got the real list
    await page.waitForTimeout(5000); // let UI load
    const cars = await page.$$eval('a', anchors => Array.from(anchors).map((a: any) => a.href).filter(h => h.includes('/o/')));
    console.log(`Headless: false -> Found ${cars.length} cars on main page!`);
    
    await browser.close();
}
testUI();
