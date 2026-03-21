// Quick test runner for scrape-ev.ts 
console.log("Runner starting...");
require('dotenv').config();
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "SET" : "MISSING");
console.log("SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_KEY ? "SET" : "MISSING");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "MISSING");

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
    console.log("Testing Supabase Storage bucket...");
    const { data, error } = await supabase.storage.getBucket('car-images');
    if (error) {
        console.log("Bucket error:", error.message);
        if (error.message.includes('not found')) {
            console.log("Creating bucket...");
            const { error: createErr } = await supabase.storage.createBucket('car-images', { public: true });
            if (createErr) {
                console.log("CREATE FAILED:", createErr.message);
            } else {
                console.log("Bucket created OK!");
            }
        }
    } else {
        console.log("Bucket exists:", data);
    }
}

test().then(() => {
    console.log("Test done");
    process.exit(0);
}).catch(e => {
    console.error("Test error:", e);
    process.exit(1);
});
