import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "./database-config";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =  globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
