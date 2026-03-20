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
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var PRESTIGE_BRANDS = ['Porsche', 'Audi', 'BMW', 'Mercedes-Benz', 'McLaren', 'Ferrari', 'Lamborghini', 'Aston Martin', 'Rolls-Royce', 'Bentley'];
var CAR_MODELS = {
    'Porsche': ['911 GT3 RS', 'Taycan Turbo S', 'Panamera GTS', 'Cayenne Turbo', '911 Carrera 4S'],
    'Audi': ['RS6 Avant', 'R8 V10 Performance', 'RSQ8', 'e-tron GT RS', 'RS7 Sportback'],
    'BMW': ['M8 Competition', 'M5 CS', 'X6 M', 'i4 M50', 'M4 CSL'],
    'Mercedes-Benz': ['AMG G 63', 'AMG GT Black Series', 'S 63 AMG', 'SLS AMG', 'AMG One'],
    'McLaren': ['720S', '765LT', 'Artura', 'P1', 'Senna'],
    'Ferrari': ['F8 Tributo', 'SF90 Stradale', '812 Superfast', 'Roma', '488 Pista'],
    'Lamborghini': ['Aventador SVJ', 'Huracán STO', 'Urus Performante', 'Revuelto'],
    'Aston Martin': ['DBS Superleggera', 'Vantage F1 Edition', 'DBX 707', 'Valkyrie'],
    'Rolls-Royce': ['Cullinan Black Badge', 'Phantom', 'Ghost', 'Wraith'],
    'Bentley': ['Continental GT Speed', 'Bentayga', 'Flying Spur']
};
var IMAGES = [
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1000',
    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000',
    'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=1000',
    'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1000',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000',
    'https://images.unsplash.com/photo-1611859328053-3cbc9e934ee4?q=80&w=1000'
];
var DAMAGES = [
    'Heavy front-end collision. Engine displaced. Airbags deployed.',
    'Side impact on driver side. B-pillar structural damage.',
    'Rear collision. Exhaust and rear subframe bent.',
    'Rollover damage. Roof crushed, all windows shattered.',
    'Underbody damage from off-roading. Suspension ripped.',
    'Water damage (flood). Electrical systems compromised.',
    'Fire damage in engine bay. Wiring harness melted.',
    'Minor cosmetic damage. Sideswipe, repairable.',
    'Vandalism. Keyed extensively, interior slashed.'
];
function seed50() {
    return __awaiter(this, void 0, void 0, function () {
        var count, i, brandName, models, modelName, year, mileage, price, fuel, damageDesc, image, isPinned, brandRecord, dmgTypeRecord;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Clearing old data...");
                    return [4 /*yield*/, prisma.car.deleteMany({})];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma.damageType.deleteMany({})];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.brand.deleteMany({})];
                case 3:
                    _a.sent();
                    console.log("Generating 50 realistic premium salvage assets...");
                    count = 0;
                    i = 0;
                    _a.label = 4;
                case 4:
                    if (!(i < 50)) return [3 /*break*/, 9];
                    brandName = PRESTIGE_BRANDS[Math.floor(Math.random() * PRESTIGE_BRANDS.length)];
                    models = CAR_MODELS[brandName];
                    modelName = models[Math.floor(Math.random() * models.length)];
                    year = Math.floor(Math.random() * (2024 - 2018 + 1)) + 2018;
                    mileage = Math.floor(Math.random() * 80000) + 500;
                    price = Math.floor(Math.random() * (250000 - 45000 + 1)) + 45000;
                    fuel = Math.random() > 0.7 ? 'Hybrid' : 'Petrol';
                    damageDesc = DAMAGES[Math.floor(Math.random() * DAMAGES.length)];
                    image = IMAGES[Math.floor(Math.random() * IMAGES.length)];
                    isPinned = i < 4;
                    return [4 /*yield*/, prisma.brand.upsert({ where: { name: brandName }, update: {}, create: { name: brandName } })];
                case 5:
                    brandRecord = _a.sent();
                    return [4 /*yield*/, prisma.damageType.upsert({ where: { name: 'Collision' }, update: {}, create: { name: 'Collision' } })];
                case 6:
                    dmgTypeRecord = _a.sent();
                    return [4 /*yield*/, prisma.car.create({
                            data: {
                                original_url: "https://www.schadeautos.nl/en/salvage/".concat(i),
                                title: "".concat(brandName, " ").concat(modelName),
                                year: year,
                                mileage: mileage,
                                fuel_type: fuel,
                                price: price,
                                damage_description_en: damageDesc,
                                images: [image],
                                source: 'schadeautos.nl/generated',
                                is_pinned: isPinned,
                                status: 'active',
                                brand_id: brandRecord.id,
                                damage_type_id: dmgTypeRecord.id
                            }
                        })];
                case 7:
                    _a.sent();
                    count++;
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 4];
                case 9:
                    console.log("Successfully seeded ".concat(count, " vehicles into Supabase Database!"));
                    return [2 /*return*/];
            }
        });
    });
}
seed50()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
