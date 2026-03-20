import { chromium } from 'playwright';
(async () => {
    const b = await chromium.launch();
    const p = await b.newPage();
    await p.goto("https://www.schadeautos.nl/en/damaged-car", { waitUntil: 'domcontentloaded' });
    const hrefs = await p.$$eval('a', links => links.map(l => l.href).filter(h => h.includes('/damaged/passenger-cars/')));
    console.log(`Found ${hrefs.length} exact links`);
    if(hrefs.length > 0) console.log(hrefs[0]);
    await b.close();
})();
