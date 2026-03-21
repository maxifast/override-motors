import { chromium } from 'playwright';
async function testH() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  const url = 'https://www.schadeautos.nl/en/damaged/passenger-cars/volkswagen-id-4-pro-77-kwh/o/1753051';
  console.log("Navigating to:", url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const html = await page.content();
  
  // Title test
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : '';
  console.log("Original Title:", title);
  title = title.replace(/Damaged\s*(car|commercial vehicles|vehicle)?/i, '').trim();
  console.log("Cleaned Title:", title);
  
  // Mileage test
  const mileageMatch1 = html.match(/(?:Odometer reading|Kilometerstand)[\s\S]{0,100}?(\d+[\d.,]*)(?:\s*km)?/i);
  console.log("Regex 1 match:", mileageMatch1 ? mileageMatch1[1] : 'null');
  
  // More specific DOM approach
  const odo = await page.$$eval('th, td, div, span', els => {
      for(let i=0; i<els.length; i++) {
          if (els[i].textContent?.toLowerCase().includes('odometer') || els[i].textContent?.toLowerCase().includes('kilometerstand')) {
              return els[i].nextElementSibling?.textContent || els[i].parentElement?.textContent;
          }
      }
      return null;
  });
  console.log("DOM search parent/sibling:", odo);

  await browser.close();
}
testH();
