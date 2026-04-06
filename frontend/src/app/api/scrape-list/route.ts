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
  // Auth: accepts both Vercel Cron header and ?key= param (for cron-job.org)
  const authHeader = request.headers.get('authorization');
  const keyParam = request.nextUrl.searchParams.get('key');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}` && keyParam !== secret) {
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

    // Scan pages 1-3 (fits in 10s with lightweight fetches)
    const hrefs: string[] = [];
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(`https://www.schadeautos.nl/en/search/p/${page}`, {
        headers: HEADERS,
        signal: AbortSignal.timeout(3000),
      }).catch(() => null);
      if (!res || !res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      // Match both English and Dutch URL patterns
      $('a[href*="/passenger-cars/"], a[href*="/personenautos/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && (href.includes('/damaged/') || href.includes('/schade/'))) {
          const full = href.startsWith('http') ? href : `https://www.schadeautos.nl${href}`;
          if (!hrefs.includes(full)) hrefs.push(full);
        }
      });
      if (hrefs.length >= 40) break;
    }

    // Queue all car URLs — brand filtering happens in scrape-car when parsing the detail page
    let queued = 0;
    for (const url of hrefs) {
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
