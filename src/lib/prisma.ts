import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "./database-config";

// Create Prisma client with dynamic database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

export default prisma;
