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
  
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  
  const yearMatch = textContent.match(/(?:year|bouwjaar)[\s\S]{0,50}(202\d|201\d)/i);
  console.log("Year Regex test 1:", yearMatch ? yearMatch[0] : "null");

  const fuelMatch = textContent.match(/(?:fuel|brandstof)[\s\S]{0,50}(electric|hybrid|petrol|diesel)/i);
  console.log("Fuel Regex test 1:", fuelMatch ? fuelMatch[0] : "null");

  // Dump some labels directly
  const lines = html.split('\n');
  for(let l of lines) {
      const clean = l.replace(/<[^>]+>/g, '').trim();
      if(clean.length < 50 && (clean.toLowerCase().includes('year') || clean.toLowerCase().includes('fuel') || clean.includes('202') || clean.toLowerCase().includes('electric'))) {
          console.log("Possible label:", clean);
      }
  }

  await browser.close();
}
testH();
