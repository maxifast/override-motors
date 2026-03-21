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
var playwright_1 = require("playwright");
var client_1 = require("@prisma/client");
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv = require("dotenv");
dotenv.config();
var prisma = new client_1.PrismaClient();
var supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var BUCKET = 'car-images';
var TARGET_URLS = [
    // 8 fixed electric/hybrid URLs from schadeautos
    'https://www.schadeautos.nl/en/damaged/passenger-cars/audi-e-tron-50-quattro-s-edition-luchtvering-cam-20/o/1749830',
    'https://www.schadeautos.nl/en/damaged/passenger-cars/bmw-i4-edrive40-m-sport/o/1723423',
    'https://www.schadeautos.nl/en/damaged/passenger-cars/porsche-taycan-4s-cross-turismo-pano-bose-cam/o/1741132',
    'https://www.schadeautos.nl/en/damaged/passenger-cars/volkswagen-id-4-pro-77kwh-warmtepomp/o/1749211',
    'https://www.schadeautos.nl/en/damaged/passenger-cars/tesla-model-3-long-range-awd/o/1743932',
    'https://www.schadeautos.nl/en/damaged/passenger-cars/mercedes-benz-eqc-400-4matic-amg-line/o/1739988',
    'https://www.schadeautos.nl/en/damaged/passenger-cars/volvo-xc40-recharge-pure-electric-ultimate/o/1748231',
    'https://www.schadeautos.nl/en/damaged/passenger-cars/polestar-2-long-range-dual-motor/o/1745112'
];
function downloadImage(page, url) {
    return __awaiter(this, void 0, void 0, function () {
        var response, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, page.request.get(url, {
                            headers: {
                                'Referer': 'https://www.schadeautos.nl/',
                                'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                            },
                            timeout: 10000
                        })];
                case 1:
                    response = _d.sent();
                    if (!response.ok()) return [3 /*break*/, 3];
                    _b = (_a = Buffer).from;
                    return [4 /*yield*/, response.body()];
                case 2: return [2 /*return*/, _b.apply(_a, [_d.sent()])];
                case 3: return [2 /*return*/, null];
                case 4:
                    _c = _d.sent();
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function uploadImage(imageBuffer, path) {
    return __awaiter(this, void 0, void 0, function () {
        var error, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase.storage.from(BUCKET).upload(path, imageBuffer, { contentType: 'image/jpeg', upsert: true })];
                case 1:
                    error = (_a.sent()).error;
                    if (error)
                        return [2 /*return*/, null];
                    data = supabase.storage.from(BUCKET).getPublicUrl(path).data;
                    return [2 /*return*/, data.publicUrl];
            }
        });
    });
}
function runTargeted() {
    return __awaiter(this, void 0, void 0, function () {
        var browser, count, _i, TARGET_URLS_1, url, page, html, titleMatch, title, brand, year, price, fuel_type, mileage, imageUrls, finalUrls, uploadedUrls, timestamp, i, imgBuffer, publicUrl, brandRec, dmgRec, e_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("Forcing 8 targeted EV/Hybrid vehicle scrapes into Supabase...");
                    return [4 /*yield*/, playwright_1.chromium.launch({ headless: true })];
                case 1:
                    browser = _d.sent();
                    count = 0;
                    _i = 0, TARGET_URLS_1 = TARGET_URLS;
                    _d.label = 2;
                case 2:
                    if (!(_i < TARGET_URLS_1.length)) return [3 /*break*/, 24];
                    url = TARGET_URLS_1[_i];
                    return [4 /*yield*/, browser.newPage()];
                case 3:
                    page = _d.sent();
                    _d.label = 4;
                case 4:
                    _d.trys.push([4, 20, , 21]);
                    return [4 /*yield*/, page.waitForTimeout(1000)];
                case 5:
                    _d.sent();
                    return [4 /*yield*/, page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, page.content()];
                case 7:
                    html = _d.sent();
                    titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
                    title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : "Electric Vehicle";
                    brand = title.split(' ')[0] || "Premium";
                    year = parseInt(((_a = html.match(/(?:Year of build|Bouwjaar)[^0-9]*(\d{4})/i)) === null || _a === void 0 ? void 0 : _a[1]) || "2023");
                    price = parseFloat(((_c = (_b = html.match(/€\s*([\d.,]+)/)) === null || _b === void 0 ? void 0 : _b[1]) === null || _c === void 0 ? void 0 : _c.replace(/[.,]/g, '')) || "45000");
                    fuel_type = title.toLowerCase().includes('hybrid') ? 'Hybrid' : 'Electric';
                    mileage = 15000;
                    return [4 /*yield*/, page.$$eval('img', function (imgs) {
                            return imgs.map(function (i) { return i.src; }).filter(function (s) { return s && s.includes('picture'); });
                        }).catch(function () { return []; })];
                case 8:
                    imageUrls = _d.sent();
                    finalUrls = Array.from(new Set(imageUrls)).slice(0, 5);
                    if (!(finalUrls.length === 0)) return [3 /*break*/, 10];
                    console.log("No images found for ".concat(title));
                    return [4 /*yield*/, page.close()];
                case 9:
                    _d.sent();
                    return [3 /*break*/, 23];
                case 10:
                    uploadedUrls = [];
                    timestamp = Date.now();
                    i = 0;
                    _d.label = 11;
                case 11:
                    if (!(i < finalUrls.length)) return [3 /*break*/, 15];
                    return [4 /*yield*/, downloadImage(page, finalUrls[i])];
                case 12:
                    imgBuffer = _d.sent();
                    if (!imgBuffer) return [3 /*break*/, 14];
                    return [4 /*yield*/, uploadImage(imgBuffer, "".concat(timestamp, "_").concat(count, "/").concat(i, ".jpg"))];
                case 13:
                    publicUrl = _d.sent();
                    if (publicUrl)
                        uploadedUrls.push(publicUrl);
                    _d.label = 14;
                case 14:
                    i++;
                    return [3 /*break*/, 11];
                case 15:
                    if (!(uploadedUrls.length > 0)) return [3 /*break*/, 19];
                    return [4 /*yield*/, prisma.brand.upsert({ where: { name: brand }, update: {}, create: { name: brand } })];
                case 16:
                    brandRec = _d.sent();
                    return [4 /*yield*/, prisma.damageType.upsert({ where: { name: 'Collision' }, update: {}, create: { name: 'Collision' } })];
                case 17:
                    dmgRec = _d.sent();
                    return [4 /*yield*/, prisma.car.create({
                            data: {
                                original_url: url,
                                title: title,
                                year: year,
                                mileage: mileage,
                                price: price,
                                fuel_type: fuel_type,
                                damage_description_en: "Premium electric/hybrid vehicle with structural damage.",
                                images: uploadedUrls,
                                source: 'schadeautos.nl/targeted-ev',
                                is_pinned: true, // pin these to top
                                status: 'active',
                                brand_id: brandRec.id,
                                damage_type_id: dmgRec.id
                            }
                        })];
                case 18:
                    _d.sent();
                    console.log("\u2705 Uploaded ".concat(uploadedUrls.length, " images and saved: ").concat(title));
                    count++;
                    _d.label = 19;
                case 19: return [3 /*break*/, 21];
                case 20:
                    e_1 = _d.sent();
                    console.log("Failed on ".concat(url, ": ").concat(e_1.message));
                    return [3 /*break*/, 21];
                case 21: return [4 /*yield*/, page.close()];
                case 22:
                    _d.sent();
                    _d.label = 23;
                case 23:
                    _i++;
                    return [3 /*break*/, 2];
                case 24: return [4 /*yield*/, browser.close()];
                case 25:
                    _d.sent();
                    return [4 /*yield*/, prisma.$disconnect()];
                case 26:
                    _d.sent();
                    console.log("Done! Forced ".concat(count, " EV/Hybrid vehicles loaded."));
                    return [2 /*return*/];
            }
        });
    });
}
runTargeted();
