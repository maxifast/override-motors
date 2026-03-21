import { scrapeSchadeautos, cleanupSoldCars } from './scraper';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();
const TIMEZONE = "Europe/Madrid";

/**
 * Automates the vehicle lifecycle:
 * 1. Checks daily quota (max 40 cars/day)
 * 2. Scrapes 4 fresh cars every 30 mins if under quota
 * 3. Verifies status of all active listings and removes sold ones
 */
async function runJob() {
    console.log(`[JOB] Starting sync/cleanup cycle at ${new Date().toLocaleString('en-US', { timeZone: TIMEZONE })}`);
    
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count how many cars were added today (UTC-relative but safe for daily quota)
        const addedToday = await prisma.car.count({
            where: {
                created_at: { gte: today },
                source: 'schadeautos.nl/live-sync'
            }
        });

        if (addedToday >= 40) {
            console.log(`[SCHEDULER] Daily quota reached (${addedToday}/40). Skipping limited scrape.`);
        } else {
            const remaining = 40 - addedToday;
            const toFetch = Math.min(4, remaining);
            console.log(`[SCHEDULER] Status: ${addedToday}/40 added today. Fetching ${toFetch} more...`);
            await scrapeSchadeautos(toFetch);
        }

        // Run thorough cleanup of status
        await cleanupSoldCars();
        
        console.log("[JOB] Cycle completed successfully.");
    } catch (err) {
        console.error("[JOB] Error during execution:", err);
    }
}

// Scheduled for every 30 minutes at :00 and :30, between 08:00 and 22:00 Madrid time
cron.schedule('0,30 8-22 * * *', () => {
    runJob().catch(console.error);
}, {
    timezone: TIMEZONE
});

console.log(`[SCHEDULER] Override Motors Automation Service Start.`);
console.log(`[SCHEDULER] Config: 8:00-22:00 Madrid | Every 30 mins | 4 cars per run | 40 max/day`);

// Trigger first run immediately
runJob().catch(console.error);
