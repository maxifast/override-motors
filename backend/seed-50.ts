import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRESTIGE_BRANDS = ['Porsche', 'Audi', 'BMW', 'Mercedes-Benz', 'McLaren', 'Ferrari', 'Lamborghini', 'Aston Martin', 'Rolls-Royce', 'Bentley'];

const CAR_MODELS: Record<string, string[]> = {
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

const IMAGES = [
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1000',
    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000',
    'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=1000',
    'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1000',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000',
    'https://images.unsplash.com/photo-1611859328053-3cbc9e934ee4?q=80&w=1000'
];

const DAMAGES = [
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

async function seed50() {
    console.log("Clearing old data...");
    await prisma.car.deleteMany({});
    await prisma.damageType.deleteMany({});
    await prisma.brand.deleteMany({});
    
    console.log("Generating 50 realistic premium salvage assets...");

    let count = 0;
    for (let i = 0; i < 50; i++) {
        const brandName = PRESTIGE_BRANDS[Math.floor(Math.random() * PRESTIGE_BRANDS.length)];
        const models = CAR_MODELS[brandName];
        const modelName = models[Math.floor(Math.random() * models.length)];
        
        const year = Math.floor(Math.random() * (2024 - 2018 + 1)) + 2018;
        const mileage = Math.floor(Math.random() * 80000) + 500;
        const price = Math.floor(Math.random() * (250000 - 45000 + 1)) + 45000;
        const fuel = Math.random() > 0.7 ? 'Hybrid' : 'Petrol';
        
        const damageDesc = DAMAGES[Math.floor(Math.random() * DAMAGES.length)];
        const image = IMAGES[Math.floor(Math.random() * IMAGES.length)];
        
        const isPinned = i < 4; // pin top 4
        
        const brandRecord = await prisma.brand.upsert({ where: { name: brandName }, update: {}, create: { name: brandName } });
        const dmgTypeRecord = await prisma.damageType.upsert({ where: { name: 'Collision' }, update: {}, create: { name: 'Collision' } });

        await prisma.car.create({
            data: {
                original_url: `https://www.schadeautos.nl/en/salvage/${i}`,
                title: `${brandName} ${modelName}`,
                year, mileage, fuel_type: fuel, price,
                damage_description_en: damageDesc,
                images: [image],
                source: 'schadeautos.nl/generated',
                is_pinned: isPinned,
                status: 'active',
                brand_id: brandRecord.id,
                damage_type_id: dmgTypeRecord.id
            }
        });
        count++;
    }
    console.log(`Successfully seeded ${count} vehicles into Supabase Database!`);
}

seed50()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
