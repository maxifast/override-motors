import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
    const cars = await prisma.car.findMany({
        where: { source: 'schadeautos.nl/cloud-sync' },
        select: { title: true, year: true, fuel_type: true, mileage: true }
    });
    console.log(`Checking ${cars.length} active cars in DB:`);
    cars.forEach(c => console.log(`- ${c.title} | Year: ${c.year} | Fuel: ${c.fuel_type} | Mileage: ${c.mileage}`));
}
check().catch(console.error).finally(() => prisma.$disconnect());
