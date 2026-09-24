import { PrismaClient } from "@prisma/client";
import { runSeed } from "../src/lib/seed-data";

function resolveDatabaseUrl(): string | undefined {
  if (
    process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith("postgres://") ||
      process.env.DATABASE_URL.startsWith("postgresql://"))
  ) {
    return process.env.DATABASE_URL;
  }

  const candidateKeys = [
    "oficiosExpressDB_URL_NON_POOLING",
    "oficiosExpressDB_PRISMA_URL",
    "oficiosExpressDB_URL",
    "POSTGRES_URL_NON_POOLING",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL",
  ];

  for (const k of candidateKeys) {
    const val = process.env[k];
    if (val && (val.startsWith("postgres://") || val.startsWith("postgresql://"))) {
      return val;
    }
  }

  const dynamicKey = Object.keys(process.env).find((k) => {
    const val = process.env[k];
    return (
      typeof val === "string" &&
      (k.endsWith("_PRISMA_URL") || k.endsWith("_URL")) &&
      (val.startsWith("postgres://") || val.startsWith("postgresql://"))
    );
  });

  return dynamicKey ? process.env[dynamicKey] : process.env.DATABASE_URL;
}

const resolvedUrl = resolveDatabaseUrl();
const prisma = new PrismaClient(
  resolvedUrl ? { datasources: { db: { url: resolvedUrl } } } : undefined
);

async function main() {
  const force = process.env.FORCE_SEED === "true" || process.argv.includes("--force");
  const result = await runSeed(prisma, force);
  console.log(`ℹ️ ${result.message}`);
  if (!result.alreadySeeded) {
    console.log("✅ Cuentas de prueba listas para usar:");
    console.log("- Cliente: sofia@cliente.com / password123");
    console.log("- Profesional Roberto (Plomería/Gas): roberto@pro.com / password123");
    console.log("- Profesional Carlos (Electricidad): carlos@pro.com / password123");
    console.log("- Profesional Martín (Albañilería/Pintura): martin@pro.com / password123");
    console.log("- Profesional Lucas (Cerrajería): lucas@pro.com / password123");
    console.log("- Profesional Diego (Jardinería/Clima): diego@pro.com / password123");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
