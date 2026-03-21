import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function cleanDB() {
    await prisma.car.deleteMany({
        where: {
            OR: [
                { title: { contains: 'Too Many Requests' } },
                { title: { contains: 'Unknown Car' } },
            ]
        }
    });

    const carsWithoutImages = await prisma.car.findMany();
    for (const car of carsWithoutImages) {
        if (!car.images || car.images.length === 0) {
            await prisma.car.delete({ where: { id: car.id } });
        }
    }
    console.log("Database scrubbed of 429s and empty images.");
    process.exit(0);
}
cleanDB();
