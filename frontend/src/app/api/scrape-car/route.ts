import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as cheerio from 'cheerio';

export const maxDuration = 10;
export const dynamic = 'force-dynamic';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
};

const PREMIUM_BRANDS = [
  "BMW", "Mercedes-Benz", "Audi", "Lexus", "Porsche", "Tesla", "Volvo",
  "Land Rover", "Genesis", "Toyota", "Volkswagen", "Zeekr", "Li Auto",
  "Mazda", "Jeep", "Infiniti", "Acura", "Cadillac"
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

    // Grab the oldest pending item from the queue
    const item = await prisma.scrapeQueue.findFirst({
      where: { status: 'pending' },
      orderBy: { created_at: 'asc' },
    });

    if (!item) {
      return NextResponse.json({ ok: true, message: 'Queue empty — nothing to process' });
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
      return NextResponse.json({ ok: true, message: 'Already in DB, skipped', url: item.url });
    }

    // Fetch the car detail page
    const res = await fetch(item.url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) {
      await prisma.scrapeQueue.update({
        where: { id: item.id },
        data: { status: item.attempts >= 2 ? 'failed' : 'pending' },
      });
      return NextResponse.json({ ok: false, error: `Fetch ${res.status}`, url: item.url });
    }

    const html = await res.text();
    const data = extractCarData(html, item.url);

    if (!data) {
      // Doesn't match criteria (sold, wrong brand, old year, etc.)
      await prisma.scrapeQueue.update({
        where: { id: item.id },
        data: { status: 'done', processed_at: new Date() },
      });
      return NextResponse.json({ ok: true, message: 'Filtered out (criteria mismatch)', url: item.url });
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

    return NextResponse.json({
      ok: true,
      action: 'added',
      car: { id: car.id, title: data.title, year: data.year, price: data.price },
    });
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
  const mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/[.,]/g, '')) : 0;
  if (mileage >= 200000) return null;

  // Images — save direct links from schadeautos.nl (no re-upload = fast)
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

  // Price
  const priceMatch = html.match(/€\s*([\d.,]+)/);
  const price = priceMatch
    ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'))
    : 0;

  // Fuel type
  const fuelMatch = html.match(/(?:Fuel|Brandstof).*?>(Petrol|Diesel|Hybrid|Electric|Benzine)/i);
  const fuelNL = fuelMatch ? fuelMatch[1] : 'Petrol';
  const fuel_type = fuelNL.toLowerCase().includes('benzine') ? 'Petrol' : fuelNL;

  // Damage description
  const descMatch = html.match(/(?:Damage details|Schadedetails)[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/i);
  const damage_description_en = descMatch
    ? descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : "Structural damage — see original listing for details.";

  return {
    original_url: url,
    title, year, mileage, fuel_type, price, damage_description_en, images, brand,
  };
}
