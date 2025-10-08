"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const database_config_1 = require("./database-config");
// Create Prisma client with dynamic database URL
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: (0, database_config_1.getDatabaseUrl)(),
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});
exports.default = prisma;
