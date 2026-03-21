import { chromium } from 'playwright';
async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    console.log("Loading page 2...");
    await page.goto('https://www.schadeautos.nl/en/damaged/passenger-cars', { waitUntil: 'domcontentloaded' });
    
    // Find pagination links
    const nextLinks = await page.$$eval('.pagination a, .pages a, nav a', anchors => Array.from(anchors).map((a: any) => a.href));
    console.log("Pagination links:", nextLinks.slice(0, 5));
    
    // Find all car root nodes
    const carLinks = await page.$$eval('a', anchors => Array.from(anchors).map((a: any) => a.href).filter(h => h.includes('/o/')));
    console.log("Cars on page 1:", carLinks.length);
    if(carLinks.length > 0) console.log(carLinks[0]);

    await browser.close();
}
run();
