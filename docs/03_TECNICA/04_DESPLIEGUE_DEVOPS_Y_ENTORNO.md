# 04 — Despliegue, DevOps y Configuración de Entorno

## 1. Estrategia de Despliegue en Vercel

Oficios Express está optimizado para su despliegue continuo en la infraestructura Serverless de **Vercel** conectado directamente al repositorio GitHub (`main` branch).

### Pipeline de Build (`package.json`)
```json
"scripts": {
  "build": "node scripts/db-sync.mjs && next build --webpack",
  "postinstall": "prisma generate"
}
```

1. **`postinstall: prisma generate`**: Genera el cliente tipado de Prisma adaptado al sistema operativo de la máquina de build de Vercel.
2. **`scripts/db-sync.mjs`**: Se ejecuta antes del build de Next.js:
   - Detecta de forma inteligente cualquier variable de entorno inyectada por Vercel Storage (Neon / Postgres).
   - Aplica el esquema de datos con `prisma db push`.
   - Ejecuta la siembra de datos de prueba de Rosario (`prisma/seed.ts`) de manera idempotente (solo si la base está vacía).
   - Posee tolerancia a fallos: si la base de datos remota sufre una intermitencia transitoria de red, no cancela el build de los assets estáticos.
3. **`next build --webpack`**: Compila las rutas y Server Components de forma optimizada.

---

## 2. Resolución Dinámica de Variables de Base de Datos

En despliegues en Vercel con integraciones de bases de datos PostgreSQL (Neon, Supabase, Vercel Postgres), los nombres de variables suelen tener prefijos como `POSTGRES_PRISMA_URL` o el nombre del recurso (ej. `oficiosExpressDB_PRISMA_URL`).

Para evitar caídas por variables no encontradas, tanto `src/lib/prisma.ts` como `scripts/db-sync.mjs` implementan un motor de resolución dinámica:

```typescript
// Orden de prioridad de resolución de cadenas de conexión:
1. process.env.DATABASE_URL
2. oficiosExpressDB_PRISMA_URL / oficiosExpressDB_URL
3. POSTGRES_PRISMA_URL / POSTGRES_URL
4. Búsqueda automática por sufijo (*_PRISMA_URL, *_URL, *_DATABASE_URL)
```

---

## 3. Matriz de Variables de Entorno

| Variable | Tipo | Requerida en Prod | Ejemplo / Descripción |
|---|---|---|---|
| `DATABASE_URL` | String (URI) | Sí | `postgresql://usuario:pwd@host:5432/oficios_db?sslmode=require` |
| `JWT_SECRET` | String | Sí | Clave criptográfica aleatoria de al menos 32 caracteres para firmar sesiones. |
| `NODE_ENV` | String | Automática | `production` o `development`. |
| `NEXT_PUBLIC_APP_NAME`| String | No | Nombre público de la aplicación (por defecto `"Oficios Rosario"`). |

---

## 4. Endpoint de Recuperación en Tiempo de Ejecución (`/api/seed`)

Para situaciones en las que una base de datos de producción es creada o migrada después de completado el build, se incluye un endpoint de emergencia protegido:

- **Ruta**: `GET /api/seed`
- **Comportamiento**: Ejecuta `runSeed(prisma, false)`. Si ya existen usuarios, responde con un mensaje seguro informando que no se modificó nada; si la base está vacía, la inicializa con los 5 profesionales y 1 cliente de Rosario.
- **Forzado**: Permite `GET /api/seed?force=true` para reinicialización controlada de staging.

---

## 5. Procedimiento de Puesta en Marcha Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/marcui13/oficios-express.git
cd oficios-express

# 2. Instalar dependencias
npm install

# 3. Configurar entorno
cp .env.example .env

# 4. Sincronizar esquema y cargar datos de prueba de Rosario
npx prisma db push
npm run seed

# 5. Iniciar servidor de desarrollo
npm run dev
# Abrir http://localhost:3000
```
