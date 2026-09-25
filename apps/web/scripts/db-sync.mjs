import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Cargar variables de archivos de entorno si existen en el filesystem
function loadLocalEnv() {
  for (const envFile of [".env.production", ".env.local", ".env"]) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadLocalEnv();

function getDatabaseUrl() {
  // 1. Si DATABASE_URL está definida y es Postgres
  if (
    process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith("postgres://") ||
      process.env.DATABASE_URL.startsWith("postgresql://"))
  ) {
    return process.env.DATABASE_URL;
  }

  // 2. Variables específicas de Vercel Storage / Postgres / Neon
  // Para operaciones DDL (db push), las URLs non-pooling son preferibles si están disponibles
  const candidateKeys = [
    "oficiosExpressDB_URL_NON_POOLING",
    "POSTGRES_URL_NON_POOLING",
    "oficiosExpressDB_PRISMA_URL",
    "POSTGRES_PRISMA_URL",
    "oficiosExpressDB_URL",
    "POSTGRES_URL",
    "oficiosExpressDB_PRISMA_DATABASE_URL",
    "oficiosExpressDB_DATABASE_URL",
    "oficiosExpressDB_POSTGRES_URL",
    "POSTGRES_PRISMA_DATABASE_URL",
    "POSTGRES_DATABASE_URL",
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

  // 3. Búsqueda dinámica de cualquier variable que contenga una URL de Postgres
  const dynamicKey = Object.keys(process.env).find((k) => {
    const val = process.env[k];
    return (
      typeof val === "string" &&
      (k.endsWith("_URL") ||
        k.endsWith("_PRISMA_URL") ||
        k.includes("DATABASE_URL")) &&
      (val.startsWith("postgres://") || val.startsWith("postgresql://"))
    );
  });

  return dynamicKey ? process.env[dynamicKey] : null;
}

const dbUrl = getDatabaseUrl();

if (!dbUrl) {
  console.log(
    "⚠️ No se detectó URL de base de datos PostgreSQL en las variables de entorno. Omitiendo db push."
  );
  process.exit(0);
}

console.log("🔄 Sincronizando esquema de base de datos con Prisma en PostgreSQL...");

try {
  // Sincronizar tablas en PostgreSQL
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: dbUrl },
  });
  console.log("✅ Tablas creadas/actualizadas correctamente en PostgreSQL.");

  // Ejecutar seed idempotente (puebla solo si la DB está vacía)
  try {
    console.log("🌱 Verificando estado de los datos iniciales de Rosario...");
    execSync("npx tsx prisma/seed.ts", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
    console.log("✅ Verificación y población de datos iniciales completada.");
  } catch (seedErr) {
    console.warn("⚠️ Advertencia durante el seed:", seedErr.message);
  }
} catch (err) {
  console.error("⚠️ Error al sincronizar base de datos:", err.message);
  // Permitimos continuar el build para no romper el despliegue si hay bloqueos de red transitorios
}
