import type { NextConfig } from "next";

// Mapear automáticamente cualquier variable de conexión generada por Vercel Storage
if (
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.startsWith("file:")
) {
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
  ];

  let resolvedDbUrl: string | undefined;
  for (const key of candidateKeys) {
    const val = process.env[key];
    if (
      val &&
      (val.startsWith("postgres://") || val.startsWith("postgresql://"))
    ) {
      resolvedDbUrl = val;
      break;
    }
  }

  if (!resolvedDbUrl) {
    const dynamicKey = Object.keys(process.env).find((k) => {
      const val = process.env[k];
      return (
        typeof val === "string" &&
        (k.endsWith("_PRISMA_URL") ||
          k.endsWith("_URL") ||
          k.endsWith("_DATABASE_URL")) &&
        (val.startsWith("postgres://") || val.startsWith("postgresql://"))
      );
    });
    if (dynamicKey && process.env[dynamicKey]) {
      resolvedDbUrl = process.env[dynamicKey];
    }
  }

  if (resolvedDbUrl) {
    process.env.DATABASE_URL = resolvedDbUrl;
  }
}

const nextConfig: NextConfig = {
  transpilePackages: ["@oficios/shared"],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PATCH, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
