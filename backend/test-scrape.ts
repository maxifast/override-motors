import { chromium } from 'playwright';
async function testSearch() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Navigating to search page...");
  await page.goto('https://www.schadeautos.nl/en/search/p/1', { waitUntil: 'domcontentloaded', timeout: 30000 });
  const html = await page.content();
  console.log("HTML length:", html.length);
  
  if (html.includes('Cloudflare') || html.includes('Too Many Requests') || html.includes('captcha')) {
      console.log("BLOCKED BY CLOUDFLARE/RATE LIMITING");
  } else {
      console.log("Page loaded. Looking for links...");
      const hrefs = await page.$$eval('a', links => links.map((a: any) => a.href).filter((h: string) => h.includes('/damaged/')));
      console.log("Found links:", hrefs.length, hrefs.slice(0, 5));
  }
  await browser.close();
}
testSearch();
