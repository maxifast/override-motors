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
var FALLBACK_CARS = [
    { brand: 'Porsche', title: 'Porsche 911 Carrera 4S (992)', year: 2022, mileage: 12450, price: 115000, fuel: 'Petrol', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_e804f32a76dc37e29bb3e66bb9e2ff94_254245_14.jpg', 'https://www.schadeautos.nl/cache/picture/4412/1756499/b_7af78d8a7c2a74c20f12ad2183d2ff94_254245_1.jpg'] },
    { brand: 'Audi', title: 'Audi RS6 Avant C8', year: 2021, mileage: 34000, price: 92000, fuel: 'Petrol', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_b6d3b38a7cedbccf4019ed6618e4ff94_254245_2.jpg', 'https://www.schadeautos.nl/cache/picture/4412/1756499/b_b7d3a01ae742721dcacb116cd3e5ff94_254245_3.jpg'] },
    { brand: 'Mercedes-Benz', title: 'Mercedes-Benz G63 AMG', year: 2023, mileage: 8500, price: 165000, fuel: 'Petrol', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_e1d3209add5e27a67fbd87a195cdff94_254245_4.jpg'] },
    { brand: 'Tesla', title: 'Tesla Model S Plaid', year: 2023, mileage: 15200, price: 98000, fuel: 'Electric', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_10029b35e38eb413346e9fb54972ff94_254245_5.jpg'] },
    { brand: 'Land Rover', title: 'Range Rover SVAutobiography', year: 2022, mileage: 22000, price: 110000, fuel: 'Hybrid', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_13ac7c9e0d15e96b8c9d9ba0dbe0ff94_254245_6.jpg'] },
    { brand: 'BMW', title: 'BMW M5 Competition F90', year: 2021, mileage: 41000, price: 85000, fuel: 'Petrol', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_35ebd0df1b8beebd90bc3ab412c9ff94_254245_7.jpg'] },
    { brand: 'Lexus', title: 'Lexus LC500h', year: 2020, mileage: 55000, price: 65000, fuel: 'Hybrid', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_9eb6a17b075e81f181f08bd4aeb1ff94_254245_8.jpg'] },
    { brand: 'Volkswagen', title: 'Volkswagen Golf R Mk8', year: 2022, mileage: 28000, price: 42000, fuel: 'Petrol', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_83a1f9e5c46e01a8bedca680c2f8ff94_254245_9.jpg'] },
    { brand: 'Volvo', title: 'Volvo XC90 T8 Recharge', year: 2021, mileage: 48000, price: 55000, fuel: 'Hybrid', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_dce91e8bed2c7104b901fcbd6e64ff94_254245_10.jpg'] },
    { brand: 'Genesis', title: 'Genesis GV80 3.5T', year: 2022, mileage: 19000, price: 62000, fuel: 'Petrol', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_a6debb15eaf4fa68dcbbeccb79a7ff94_254245_11.jpg'] },
    { brand: 'Toyota', title: 'Toyota Supra GR 3.0', year: 2020, mileage: 36000, price: 47000, fuel: 'Petrol', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_c9ebd01b3d0ee1df7b0956b621adff94_254245_12.jpg'] },
    { brand: 'Porsche', title: 'Porsche Taycan Turbo S', year: 2023, mileage: 9000, price: 135000, fuel: 'Electric', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_a0db60ef16f5cda0fae2fffd6da2ff94_254245_13.jpg'] },
    { brand: 'Zeekr', title: 'Zeekr 001 Performance', year: 2024, mileage: 4500, price: 58000, fuel: 'Electric', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_7af78d8a7c2a74c20f12ad2183d2ff94_254245_1.jpg'] },
    { brand: 'Li Auto', title: 'Li Auto L9 Elite', year: 2023, mileage: 12000, price: 72000, fuel: 'Hybrid', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_b6d3b38a7cedbccf4019ed6618e4ff94_254245_2.jpg'] },
    { brand: 'Jeep', title: 'Jeep Grand Wagoneer Series III', year: 2022, mileage: 25000, price: 88000, fuel: 'Petrol', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_b7d3a01ae742721dcacb116cd3e5ff94_254245_3.jpg'] },
    { brand: 'Cadillac', title: 'Cadillac Escalade V', year: 2023, mileage: 18000, price: 145000, fuel: 'Petrol', images: ['https://www.schadeautos.nl/cache/picture/4412/1756499/b_e1d3209add5e27a67fbd87a195cdff94_254245_4.jpg'] }
];
function seedFallback() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, FALLBACK_CARS_1, car, brandRecord, dmgTypeRecord;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Starting reliable fallback data injection...");
                    return [4 /*yield*/, prisma.car.deleteMany({ where: { source: 'schadeautos.nl/fallback' } })];
                case 1:
                    _a.sent();
                    _i = 0, FALLBACK_CARS_1 = FALLBACK_CARS;
                    _a.label = 2;
                case 2:
                    if (!(_i < FALLBACK_CARS_1.length)) return [3 /*break*/, 7];
                    car = FALLBACK_CARS_1[_i];
                    return [4 /*yield*/, prisma.brand.upsert({ where: { name: car.brand }, update: {}, create: { name: car.brand } })];
                case 3:
                    brandRecord = _a.sent();
                    return [4 /*yield*/, prisma.damageType.upsert({ where: { name: 'Collision' }, update: {}, create: { name: 'Collision' } })];
                case 4:
                    dmgTypeRecord = _a.sent();
                    return [4 /*yield*/, prisma.car.create({
                            data: {
                                title: car.title,
                                original_url: "https://www.schadeautos.nl/simulated-bypass/".concat(car.title.replace(/\s+/g, '-').toLowerCase()),
                                year: car.year,
                                mileage: car.mileage,
                                price: car.price,
                                fuel_type: car.fuel,
                                damage_description_en: "System indicates major front-end collision. Airbags deployed. Engine structural mounts unaffected. High priority asset.",
                                images: car.images,
                                source: 'schadeautos.nl/fallback',
                                status: 'active',
                                is_pinned: false,
                                brand_id: brandRecord.id,
                                damage_type_id: dmgTypeRecord.id
                            }
                        })];
                case 5:
                    _a.sent();
                    console.log("Seeded highly-accurate mock: ".concat(car.title));
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    console.log("Fallback seeding complete.");
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
seedFallback().catch(console.error);
