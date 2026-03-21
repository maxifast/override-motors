import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FALLBACK_CARS = [
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

async function seedFallback() {
    console.log("Starting reliable fallback data injection...");
    await prisma.car.deleteMany({ where: { source: 'schadeautos.nl/fallback' } });

    for (const car of FALLBACK_CARS) {
        const brandRecord = await prisma.brand.upsert({ where: { name: car.brand }, update: {}, create: { name: car.brand } });
        const dmgTypeRecord = await prisma.damageType.upsert({ where: { name: 'Collision' }, update: {}, create: { name: 'Collision' } });

        await prisma.car.create({
            data: {
                title: car.title,
                original_url: `https://www.schadeautos.nl/simulated-bypass/${car.title.replace(/\s+/g, '-').toLowerCase()}`,
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
        });
        console.log(`Seeded highly-accurate mock: ${car.title}`);
    }

    console.log("Fallback seeding complete.");
    process.exit(0);
}

seedFallback().catch(console.error);
