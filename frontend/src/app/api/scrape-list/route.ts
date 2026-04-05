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
  "bmw", "mercedes-benz", "mercedes", "audi", "lexus", "porsche", "tesla", "volvo",
  "land rover", "genesis", "toyota", "volkswagen", "zeekr", "li auto",
  "mazda", "jeep", "infiniti", "acura", "cadillac"
];

/**
 * STEP 1: Lightweight catalog scanner.
 * Fetches ONE page of search results from schadeautos.nl,
 * filters by premium brands, and queues new URLs for processing.
 * Runs every 2 hours via Vercel Cron.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure queue table exists (auto-create on first run)
    await ensureQueueTable();

    // Check daily quota
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const addedToday = await prisma.car.count({
      where: { created_at: { gte: today }, source: 'schadeautos.nl/live-sync' },
    });
    if (addedToday >= 40) {
      return NextResponse.json({ ok: true, message: 'Daily quota reached', addedToday });
    }

    // Scan only page 1 (lightweight — fits in 10s)
    const res = await fetch('https://www.schadeautos.nl/en/search/p/1', {
      headers: HEADERS,
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `Fetch failed: ${res.status}` }, { status: 502 });
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    const hrefs: string[] = [];
    $('a[href*="/damaged/passenger-cars/"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        const full = href.startsWith('http') ? href : `https://www.schadeautos.nl${href}`;
        if (!hrefs.includes(full)) hrefs.push(full);
      }
    });

    // Pre-filter: only queue URLs that contain a premium brand keyword in the URL slug
    const filtered = hrefs.filter(url => {
      const slug = url.toLowerCase();
      return PREMIUM_BRANDS.some(b => slug.includes(b.replace(/\s+/g, '-')));
    });

    // Queue new URLs (skip those already in cars or queue)
    let queued = 0;
    for (const url of filtered) {
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
      found: hrefs.length,
      premiumFiltered: filtered.length,
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
