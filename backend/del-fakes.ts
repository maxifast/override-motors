import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function clean() {
    const res = await prisma.car.deleteMany({
        where: {
            source: {
                not: 'schadeautos.nl/cloud-sync'
            }
        }
    });
    console.log("Deleted old cards count:", res.count);
}
clean().catch(console.error).finally(() => prisma.$disconnect());
