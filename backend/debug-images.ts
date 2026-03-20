import { chromium } from 'playwright';
(async () => {
    const b = await chromium.launch();
    const p = await b.newPage();
    await p.goto("https://www.schadeautos.nl/nl/schade/personenautos/bmw-5-serie-540i-xdrive-luxury-line-leer-led/o/1756499", { waitUntil: 'domcontentloaded' });
    const imgs = await p.$$eval('img', imgs => imgs.map(i => i.src));
    console.log(imgs.filter(s => s.includes('1756499')));
    await b.close();
})();
