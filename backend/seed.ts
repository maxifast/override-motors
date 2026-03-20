import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const mockCars = [
      {
          original_url: 'mock-1', title: 'Porsche 911 GT3 RS (992)', year: 2023, mileage: 2400, fuel_type: 'Petrol', price: 185000,
          damage_description_en: 'Heavy front collision damage. Airbags deployed. Engine intact.', is_pinned: true,
          images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1000&auto=format&fit=crop'],
          status: 'active' as const, source: 'manual'
      },
      {
          original_url: 'mock-2', title: 'Audi RS6 Avant Performance', year: 2024, mileage: 800, fuel_type: 'Petrol Hybrid', price: 115000,
          damage_description_en: 'Side swipe damage to driver side. Drivetrain functioning.', is_pinned: false,
          images: ['https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000&auto=format&fit=crop'],
          status: 'active' as const, source: 'manual'
      },
      {
          original_url: 'mock-3', title: 'McLaren 720S Spider', year: 2021, mileage: 12500, fuel_type: 'Petrol', price: 145000,
          damage_description_en: 'Underbody and suspension damage. Carbon tub verified intact.', is_pinned: true,
          images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop'],
          status: 'active' as const, source: 'manual'
      },
      {
          original_url: 'mock-4', title: 'Mercedes-Benz G63 AMG', year: 2022, mileage: 38000, fuel_type: 'Petrol', price: 95000,
          damage_description_en: 'Rear collision. Frame slight bend. Repairable status.', is_pinned: false,
          images: ['https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=1000&auto=format&fit=crop'],
          status: 'active' as const, source: 'manual'
      }
  ];

  for (const c of mockCars) {
    const brandName = c.title.split(' ')[0];
    const brandRecord = await prisma.brand.upsert({
        where: { name: brandName },
        update: {},
        create: { name: brandName }
    });
    
    const damageRecord = await prisma.damageType.upsert({
        where: { name: 'Collision' },
        update: {},
        create: { name: 'Collision' }
    });

    await prisma.car.upsert({
        where: { original_url: c.original_url },
        update: {},
        create: {
             ...c,
             brand_id: brandRecord.id,
             damage_type_id: damageRecord.id,
        }
    });
  }
  console.log("Mock data inserted successfully!");
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
