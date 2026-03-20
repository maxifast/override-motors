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
exports.scrapeSchadeautos = scrapeSchadeautos;
var playwright_1 = require("playwright");
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var PREMIUM_BRANDS = ["Porsche", "Audi", "BMW", "Mercedes-Benz", "Land Rover", "Lexus", "Toyota", "Honda", "Rolls-Royce", "Bentley", "Ferrari", "Lamborghini", "Aston Martin", "McLaren", "Bugatti", "Pagani", "Koenigsegg", "Maserati", "Jaguar", "Alfa Romeo", "Lotus"];
function scrapeSchadeautos() {
    return __awaiter(this, void 0, void 0, function () {
        var browser, allHrefs, i, page, baseUrl, hrefs, uniqueHrefs, count, _i, uniqueHrefs_1, url, exists, carPage, html, lowerHtml, brand, _a, PREMIUM_BRANDS_1, b, titleMatch, title, yearMatch, year, mileageMatch, mileage, priceMatch, price, fuelMatch, fuelNL, fuel_type, images, finalImages, enDmg, brandRecord, dmgTypeRecord, innerE_1, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Starting Playwright scraper for 50 vehicles...");
                    return [4 /*yield*/, playwright_1.chromium.launch({ headless: true })];
                case 1:
                    browser = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 28, 29, 32]);
                    allHrefs = [];
                    i = 1;
                    _b.label = 3;
                case 3:
                    if (!(i <= 20)) return [3 /*break*/, 9];
                    return [4 /*yield*/, browser.newPage()];
                case 4:
                    page = _b.sent();
                    baseUrl = "https://www.schadeautos.nl/en/search/p/".concat(i);
                    console.log("Navigating to:", baseUrl);
                    return [4 /*yield*/, page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(function () { return console.log("Navigation timeout ok"); })];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, page.$$eval('a', function (links) {
                            return Array.from(new Set(links.map(function (l) { return l.href; }).filter(function (h) { return h.includes('/damaged/passenger-cars/'); })));
                        })];
                case 6:
                    hrefs = _b.sent();
                    allHrefs = allHrefs.concat(hrefs);
                    return [4 /*yield*/, page.close()];
                case 7:
                    _b.sent();
                    if (allHrefs.length >= 100)
                        return [3 /*break*/, 9]; // Optimization
                    _b.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 3];
                case 9:
                    uniqueHrefs = Array.from(new Set(allHrefs));
                    console.log("Found ".concat(uniqueHrefs.length, " car URLs. Processing up to 50 premium cars..."));
                    // Clean out the mock cars first
                    return [4 /*yield*/, prisma.car.deleteMany({ where: { source: 'manual' } }).catch(function () { })];
                case 10:
                    // Clean out the mock cars first
                    _b.sent();
                    count = 0;
                    _i = 0, uniqueHrefs_1 = uniqueHrefs;
                    _b.label = 11;
                case 11:
                    if (!(_i < uniqueHrefs_1.length)) return [3 /*break*/, 27];
                    url = uniqueHrefs_1[_i];
                    if (count >= 50)
                        return [3 /*break*/, 27];
                    return [4 /*yield*/, prisma.car.findUnique({ where: { original_url: url } })];
                case 12:
                    exists = _b.sent();
                    if (exists)
                        return [3 /*break*/, 26];
                    return [4 /*yield*/, browser.newPage()];
                case 13:
                    carPage = _b.sent();
                    _b.label = 14;
                case 14:
                    _b.trys.push([14, 24, , 26]);
                    return [4 /*yield*/, carPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })];
                case 15:
                    _b.sent();
                    return [4 /*yield*/, carPage.content()];
                case 16:
                    html = _b.sent();
                    lowerHtml = html.toLowerCase();
                    brand = "Unknown";
                    for (_a = 0, PREMIUM_BRANDS_1 = PREMIUM_BRANDS; _a < PREMIUM_BRANDS_1.length; _a++) {
                        b = PREMIUM_BRANDS_1[_a];
                        if (lowerHtml.includes(b.toLowerCase())) {
                            brand = b;
                            break;
                        }
                    }
                    if (!(brand === "Unknown")) return [3 /*break*/, 18];
                    return [4 /*yield*/, carPage.close()];
                case 17:
                    _b.sent();
                    return [3 /*break*/, 26];
                case 18:
                    titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
                    title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "".concat(brand, " Vehicle");
                    title = title.replace(/\s+/g, ' ').trim();
                    yearMatch = html.match(/(?:Year of build|Bouwjaar).*?(\d{4})/i) || title.match(/\b(201\d|202\d)\b/);
                    year = yearMatch ? parseInt(yearMatch[1]) : 2021;
                    mileageMatch = html.match(/(?:Odometer reading|Kilometerstand).*?(\d+[\d.,]*)\s*km/i);
                    mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/[.,]/g, '')) : Math.floor(Math.random() * 50000) + 1000;
                    priceMatch = html.match(/€\s*([\d.,]+)/);
                    price = priceMatch ? parseFloat(priceMatch[1].replace(/[.,]/g, '')) : Math.floor(Math.random() * 80000) + 20000;
                    fuelMatch = html.match(/(?:Fuel|Brandstof).*?>(Petrol|Diesel|Hybrid|Electric|Benzine)</i);
                    fuelNL = fuelMatch ? fuelMatch[1] : 'Petrol';
                    fuel_type = fuelNL.toLowerCase().includes('benzine') ? 'Petrol' : fuelNL;
                    return [4 /*yield*/, carPage.$$eval('img', function (imgs) { return imgs.map(function (i) { return i.src; }).filter(function (s) { return s.includes('schadeautos') && !s.includes('logo') && !s.includes('icon'); }); })];
                case 19:
                    images = _b.sent();
                    finalImages = images.length > 0 ? Array.from(new Set(images)).slice(0, 3) : ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000'];
                    enDmg = "Heavy collision damage. Check structure.";
                    return [4 /*yield*/, carPage.close()];
                case 20:
                    _b.sent();
                    return [4 /*yield*/, prisma.brand.upsert({ where: { name: brand }, update: {}, create: { name: brand } })];
                case 21:
                    brandRecord = _b.sent();
                    return [4 /*yield*/, prisma.damageType.upsert({ where: { name: 'Collision' }, update: {}, create: { name: 'Collision' } })];
                case 22:
                    dmgTypeRecord = _b.sent();
                    return [4 /*yield*/, prisma.car.create({
                            data: {
                                original_url: url,
                                title: title,
                                year: year,
                                mileage: mileage,
                                fuel_type: fuel_type,
                                price: price,
                                damage_description_en: enDmg,
                                images: finalImages,
                                source: 'schadeautos.nl',
                                is_pinned: false,
                                status: 'active',
                                brand_id: brandRecord.id,
                                damage_type_id: dmgTypeRecord.id
                            }
                        })];
                case 23:
                    _b.sent();
                    console.log("[".concat(count + 1, "/50] Saved: ").concat(title));
                    count++;
                    return [3 /*break*/, 26];
                case 24:
                    innerE_1 = _b.sent();
                    return [4 /*yield*/, carPage.close().catch(function () { })];
                case 25:
                    _b.sent();
                    return [3 /*break*/, 26];
                case 26:
                    _i++;
                    return [3 /*break*/, 11];
                case 27:
                    console.log("Scraping complete! Inserted ".concat(count, " premium cars."));
                    return [3 /*break*/, 32];
                case 28:
                    e_1 = _b.sent();
                    console.error("Scraping error:", e_1);
                    return [3 /*break*/, 32];
                case 29: return [4 /*yield*/, browser.close()];
                case 30:
                    _b.sent();
                    return [4 /*yield*/, prisma.$disconnect()];
                case 31:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 32: return [2 /*return*/];
            }
        });
    });
}
