import { chromium } from 'playwright';
async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    console.log("Loading passenger cars...");
    // Just directly see how links are formatted on the main list
    await page.goto('https://www.schadeautos.nl/en/damaged/passenger-cars', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Dump all links inside the main container
    const links = await page.$$eval('#results a, .results a, ul.gallery a, .list a, a.car-link, a.item-link, a', anchors => Array.from(anchors).map((a: any) => a.href));
    
    console.log("Total ALL links:", links.length);
    const carLinks = Array.from(new Set(links.filter(h => h.includes('/o/'))));
    console.log("Found /o/ links:", carLinks.length);
    console.log(carLinks.slice(0, 10));
    
    await browser.close();
}
run();
