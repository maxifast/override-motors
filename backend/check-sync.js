"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
prisma.car.count({ where: { source: 'schadeautos.nl/live-sync' } }).then(function (c) {
    console.log("Synced so far: ".concat(c));
    process.exit(0);
});
