import { execSync } from "child_process";

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.POSTGRES_PRISMA_DATABASE_URL) return process.env.POSTGRES_PRISMA_DATABASE_URL;
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
  if (process.env.POSTGRES_DATABASE_URL) return process.env.POSTGRES_DATABASE_URL;
  if (process.env.oficiosExpressDB_PRISMA_DATABASE_URL) return process.env.oficiosExpressDB_PRISMA_DATABASE_URL;
  if (process.env.oficiosExpressDB_DATABASE_URL) return process.env.oficiosExpressDB_DATABASE_URL;

  // Buscar dinámicamente cualquier variable que termine con _URL
  const foundKey = Object.keys(process.env).find(
    (k) =>
      k.endsWith("_PRISMA_DATABASE_URL") ||
      k.endsWith("_DATABASE_URL") ||
      k.endsWith("_POSTGRES_URL")
  );

  return foundKey ? process.env[foundKey] : null;
}

const dbUrl = getDatabaseUrl();

if (!dbUrl) {
  console.log("⚠️ No se detectó URL de base de datos en las variables de entorno. Omitiendo db push.");
  process.exit(0);
}

console.log("🔄 Sincronizando esquema de base de datos con Prisma...");

try {
  // Sincronizar tablas
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: dbUrl },
  });
  console.log("✅ Tablas creadas/actualizadas correctamente en PostgreSQL.");

  // Opcional: Ejecutar seed si es necesario
  try {
    console.log("🌱 Ejecutando seed para poblar datos iniciales de Rosario...");
    execSync("npx tsx prisma/seed.ts", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
    console.log("✅ Seed completado con éxito en PostgreSQL.");
  } catch (seedErr) {
    console.log("ℹ️ Seed omitido o ya ejecutado previamente.");
  }
} catch (err) {
  console.error("⚠️ Error al sincronizar base de datos:", err.message);
  // No frenar el build para permitir diagnóstico
}
