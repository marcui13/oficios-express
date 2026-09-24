import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.oficiosExpressDB_PRISMA_DATABASE_URL) {
    return process.env.oficiosExpressDB_PRISMA_DATABASE_URL;
  }
  if (process.env.oficiosExpressDB_DATABASE_URL) {
    return process.env.oficiosExpressDB_DATABASE_URL;
  }
  if (process.env.oficiosExpressDB_POSTGRES_URL) {
    return process.env.oficiosExpressDB_POSTGRES_URL;
  }
  if (process.env.POSTGRES_PRISMA_URL) return process.env.POSTGRES_PRISMA_URL;
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;

  // Búsqueda dinámica de cualquier variable inyectada por Vercel Storage
  const dynamicKey = Object.keys(process.env).find(
    (k) =>
      k.endsWith("_PRISMA_DATABASE_URL") ||
      k.endsWith("_DATABASE_URL") ||
      k.endsWith("_POSTGRES_URL")
  );

  return dynamicKey ? process.env[dynamicKey] : undefined;
}

const databaseUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: databaseUrl
      ? {
          db: {
            url: databaseUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
