import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Get database URL based on environment
const getDatabaseUrl = (): string => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // In production, use DATABASE_URL (set in Vercel)
    return process.env.DATABASE_URL || process.env.DATABASE_URL_PROD || '';
  }
  
  // In development, use DATABASE_URL from .env
  return process.env.DATABASE_URL || '';
};

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
