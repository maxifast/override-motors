import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const maxDuration = 10;
export const dynamic = 'force-dynamic';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

/**
 * STEP 3: Sold car cleanup.
 * Checks ONE active scraped car per call.
 * If the original listing is sold/removed, deletes it from our DB.
 * Runs every 20 minutes via Vercel Cron (alongside scrape-car).
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
    // Get the oldest active scraped car that hasn't been checked recently
    // We use updated_at as a "last checked" marker
    const car = await prisma.car.findFirst({
      where: {
        status: 'active',
        source: 'schadeautos.nl/live-sync',
      },
      orderBy: { updated_at: 'asc' }, // Check oldest-checked first
    });

    if (!car) {
      return NextResponse.json({ ok: true, message: 'No scraped cars to check' });
    }

    // Touch updated_at so this car goes to the back of the check queue
    await prisma.car.update({
      where: { id: car.id },
      data: { updated_at: new Date() },
    });

    // Fetch the original listing
    let isSold = false;
    try {
      const res = await fetch(car.original_url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(7000),
        redirect: 'follow',
      });

      if (!res.ok) {
        // 404 or other error = listing removed
        isSold = true;
      } else {
        const html = await res.text();
        const finalUrl = res.url;

        // Check for redirect to search page (listing no longer exists)
        const isRedirected = finalUrl.includes('/search/') ||
          finalUrl.endsWith('/en') || finalUrl.endsWith('/nl') ||
          finalUrl.endsWith('/en/') || finalUrl.endsWith('/nl/');

        // Check for sold text
        const hasSoldText = /sold|verkocht|already been sold|reeds verkocht/i.test(html);

        if (isRedirected || hasSoldText) {
          isSold = true;
        }
      }
    } catch {
      // Network error — don't delete, might be temporary
      return NextResponse.json({
        ok: true,
        action: 'skipped',
        reason: 'network_error',
        car: { id: car.id, title: car.title },
      });
    }

    if (isSold) {
      await prisma.car.delete({ where: { id: car.id } });
      // Also clean up from queue if present
      await prisma.scrapeQueue.deleteMany({ where: { url: car.original_url } }).catch(() => {});

      return NextResponse.json({
        ok: true,
        action: 'removed',
        car: { id: car.id, title: car.title },
      });
    }

    return NextResponse.json({
      ok: true,
      action: 'still_active',
      car: { id: car.id, title: car.title },
    });
  } catch (error: any) {
    console.error('[CLEANUP]', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
