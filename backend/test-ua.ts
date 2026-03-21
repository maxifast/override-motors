import { chromium } from 'playwright';
async function testH() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Construct URL with filters: 
  // Schadautos search parameters can often be sent via POST or GET params if we know them.
  // Let's just go to the homepage and fill the form.
  await page.goto('https://www.schadeautos.nl/en/damaged/passenger-cars', { waitUntil: 'domcontentloaded' });
  
  // Select Year 2020:
  // Usually there's a select box for "bouwjaar" or "year"
  const html = await page.content();
  console.log("HTML len:", html.length, "includes e-tron:", html.toLowerCase().includes('audi'));
  
  const cars = await page.$$eval('a', anchors => Array.from(anchors).map((a: any) => a.href).filter(h => h.includes('/o/')));
  console.log("Cars array length:", cars.length);
  if(cars.length > 5) {
      console.log('Real listings found!', cars.slice(0, 3));
  } else {
      console.log('STILL BLOCKED. Only 5 fallback cars.');
  }

  await browser.close();
}
testH();
