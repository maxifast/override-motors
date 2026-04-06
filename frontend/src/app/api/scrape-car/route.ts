import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as cheerio from 'cheerio';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
};

const PREMIUM_BRANDS = [
  "BMW", "Mercedes-Benz", "Audi", "Lexus", "Porsche", "Tesla", "Volvo",
  "Land Rover", "Genesis", "Toyota", "Volkswagen", "Zeekr", "Li Auto",
  "Mazda", "Jeep", "Infiniti", "Acura", "Cadillac", "Lucid", "Polestar", "Rivian"
];

/**
 * STEP 2: Single-car processor.
 * Takes ONE car from the scrape queue, fetches its page,
 * extracts data, and saves to the cars table.
 * Runs every 20 minutes via Vercel Cron.
 * One car per call = safely within 10s timeout.
 */
export async function GET(request: NextRequest) {
  // Auth: accepts both Vercel Cron header and ?key= param (for cron-job.org)
  const authHeader = request.headers.get('authorization');
  const keyParam = request.nextUrl.searchParams.get('key');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}` && keyParam !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check daily quota
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const addedToday = await prisma.car.count({
      where: { created_at: { gte: today }, source: 'schadeautos.nl/live-sync' },
    });
    if (addedToday >= 40) {
      return NextResponse.json({ ok: true, message: 'Daily quota reached', addedToday });
    }

    // Process up to 5 cars per call (batch mode for efficiency)
    const BATCH_SIZE = 5;
    const results: any[] = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      // Grab the oldest pending item from the queue
      const item = await prisma.scrapeQueue.findFirst({
        where: { status: 'pending' },
        orderBy: { created_at: 'asc' },
      });

      if (!item) {
        results.push({ message: 'Queue empty' });
        break;
      }

      // Mark as processing
      await prisma.scrapeQueue.update({
        where: { id: item.id },
        data: { status: 'processing', attempts: { increment: 1 } },
      });

      // Double-check: not already in cars table
      const existsInCars = await prisma.car.findUnique({ where: { original_url: item.url } });
      if (existsInCars) {
        await prisma.scrapeQueue.update({
          where: { id: item.id },
          data: { status: 'done', processed_at: new Date() },
        });
        results.push({ action: 'skipped', reason: 'already_in_db', url: item.url });
        continue;
      }

      // Fetch the car detail page
      let res;
      try {
        res = await fetch(item.url, {
          headers: HEADERS,
          signal: AbortSignal.timeout(8000),
        });
      } catch {
        await prisma.scrapeQueue.update({
          where: { id: item.id },
          data: { status: item.attempts >= 2 ? 'failed' : 'pending' },
        });
        results.push({ action: 'fetch_error', url: item.url });
        continue;
      }

      if (!res.ok) {
        await prisma.scrapeQueue.update({
          where: { id: item.id },
          data: { status: item.attempts >= 2 ? 'failed' : 'pending' },
        });
        results.push({ action: 'fetch_error', status: res.status, url: item.url });
        continue;
      }

      const html = await res.text();
      const data = extractCarData(html, item.url);

      if (!data) {
        await prisma.scrapeQueue.update({
          where: { id: item.id },
          data: { status: 'done', processed_at: new Date() },
        });
        results.push({ action: 'filtered_out', url: item.url });
        continue;
      }

      // Save car to DB
      const brandRecord = await prisma.brand.upsert({
        where: { name: data.brand },
        update: {},
        create: { name: data.brand },
      });
      const dmgTypeRecord = await prisma.damageType.upsert({
        where: { name: 'Collision' },
        update: {},
        create: { name: 'Collision' },
      });

      const car = await prisma.car.create({
        data: {
          original_url: data.original_url,
          title: data.title,
          year: data.year,
          mileage: data.mileage,
          fuel_type: data.fuel_type,
          price: data.price,
          damage_description_en: data.damage_description_en,
          images: data.images,
          source: 'schadeautos.nl/live-sync',
          status: 'active',
          brand_id: brandRecord.id,
          damage_type_id: dmgTypeRecord.id,
        },
      });

      await prisma.scrapeQueue.update({
        where: { id: item.id },
        data: { status: 'done', processed_at: new Date() },
      });

      results.push({
        action: 'added',
        car: { id: car.id, title: data.title, year: data.year, price: data.price },
      });
    }

    return NextResponse.json({ ok: true, processed: results.length, results });
  } catch (error: any) {
    console.error('[SCRAPE-CAR]', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

function extractCarData(html: string, url: string) {
  const $ = cheerio.load(html);

  // Skip sold
  const bodyText = $('body').text();
  if (/sold|verkocht|already been sold|reeds verkocht/i.test(bodyText)) return null;

  // Title from h1 — replace <br> with space before getting text
  const h1El = $('h1').first();
  h1El.find('br').replaceWith(' ');
  let title = h1El.text().trim().replace(/\s+/g, ' ');
  // Remove "Damaged car" / "Schadeauto" prefix
  title = title.replace(/^(Damaged car|Schadeauto)\s*/i, '').trim();
  if (!title) return null;

  // Brand check — also check model dd field
  const modelText = (getSpecValue($, 'model') || '').toLowerCase();
  let brand = "Unknown";
  for (const b of PREMIUM_BRANDS) {
    const bl = b.toLowerCase();
    if (title.toLowerCase().includes(bl) || modelText.includes(bl)) {
      brand = b;
      break;
    }
  }
  if (brand === "Unknown") return null;

  // === Parse specs from <dt>/<dd> pairs ===

  // Year — field is "ERD:" (EN) or "1ste toelating:" (NL) or "Bouwjaar:" etc.
  const erdValue = getSpecValue($, 'erd') || getSpecValue($, '1ste toelating')
    || getSpecValue($, 'bouwjaar') || getSpecValue($, 'year of build')
    || getSpecValue($, 'registration date') || getSpecValue($, 'datum eerste toelating');
  const yearMatch = erdValue?.match(/(\d{4})/) || title.match(/\b(202\d|201\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : 0;
  if (year < 2020) return null;

  // Mileage — field is "mileage:" (EN) or "tellerstand:" or "kilometerstand:" (NL)
  const mileageValue = getSpecValue($, 'mileage') || getSpecValue($, 'tellerstand')
    || getSpecValue($, 'kilometerstand') || getSpecValue($, 'odometer');
  const mileageMatch = mileageValue?.match(/([\d.,]+)/);
  const mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/[.,]/g, '')) : 0;
  if (mileage >= 200000) return null;

  // Images — save direct links from schadeautos.nl
  const images: string[] = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && src.includes('picture')) {
      const fullSrc = src.startsWith('http') ? src : `https://www.schadeautos.nl${src}`;
      if (!images.includes(fullSrc)) images.push(fullSrc);
    }
  });
  $('source').each((_, el) => {
    const srcset = $(el).attr('srcset');
    if (srcset && srcset.includes('picture')) {
      const src = srcset.split(',')[0].trim().split(' ')[0];
      const fullSrc = src.startsWith('http') ? src : `https://www.schadeautos.nl${src}`;
      if (!images.includes(fullSrc)) images.push(fullSrc);
    }
  });
  if (images.length === 0) return null;

  // Price — from "sales price" dt/dd or fallback to € in page
  const priceValue = getSpecValue($, 'sales price') || getSpecValue($, 'verkoopprijs');
  const priceMatch = priceValue?.match(/€?\s*([\d.,]+)/) || html.match(/€\s*([\d.,]+)/);
  const price = priceMatch
    ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'))
    : 0;

  // Fuel type — field is "fuel:" (EN) or "brandstof:" (NL)
  const fuelValue = getSpecValue($, 'fuel') || getSpecValue($, 'brandstof') || '';
  const fuelLower = fuelValue.toLowerCase().trim();
  let fuel_type = 'Petrol';
  if (fuelLower.includes('electric') || fuelLower.includes('elektrisch')) fuel_type = 'Electric';
  else if (fuelLower.includes('hybrid') || fuelLower.includes('hybride')) fuel_type = 'Hybrid';
  else if (fuelLower.includes('diesel')) fuel_type = 'Diesel';
  else if (fuelLower.includes('lpg')) fuel_type = 'LPG';
  else if (fuelLower.includes('cng')) fuel_type = 'CNG';
  else if (fuelLower.includes('petrol') || fuelLower.includes('benzine')) fuel_type = 'Petrol';

  // Damage description — from "damages:" or "schades:" dd
  const damageValue = getSpecValue($, 'damages') || getSpecValue($, 'schades')
    || getSpecValue($, 'damage details') || getSpecValue($, 'schadedetails');
  const damage_description_en = damageValue
    ? damageValue.replace(/\s+/g, ' ').trim()
    : "Structural damage — see original listing for details.";

  return {
    original_url: url,
    title, year, mileage, fuel_type, price, damage_description_en, images, brand,
  };
}

