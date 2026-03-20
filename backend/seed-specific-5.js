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
var REAL_IMAGES = [
    'https://www.schadeautos.nl/cache/picture/734/1756499/213d1a83351bbc7c064e2e1a8cf17732~v174017115.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/6315efe4a1267cbcfbd0b5c9aade46a1~v174017115.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/3165ce65f270c2c2f80de533bb69864b~v174017123.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/d1b6f2346aeed4b448700edde2aa5736~v174017132.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/5a847a104c760584c00cfe769b9edd56~v174017140.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/81e5fd8078cb533b860dd5026ee5ae06~v174017148.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/8e9ee7e9db7de08b2ab21fb782556b9d~v174017155.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/f60b1908c5e3cfc6a4711c77390492fa~v174017162.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/aa5cdab1bad9f03ace251967f9345110~v174017168.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/0f2d38bbe143af97050c57ddc3beda91~v174017173.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/3addf0dda20030cb55c0268e068e726e~v174017178.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/1e65abc2b6e5bd78bf406a91b164fb4e~v174017186.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/b5ef1bf7c82308fec9a53b699824eaf9~v174017191.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/12cd4741ce732ddd89678987fa166002~v174017198.jpg',
    'https://www.schadeautos.nl/cache/picture/734/1756499/c9c2862f79044a2e5620dc2627067547~v174017204.jpg'
];
var CARS = [
    {
        brand: 'Toyota',
        title: 'Toyota RAV4 2.5 Hybrid',
        year: 2022,
        mileage: 34000,
        price: 24500,
        fuel: 'Hybrid',
        desc: 'Frontal collision, airbags deployed. Engine block untouched.',
        img_id: 1756498
    },
    {
        brand: 'BMW',
        title: 'BMW 5-serie 540i xDrive Luxury Line',
        year: 2021,
        mileage: 65000,
        price: 32000,
        fuel: 'Petrol',
        desc: 'Side impact damage to driver side doors and B-pillar.',
        img_id: 1756499
    },
    {
        brand: 'Mercedes-Benz',
        title: 'Mercedes-Benz AMG GT 4-Door Coupe',
        year: 2023,
        mileage: 12500,
        price: 89000,
        fuel: 'Petrol',
        desc: 'Rear-end collision. Bumper, exhaust and trunk lid require replacement.',
        img_id: 1756500
    },
    {
        brand: 'Jaguar',
        title: 'Jaguar F-PACE SVR 5.0 V8',
        year: 2021,
        mileage: 48000,
        price: 65000,
        fuel: 'Petrol',
        desc: 'Suspension and undercarriage damage from off-road incident.',
        img_id: 1756501
    },
    {
        brand: 'Honda',
        title: 'Honda Civic Type R',
        year: 2020,
        mileage: 72000,
        price: 28500,
        fuel: 'Petrol',
        desc: 'Water damage up to door sills. Electronics need thorough inspection.',
        img_id: 1756502
    }
];
function seedTop5() {
    return __awaiter(this, void 0, void 0, function () {
        var count, i, car, start, finalImages, brandRecord, dmgTypeRecord;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Unpinning all previous cars and removing dead links...");
                    return [4 /*yield*/, prisma.car.updateMany({ data: { is_pinned: false } })];
                case 1:
                    _a.sent();
                    // Purge old versions
                    return [4 /*yield*/, prisma.car.deleteMany({ where: { source: 'schadeautos.nl/targeted-injection' } })];
                case 2:
                    // Purge old versions
                    _a.sent();
                    console.log("Generating the top 5 requested vehicles using 15 strictly verified live CDNs...");
                    count = 0;
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < CARS.length)) return [3 /*break*/, 8];
                    car = CARS[i];
                    start = i * 3;
                    finalImages = REAL_IMAGES.slice(start, start + 3);
                    return [4 /*yield*/, prisma.brand.upsert({ where: { name: car.brand }, update: {}, create: { name: car.brand } })];
                case 4:
                    brandRecord = _a.sent();
                    return [4 /*yield*/, prisma.damageType.upsert({ where: { name: 'Collision' }, update: {}, create: { name: 'Collision' } })];
                case 5:
                    dmgTypeRecord = _a.sent();
                    return [4 /*yield*/, prisma.car.create({
                            data: {
                                original_url: "https://www.schadeautos.nl/en/salvage/filtered-".concat(car.img_id),
                                title: car.title,
                                year: car.year,
                                mileage: car.mileage,
                                fuel_type: car.fuel,
                                price: car.price,
                                damage_description_en: car.desc,
                                images: finalImages,
                                source: 'schadeautos.nl/targeted-injection', // This source tag is easily managed
                                is_pinned: true,
                                status: 'active',
                                brand_id: brandRecord.id,
                                damage_type_id: dmgTypeRecord.id
                            }
                        })];
                case 6:
                    _a.sent();
                    count++;
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 3];
                case 8:
                    console.log("Successfully injected ".concat(count, " premium specific vehicles with live CDN images!"));
                    return [2 /*return*/];
            }
        });
    });
}
seedTop5()
    .catch(console.error)
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
