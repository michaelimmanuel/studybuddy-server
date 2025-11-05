import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "./database-config";

// Cache PrismaClient across hot reloads (dev) and warm serverless invocations (prod)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

// Always assign so subsequent imports reuse the same instance
globalForPrisma.prisma = prisma;

export default prisma;
