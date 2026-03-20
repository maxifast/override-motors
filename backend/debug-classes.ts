import { chromium } from 'playwright';
(async () => {
    const b = await chromium.launch();
    const p = await b.newPage();
    await p.goto("https://www.schadeautos.nl/en/search", { waitUntil: 'domcontentloaded' });
    await p.selectOption('select[name="widget[make]"]', { label: 'Toyota' });
    await p.click('#srch_btn', { force: true });
    await p.waitForTimeout(3000);
    // Print classes of divs containing passenger-car links
    const classes = await p.$$eval('a[href*="/damaged/passenger-cars/"]', links => 
        Array.from(new Set(links.map(l => l.parentElement?.className || 'none')))
    );
    console.log(classes);
    await b.close();
})();
