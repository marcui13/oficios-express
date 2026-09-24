import type { NextConfig } from "next";

// Mapear automáticamente cualquier variable de conexión generada por Vercel Storage
if (!process.env.DATABASE_URL) {
  const dbUrl =
    process.env.oficiosExpressDB_PRISMA_DATABASE_URL ||
    process.env.oficiosExpressDB_DATABASE_URL ||
    process.env.oficiosExpressDB_POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  if (dbUrl) {
    process.env.DATABASE_URL = dbUrl;
  } else {
    const dynamicKey = Object.keys(process.env).find(
      (k) =>
        k.endsWith("_PRISMA_DATABASE_URL") ||
        k.endsWith("_DATABASE_URL") ||
        k.endsWith("_POSTGRES_URL")
    );
    if (dynamicKey && process.env[dynamicKey]) {
      process.env.DATABASE_URL = process.env[dynamicKey];
    }
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
