import { chromium } from 'playwright';
async function testH() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  const url = 'https://www.schadeautos.nl/en/damaged/passenger-cars/volkswagen-id-4-pro-77-kwh/o/1753051';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const html = await page.content();
  
  // Dump texts containing "km"
  const lines = html.split('\n');
  console.log("Lines with 'km':");
  for(let l of lines) {
      if(l.toLowerCase().includes('km') && l.replace(/<[^>]+>/g, '').length < 100) {
          console.log(l.replace(/<[^>]+>/g, '').trim());
      }
  }

  // Dump properties table
  const props = await page.$$eval('#properties tr', trs => trs.map(tr => tr.textContent?.trim() || ''));
  console.log("Properties Table:", props.slice(0, 10));

  await browser.close();
}
testH();
