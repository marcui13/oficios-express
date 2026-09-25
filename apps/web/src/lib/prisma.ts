import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function resolveDatabaseUrl(): string | undefined {
  if (
    process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith("postgres://") ||
      process.env.DATABASE_URL.startsWith("postgresql://"))
  ) {
    return process.env.DATABASE_URL;
  }

  // Candidatos inyectados por Vercel Storage (Neon / Postgres)
  const candidateKeys = [
    "oficiosExpressDB_PRISMA_URL",
    "oficiosExpressDB_URL",
    "oficiosExpressDB_URL_NON_POOLING",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL",
    "POSTGRES_URL_NON_POOLING",
    "oficiosExpressDB_PRISMA_DATABASE_URL",
    "oficiosExpressDB_DATABASE_URL",
    "oficiosExpressDB_POSTGRES_URL",
    "POSTGRES_PRISMA_DATABASE_URL",
    "POSTGRES_DATABASE_URL",
    "DATABASE_URL",
  ];

  for (const key of candidateKeys) {
    const val = process.env[key];
    if (
      val &&
      (val.startsWith("postgres://") || val.startsWith("postgresql://"))
    ) {
      return val;
    }
  }

  // Búsqueda dinámica de cualquier variable inyectada por Vercel Storage
  const dynamicKey = Object.keys(process.env).find((k) => {
    const val = process.env[k];
    return (
      typeof val === "string" &&
      (k.endsWith("_PRISMA_URL") ||
        k.endsWith("_URL") ||
        k.endsWith("_DATABASE_URL") ||
        k.endsWith("_POSTGRES_URL")) &&
      (val.startsWith("postgres://") || val.startsWith("postgresql://"))
    );
  });

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
