import type { NextConfig } from "next";

// Si Vercel Storage inyectó POSTGRES_PRISMA_URL o POSTGRES_URL, mapearla a DATABASE_URL para Prisma
if (!process.env.DATABASE_URL) {
  if (process.env.POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  } else if (process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
