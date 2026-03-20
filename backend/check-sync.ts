import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.car.count({ where: { source: 'schadeautos.nl/live-sync' } }).then(c => {
    console.log(`Synced so far: ${c}`);
    process.exit(0);
});
