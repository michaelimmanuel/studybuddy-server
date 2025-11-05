"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const globalForPrisma = global;
// Get database URL based on environment
const getDatabaseUrl = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
        // In production, use DATABASE_URL (set in Vercel)
        return process.env.DATABASE_URL || process.env.DATABASE_URL_PROD || '';
    }
    // In development, use DATABASE_URL from .env
    return process.env.DATABASE_URL || '';
};
const prisma = globalForPrisma.prisma || new client_1.PrismaClient({
    datasources: {
        db: {
            url: getDatabaseUrl(),
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
exports.default = prisma;
