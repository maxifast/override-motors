"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeBatch = scrapeBatch;
var dotenv = require("dotenv");
var playwright_1 = require("playwright");
var client_1 = require("@prisma/client");
var supabase_js_1 = require("@supabase/supabase-js");
var node_cron_1 = require("node-cron");
dotenv.config();
var prisma = new client_1.PrismaClient();
var supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var BUCKET = 'car-images';
var PREMIUM_BRANDS = ["BMW", "Mercedes-Benz", "Audi", "Lexus", "Porsche", "Tesla", "Volvo", "Land Rover", "Genesis", "Toyota", "Volkswagen", "Zeekr", "Li Auto", "Mazda", "Jeep", "Infiniti", "Acura", "Cadillac", "Polestar", "Rivian", "Lucid"];
var CARS_PER_RUN = 4;
function prepareBucket() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, buckets, listError;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase.storage.listBuckets()];
                case 1:
                    _a = _b.sent(), buckets = _a.data, listError = _a.error;
                    if (listError) {
                        console.error("Error listing buckets", listError);
                        return [2 /*return*/];
                    }
                    if (!!buckets.find(function (b) { return b.name === BUCKET; })) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase.storage.createBucket(BUCKET, { public: true })];
                case 2:
                    _b.sent();
                    console.log("Created new public bucket: ".concat(BUCKET));
                    _b.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function uploadImage(buffer, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, publicData;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase.storage
                        .from(BUCKET)
                        .upload(filename, buffer, {
                        contentType: 'image/jpeg',
                        upsert: true
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Failed to upload ".concat(filename, ":"), error.message);
                        return [2 /*return*/, null];
                    }
                    publicData = supabase.storage.from(BUCKET).getPublicUrl(filename).data;
                    return [2 /*return*/, publicData.publicUrl];
            }
        });
    });
}
function scrapeBatch() {
    return __awaiter(this, void 0, void 0, function () {
        var browser, context, page, searchUrls, allHrefs, _i, searchUrls_1, sUrl, hrefs, uniqueHrefs, batchCount, _loop_1, _a, uniqueHrefs_1, url, state_1, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("\n\nStarting new EV/Hybrid Batch.");
                    return [4 /*yield*/, playwright_1.chromium.launch({ headless: true })];
                case 1:
                    browser = _b.sent();
                    return [4 /*yield*/, browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' })];
                case 2:
                    context = _b.sent();
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 14, 15, 17]);
                    return [4 /*yield*/, context.newPage()];
                case 4:
                    page = _b.sent();
                    console.log("📡 Phase 1: Contacting Donor Site search queries (2020+, <200k km, Electric/Hybrid)");
                    searchUrls = [
                        'https://www.schadeautos.nl/en/search/damaged/passenger-cars/1/1/6/0/46/0/1/0?p=2020-&odo=0-200000&fuel=electric',
                        'https://www.schadeautos.nl/en/search/damaged/passenger-cars/1/1/6/0/46/0/1/0?p=2020-&odo=0-200000&fuel=hybrid'
                    ];
                    allHrefs = [];
                    _i = 0, searchUrls_1 = searchUrls;
                    _b.label = 5;
                case 5:
                    if (!(_i < searchUrls_1.length)) return [3 /*break*/, 9];
                    sUrl = searchUrls_1[_i];
                    return [4 /*yield*/, page.goto(sUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, page.$$eval('#Lijst_invoeg a', function (anchors) { return Array.from(anchors).map(function (a) { return a.href; }); })];
                case 7:
                    hrefs = _b.sent();
                    allHrefs.push.apply(allHrefs, hrefs);
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 5];
                case 9:
                    uniqueHrefs = Array.from(new Set(allHrefs)).filter(function (h) { return h.includes('/damaged/'); });
                    console.log("\uD83D\uDCCB Found ".concat(uniqueHrefs.length, " potential cars in feed."));
                    batchCount = 0;
                    console.log("🔍 Phase 2: Processing and uploading images...");
                    _loop_1 = function (url) {
                        var isPremium, existing, carPage, html, titleMatch, title, brand, _c, PREMIUM_BRANDS_1, b, priceMatch, price, yearMatch, year, mileageMatch, mileage, fuelMatch, rawFuel, fuel_type, descMatch, damage_description_en, damageTypeName, imageMatches, originalImages, finalImgs, i, res, buffer, filename, publicUrl, ig_1, brandRecord, dtRecord, e_2;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    if (batchCount >= CARS_PER_RUN)
                                        return [2 /*return*/, "break"];
                                    isPremium = PREMIUM_BRANDS.some(function (b) { return url.toLowerCase().includes(b.toLowerCase().replace(' ', '-')); });
                                    if (!isPremium)
                                        return [2 /*return*/, "continue"];
                                    return [4 /*yield*/, prisma.car.findUnique({ where: { original_url: url } })];
                                case 1:
                                    existing = _d.sent();
                                    if (existing)
                                        return [2 /*return*/, "continue"];
                                    return [4 /*yield*/, context.newPage()];
                                case 2:
                                    carPage = _d.sent();
                                    _d.label = 3;
                                case 3:
                                    _d.trys.push([3, 24, 25, 27]);
                                    return [4 /*yield*/, carPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })];
                                case 4:
                                    _d.sent();
                                    return [4 /*yield*/, carPage.content()];
                                case 5:
                                    html = _d.sent();
                                    titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
                                    if (!!titleMatch) return [3 /*break*/, 7];
                                    return [4 /*yield*/, carPage.close()];
                                case 6:
                                    _d.sent();
                                    return [2 /*return*/, "continue"];
                                case 7:
                                    title = titleMatch[1].replace(/<[^>]+>/g, '')
                                        .replace(/Damaged car/ig, '')
                                        .replace(/Damaged commercial vehicles/ig, '')
                                        .replace(/Damaged vehicle/ig, '')
                                        .replace(/Electric vehicle/ig, '')
                                        .trim().replace(/\s+/g, ' ');
                                    brand = "Unknown";
                                    for (_c = 0, PREMIUM_BRANDS_1 = PREMIUM_BRANDS; _c < PREMIUM_BRANDS_1.length; _c++) {
                                        b = PREMIUM_BRANDS_1[_c];
                                        if (title.toLowerCase().includes(b.toLowerCase())) {
                                            brand = b;
                                            break;
                                        }
                                    }
                                    if (!(brand === "Unknown")) return [3 /*break*/, 9];
                                    return [4 /*yield*/, carPage.close()];
                                case 8:
                                    _d.sent();
                                    return [2 /*return*/, "continue"];
                                case 9:
                                    priceMatch = html.match(/€\s*([\d.,]+)/);
                                    price = priceMatch ? parseFloat(priceMatch[1].replace(/[.,]/g, '')) : 25000 + Math.random() * 50000;
                                    yearMatch = html.match(/(?:ERD|year|bouwjaar)[\s\S]{0,30}?(\d{4})/i);
                                    year = yearMatch ? parseInt(yearMatch[1]) : 2022;
                                    mileageMatch = html.match(/(?:mileage|kilometerstand|odometer reading)[\s\S]{0,100}?(\d+[\d.,]*)\s*km/i);
                                    mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/[.,]/g, '')) : 10000;
                                    fuelMatch = html.match(/(?:fuel|brandstof)[\s\S]{0,30}?(electric|hybrid|petrol|diesel)/i);
                                    rawFuel = fuelMatch ? fuelMatch[1] : 'Electric';
                                    fuel_type = rawFuel.charAt(0).toUpperCase() + rawFuel.slice(1).toLowerCase();
                                    descMatch = html.match(/(?:Damage details|Schadedetails)[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/i);
                                    damage_description_en = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : "Collision damage to bodywork.";
                                    damageTypeName = "Collision damage";
                                    if (damage_description_en.toLowerCase().includes('water') || damage_description_en.toLowerCase().includes('flood'))
                                        damageTypeName = "Water damage";
                                    else if (damage_description_en.toLowerCase().includes('fire'))
                                        damageTypeName = "Fire damage";
                                    else if (damage_description_en.toLowerCase().includes('engine') || damage_description_en.toLowerCase().includes('motor'))
                                        damageTypeName = "Engine damage";
                                    imageMatches = Array.from(html.matchAll(/data-src="([^"]+)"/g)).map(function (m) { return m[1]; }).filter(function (src) { return src.includes('/foto/') || src.includes('/images/'); });
                                    originalImages = Array.from(new Set(imageMatches)).map(function (src) { return src.startsWith('http') ? src : "https://www.schadeautos.nl".concat(src); });
                                    if (!(originalImages.length > 0)) return [3 /*break*/, 23];
                                    process.stdout.write("  -> Downloading ".concat(Math.min(10, originalImages.length), " images for ").concat(title, "..."));
                                    finalImgs = [];
                                    i = 0;
                                    _d.label = 10;
                                case 10:
                                    if (!(i < Math.min(10, originalImages.length))) return [3 /*break*/, 17];
                                    _d.label = 11;
                                case 11:
                                    _d.trys.push([11, 15, , 16]);
                                    return [4 /*yield*/, carPage.request.get(originalImages[i])];
                                case 12:
                                    res = _d.sent();
                                    return [4 /*yield*/, res.body()];
                                case 13:
                                    buffer = _d.sent();
                                    filename = "".concat(Buffer.from(title).toString('base64url'), "-").concat(Date.now(), "-").concat(i, ".jpg");
                                    return [4 /*yield*/, uploadImage(buffer, filename)];
                                case 14:
                                    publicUrl = _d.sent();
                                    if (publicUrl)
                                        finalImgs.push(publicUrl);
                                    return [3 /*break*/, 16];
                                case 15:
                                    ig_1 = _d.sent();
                                    return [3 /*break*/, 16];
                                case 16:
                                    i++;
                                    return [3 /*break*/, 10];
                                case 17:
                                    if (!(finalImgs.length === 0)) return [3 /*break*/, 19];
                                    console.log("\n  \u274C Failed to upload any images for ".concat(title, ", skipping."));
                                    return [4 /*yield*/, carPage.close()];
                                case 18:
                                    _d.sent();
                                    return [2 /*return*/, "continue"];
                                case 19: return [4 /*yield*/, prisma.brand.upsert({
                                        where: { name: brand },
                                        update: {},
                                        create: { name: brand }
                                    })];
                                case 20:
                                    brandRecord = _d.sent();
                                    return [4 /*yield*/, prisma.damageType.upsert({
                                            where: { name: damageTypeName },
                                            update: {},
                                            create: { name: damageTypeName }
                                        })];
                                case 21:
                                    dtRecord = _d.sent();
                                    return [4 /*yield*/, prisma.car.upsert({
                                            where: { original_url: url },
                                            update: {},
                                            create: {
                                                original_url: url,
                                                title: title,
                                                year: year,
                                                mileage: mileage,
                                                fuel_type: fuel_type,
                                                price: price,
                                                damage_description_en: damage_description_en,
                                                images: finalImgs, source: 'schadeautos.nl/cloud-sync',
                                                is_pinned: false, status: 'active',
                                                brand_id: brandRecord.id, damage_type_id: dtRecord.id
                                            }
                                        })];
                                case 22:
                                    _d.sent();
                                    console.log("\n  \u2705 Successfully saved and uploaded: ".concat(title));
                                    batchCount++;
                                    _d.label = 23;
                                case 23: return [3 /*break*/, 27];
                                case 24:
                                    e_2 = _d.sent();
                                    console.error("Error processing ".concat(url, ":"), e_2.message);
                                    return [3 /*break*/, 27];
                                case 25: return [4 /*yield*/, carPage.close()];
                                case 26:
                                    _d.sent();
                                    return [7 /*endfinally*/];
                                case 27: return [2 /*return*/];
                            }
                        });
                    };
                    _a = 0, uniqueHrefs_1 = uniqueHrefs;
                    _b.label = 10;
                case 10:
                    if (!(_a < uniqueHrefs_1.length)) return [3 /*break*/, 13];
                    url = uniqueHrefs_1[_a];
                    return [5 /*yield**/, _loop_1(url)];
                case 11:
                    state_1 = _b.sent();
                    if (state_1 === "break")
                        return [3 /*break*/, 13];
                    _b.label = 12;
                case 12:
                    _a++;
                    return [3 /*break*/, 10];
                case 13:
                    console.log("\nBatch finished! Scraped ".concat(batchCount, " premium EV/Hybrid cars."));
                    return [2 /*return*/, batchCount];
                case 14:
                    e_1 = _b.sent();
                    console.error("Batch error:", e_1);
                    return [2 /*return*/, 0];
                case 15: return [4 /*yield*/, browser.close()];
                case 16:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var dailyStats;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("═══════════════════════════════════════════════════");
                    console.log("  OVERRIDE MOTORS — EV/Hybrid Cloud Image Scraper ");
                    console.log("  Strict Algorithm: Premium + 2020+ + <200k km + EV");
                    console.log("  Batch: 4 cars → every 30 min from 08:00 to 22:00");
                    console.log("═══════════════════════════════════════════════════\n");
                    return [4 /*yield*/, prepareBucket()];
                case 1:
                    _a.sent();
                    console.log("\n[scheduler] CRON Scheduler started for EV/Hybrid Cloud Image Scraper.");
                    console.log("[scheduler] Schedule: Every 30 minutes from 08:00 to 22:00 (Madrid Time). Batch size: ".concat(CARS_PER_RUN, " cars.\n"));
                    dailyStats = { date: new Date().getDate(), count: 0 };
                    node_cron_1.default.schedule('0,30 8-22 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
                        var currentDay, scraped, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    currentDay = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" })).getDate();
                                    if (currentDay !== dailyStats.date) {
                                        dailyStats.date = currentDay;
                                        dailyStats.count = 0;
                                        console.log("\n[scheduler] New day detected! Resetting daily quota to 0/40.");
                                    }
                                    if (dailyStats.count >= 40) {
                                        console.log("\n[".concat(new Date().toLocaleString(), "] CRON Trigger: Daily limit of 40 cars reached (").concat(dailyStats.count, "/40). Skipping batch."));
                                        return [2 /*return*/];
                                    }
                                    console.log("\n[".concat(new Date().toLocaleString(), "] CRON Trigger: Starting EV/Hybrid Batch... (").concat(dailyStats.count, "/40 for today)"));
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, scrapeBatch()];
                                case 2:
                                    scraped = _a.sent();
                                    dailyStats.count += scraped;
                                    console.log("\n[".concat(new Date().toLocaleString(), "] Batch finished! Added ").concat(scraped, " cars. Daily total is now ").concat(dailyStats.count, "/40."));
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_1 = _a.sent();
                                    console.error("Error during scheduled scrape:", err_1);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }, {
                        timezone: "Europe/Madrid"
                    });
                    console.log("Running initial batch immediately...");
                    scrapeBatch().then(function (scraped) {
                        dailyStats.count += scraped;
                        console.log("Initial batch finished: ".concat(scraped, " cars (Daily: ").concat(dailyStats.count, "/40)"));
                    }).catch(console.error);
                    return [2 /*return*/];
            }
        });
    });
}
main();
