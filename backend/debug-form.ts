import { chromium } from 'playwright';
(async () => {
    const b = await chromium.launch();
    const p = await b.newPage();
    await p.goto("https://www.schadeautos.nl/en/search", { waitUntil: 'domcontentloaded' });
    const selects = await p.$$eval('select', selects => selects.map(s => ({
        id: s.id, 
        name: s.name, 
        options: Array.from(s.options).slice(0, 5).map(o => o.text + ':' + o.value)
    })));
    console.log(JSON.stringify(selects, null, 2));
    
    const inputs = await p.$$eval('input', inputs => inputs.map(i => ({id: i.id, name: i.name, type: i.type})));
    console.log(JSON.stringify(inputs, null, 2));

    await b.close();
})();
