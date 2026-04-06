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

// Brand slugs as they appear on schadeautos.nl
const BRAND_SLUGS = [
  "bmw", "mercedes-benz", "audi", "lexus", "porsche", "tesla", "volvo",
  "land-rover", "genesis", "toyota", "volkswagen", "zeekr",
  "mazda", "jeep", "infiniti", "acura", "cadillac",
  "lucid", "polestar", "rivian"
];

/**
 * STEP 1: Brand-by-brand catalog scanner.
 * Visits schadeautos.nl brand pages directly to find all cars.
 * Each run scans 3 brands (rotating). Covers all 20 brands in ~7 runs.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const keyParam = request.nextUrl.searchParams.get('key');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}` && keyParam !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureQueueTable();

    // Optional: full queue reset via ?reset=true
    const resetParam = request.nextUrl.searchParams.get('reset');
    if (resetParam === 'true') {
      await prisma.scrapeQueue.deleteMany({});
    }

    // Cleanup: remove old done/failed entries (older than 12h) and reset stuck "processing" items
    const halfDayAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    await prisma.scrapeQueue.deleteMany({
      where: { status: { in: ['done', 'failed'] }, created_at: { lt: halfDayAgo } },
    }).catch(() => {});
    await prisma.scrapeQueue.updateMany({
      where: { status: 'processing', created_at: { lt: halfDayAgo } },
      data: { status: 'pending', attempts: 0 },
    }).catch(() => {});

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const addedToday = await prisma.car.count({
      where: { created_at: { gte: today }, source: 'schadeautos.nl/live-sync' },
    });
    if (addedToday >= 40) {
      return NextResponse.json({ ok: true, message: 'Daily quota reached', addedToday });
    }

    // Allow forcing specific brand via ?brand= param (for testing)
    const forceBrand = request.nextUrl.searchParams.get('brand');
    let brandsToScan: string[];
    if (forceBrand) {
      brandsToScan = [forceBrand];
    } else {
      // Rotate: scan 3 brands per run based on hour
      const hour = new Date().getUTCHours();
      const startIdx = (hour * 3) % BRAND_SLUGS.length;
      brandsToScan = [];
      for (let i = 0; i < 3; i++) {
        brandsToScan.push(BRAND_SLUGS[(startIdx + i) % BRAND_SLUGS.length]);
      }
    }

    const allUrls: string[] = [];
    const scannedBrands: string[] = [];

    for (const brand of brandsToScan) {
      // Use Dutch brand page — server-rendered, shows all cars for that brand
      const url = `https://www.schadeautos.nl/nl/schadeauto/${brand}`;
      const res = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(8000),
      }).catch(() => null);
      if (!res || !res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Extract all car detail links with /o/ pattern
      $('a[href*="/o/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('/schade/personenautos/')) {
          // Convert Dutch URL to English format for consistency
          const full = href.startsWith('http') ? href : `https://www.schadeautos.nl${href}`;
          const normalized = full.replace('/nl/schade/personenautos/', '/en/damaged/passenger-cars/');
          if (!allUrls.includes(normalized)) allUrls.push(normalized);
        }
      });

      scannedBrands.push(brand);
    }

    // Queue new URLs
    let queued = 0;
    for (const url of allUrls) {
      const existsInCars = await prisma.car.findUnique({ where: { original_url: url } });
      if (existsInCars) continue;
      const existsInQueue = await prisma.scrapeQueue.findUnique({ where: { url } });
      if (existsInQueue) continue;

      await prisma.scrapeQueue.create({ data: { url } });
      queued++;
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      scannedBrands,
      found: allUrls.length,
      newQueued: queued,
      dailyQuota: `${addedToday}/40`,
    });
  } catch (error: any) {
    console.error('[SCRAPE-LIST]', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

async function ensureQueueTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ScrapeQueue" (
        "id" SERIAL PRIMARY KEY,
        "url" TEXT UNIQUE NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "attempts" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "processed_at" TIMESTAMPTZ
      )
    `;
  } catch {
    // Table likely already exists
  }
}
