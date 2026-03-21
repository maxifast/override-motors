import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
    const cars = await prisma.car.findMany({
        where: { source: 'schadeautos.nl/cloud-sync' },
        select: { title: true, mileage: true }
    });
    console.log(`Checking ${cars.length} active cars in DB:`);
    cars.forEach(c => console.log(`- ${c.title} | Mileage: ${c.mileage} km`));
}
check().catch(console.error).finally(() => prisma.$disconnect());
