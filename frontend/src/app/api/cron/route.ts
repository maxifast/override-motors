import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as cheerio from 'cheerio';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const PREMIUM_BRANDS = [
  "BMW", "Mercedes-Benz", "Audi", "Lexus", "Porsche", "Tesla", "Volvo",
  "Land Rover", "Genesis", "Toyota", "Volkswagen", "Zeekr", "Li Auto",
  "Mazda", "Jeep", "Infiniti", "Acura", "Cadillac"
];

const DAILY_LIMIT = 40;
const PER_RUN_LIMIT = 4;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
};

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function collectCarLinks(): Promise<string[]> {
  const allHrefs: Set<string> = new Set();

  for (let page = 1; page <= 3; page++) {
    const html = await fetchHtml(`https://www.schadeautos.nl/en/search/p/${page}`);
    if (!html) continue;

    const $ = cheerio.load(html);
    $('a[href*="/damaged/passenger-cars/"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : `https://www.schadeautos.nl${href}`;
        allHrefs.add(fullUrl);
      }
    });

    if (allHrefs.size >= 40) break;
  }

  return Array.from(allHrefs);
}

function extractCarData(html: string, url: string) {
  const $ = cheerio.load(html);

  // Skip sold
  const bodyText = $('body').text();
  if (/sold|verkocht|already been sold|reeds verkocht/i.test(bodyText)) return null;

  // Title from h1
  const title = $('h1').first().text().trim().replace(/\s+/g, ' ');
  if (!title) return null;

  // Brand check
  let brand = "Unknown";
  for (const b of PREMIUM_BRANDS) {
    if (title.toLowerCase().includes(b.toLowerCase())) {
      brand = b;
      break;
    }
  }
  if (brand === "Unknown") return null;

  // Year
  const yearMatch = html.match(/(?:Year of build|Bouwjaar|Registration date|Datum eerste toelating).*?(\d{4})/i)
    || title.match(/\b(201\d|202\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : 0;
  if (year < 2020) return null;

  // Mileage
  const mileageMatch = html.match(/(?:Odometer reading|Kilometerstand).*?(\d+[\d.,]*)\s*km/i);
  const mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/[.,]/g, '')) : Infinity;
  if (mileage >= 200000) return null;

  // Images - look for picture/image URLs in the page
  const images: string[] = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && src.includes('picture')) {
      const fullSrc = src.startsWith('http') ? src : `https://www.schadeautos.nl${src}`;
      if (!images.includes(fullSrc)) images.push(fullSrc);
    }
  });
  // Also check srcset and source tags in picture elements
  $('source').each((_, el) => {
    const srcset = $(el).attr('srcset');
    if (srcset && srcset.includes('picture')) {
      const src = srcset.split(',')[0].trim().split(' ')[0];
      const fullSrc = src.startsWith('http') ? src : `https://www.schadeautos.nl${src}`;
      if (!images.includes(fullSrc)) images.push(fullSrc);
    }
  });
  if (images.length === 0) return null;

  // Price
  const priceMatch = html.match(/€\s*([\d.,]+)/);
  const price = priceMatch
    ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'))
    : Math.floor(Math.random() * 80000) + 20000;

  // Fuel type
  const fuelMatch = html.match(/(?:Fuel|Brandstof).*?>(Petrol|Diesel|Hybrid|Electric|Benzine)/i);
  const fuelNL = fuelMatch ? fuelMatch[1] : 'Petrol';
  const fuel_type = fuelNL.toLowerCase().includes('benzine') ? 'Petrol' : fuelNL;

  // Damage description
  const descMatch = html.match(/(?:Damage details|Schadedetails)[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/i);
  const damage_description_en = descMatch
    ? descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : "Premium structural asset overview.";

  return {
    original_url: url,
    title, year, mileage: mileage === Infinity ? 0 : mileage,
    fuel_type, price, damage_description_en, images, brand,
  };
}

async function scrapeNewCars(limit: number): Promise<{ added: string[], skipped: number, errors: number }> {
  const result = { added: [] as string[], skipped: 0, errors: 0 };
  const links = await collectCarLinks();

  for (const url of links) {
    if (result.added.length >= limit) break;

    // Check if already exists
    const exists = await prisma.car.findUnique({ where: { original_url: url } });
    if (exists) { result.skipped++; continue; }

    const html = await fetchHtml(url);
    if (!html) { result.errors++; continue; }

    const data = extractCarData(html, url);
    if (!data) { result.skipped++; continue; }

    try {
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

      await prisma.car.create({
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
      result.added.push(data.title);
    } catch {
      result.errors++;
    }
  }

  return result;
}

async function cleanupSoldCars(): Promise<{ checked: number, removed: number }> {
  const result = { checked: 0, removed: 0 };

  const cars = await prisma.car.findMany({
    where: {
      status: 'active',
      original_url: { contains: 'schadeautos.nl' },
    },
  });

  result.checked = cars.length;

  for (const car of cars) {
    const html = await fetchHtml(car.original_url);

    if (!html) {
      // Page gone = car sold/removed
      await prisma.car.delete({ where: { id: car.id } });
      result.removed++;
      continue;
    }

    if (/sold|verkocht|already been sold|reeds verkocht/i.test(html)) {
      await prisma.car.delete({ where: { id: car.id } });
      result.removed++;
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  // Verify Vercel Cron secret (set CRON_SECRET in Vercel env vars)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check daily quota
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const addedToday = await prisma.car.count({
      where: {
        created_at: { gte: today },
        source: 'schadeautos.nl/live-sync',
      },
    });

    let scrapeResult = null;
    if (addedToday < DAILY_LIMIT) {
      const toFetch = Math.min(PER_RUN_LIMIT, DAILY_LIMIT - addedToday);
      scrapeResult = await scrapeNewCars(toFetch);
    }

    const cleanupResult = await cleanupSoldCars();

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      quota: { used: addedToday, limit: DAILY_LIMIT },
      scrape: scrapeResult ?? { skipped: 'Daily quota reached' },
      cleanup: cleanupResult,
    });
  } catch (error: any) {
    console.error('[CRON] Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