/**
 * Helper: find a spec value by label from the page.
 * Supports BOTH structures used by schadeautos.nl:
 *   - <tr><td>label:</td><td>value</td></tr>  (actual structure!)
 *   - <dt>label:</dt><dd>value</dd>            (fallback)
 */
function getSpecValue($: cheerio.CheerioAPI, label: string): string | null {
  const labelLower = label.toLowerCase();
  let value: string | null = null;

  // Strategy 1: table rows <tr><td>label</td><td>value</td></tr>
  $('tr').each((_, el) => {
    const tds = $(el).find('td');
    if (tds.length >= 2) {
      const labelCell = tds.eq(0).text().toLowerCase().replace(/:/g, '').trim();
      if (labelCell.includes(labelLower) || labelLower.includes(labelCell)) {
        const valCell = tds.eq(1);
        value = valCell.html()?.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim() || valCell.text().trim();
        return false; // break
      }
    }
  });
  if (value) return value;

  // Strategy 2: definition list <dt>label</dt><dd>value</dd>
  $('dt').each((_, el) => {
    const dtText = $(el).text().toLowerCase().replace(/:/g, '').trim();
    if (dtText && (dtText.includes(labelLower) || labelLower.includes(dtText))) {
      const dd = $(el).next('dd');
      if (dd.length) {
        value = dd.html()?.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim() || dd.text().trim();
        return false; // break
      }
    }
  });
  return value;
}
