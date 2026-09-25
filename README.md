# Oficios Express — Rosario, Santa Fe

Plataforma MVP simple, ágil y mobile-first para conectar personas que necesitan reparaciones en el hogar con profesionales de oficio (plomeros, electricistas, gasistas, albañiles, pintores, cerrajeros, etc.) en **Rosario, Santa Fe**.

---

## 🎯 Objetivo del MVP

Resolver exclusivamente los dos flujos centrales de validación:

1. **Cliente**:
   - Explora oficios y profesionales sin necesidad de registro previo.
   - Filtra por oficio y distrito de Rosario (Centro, Norte, Noroeste, Oeste, Sudoeste, Sur).
   - Envía una solicitud de contacto con descripción y fotos opcionales identificándose con su teléfono/correo.
   - Sigue el estado de su solicitud y continúa la conversación directamente por **WhatsApp** una vez aceptada.

2. **Profesional**:
   - Configura su perfil profesional (oficios, distritos de Rosario donde trabaja, descripción y WhatsApp).
   - Activa o pausa la disponibilidad de su perfil con un switch.
   - Recibe solicitudes con fotos y descripción.
   - Acepta o rechaza solicitudes. Al aceptar, abre contacto directo por WhatsApp con el cliente.

---

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, TypeScript)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconos**: [Lucide Icons](https://lucide.dev/)
- **Base de Datos**: SQLite con [Prisma ORM](https://www.prisma.io/) (zero-config, lista para migrar a PostgreSQL)
- **Autenticación**: Sesiones seguras mediante Cookies HTTP-Only con JWT (`jose`) y passwords hasheadas con `bcryptjs`.
- **Comunicación**: Enlace directo a WhatsApp (`wa.me`) con formato local para Argentina / Rosario (`549341...`).

---

## 🚀 Instalación y Puesta en Marcha

1. **Clonar e instalar dependencias:**
   ```bash
   git clone https://github.com/marcui13/oficios-express.git
   cd oficios-express
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

3. **Inicializar y poblar la base de datos (con datos de prueba de Rosario):**
   ```bash
   npm run db:push
   npm run seed
   ```

4. **Iniciar en modo desarrollo:**
   - **Aplicación Web (Next.js):**
     ```bash
     npm run dev:web
     ```
     Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

   - **Aplicación Móvil (React Native con Expo):**
     ```bash
     npm run dev:mobile
     ```
     Presioná `i` para abrir el simulador de iOS, `a` para emulador Android, `w` para web, o escaneá el QR con la app **Expo Go** en tu celular físico.

   - **Ambas aplicaciones simultáneas (Turborepo):**
     ```bash
     npm run dev
     ```

---

## 👥 Cuentas de Prueba Pre-cargadas (Seed)

Todas las cuentas usan la contraseña: `password123`

| Rol | Nombre | Oficios / Zonas | Correo |
|---|---|---|---|
| **Cliente** | Sofía Martínez | — | `sofia@cliente.com` |
| **Profesional** | Roberto Gómez | Plomería y Gas (Centro, Norte) | `roberto@pro.com` |
| **Profesional** | Carlos Fernández | Electricidad (Centro, Oeste) | `carlos@pro.com` |
| **Profesional** | Martín Lucero | Albañilería y Pintura (Sur, Sudoeste) | `martin@pro.com` |
| **Profesional** | Lucas Rossi | Cerrajería 24hs (Toda la ciudad) | `lucas@pro.com` |
| **Profesional** | Diego Morales | Jardinería y Climatización (Norte, Noroeste) | `diego@pro.com` |

---

## 📁 Estructura del Monorepo

```
oficios-express/
├── apps/
│   ├── web/                    # Aplicación Next.js 16 (Web + API REST)
│   │   ├── prisma/             # Base de datos y seed de Rosario
│   │   ├── public/             # Assets públicos y subidas
│   │   └── src/app/
│   │       ├── api/            # Endpoints REST (profesionales, auth, solicitudes)
│   │       └── ...             # Páginas web existentes
│   │
│   └── mobile/                 # App nativa React Native (Expo SDK 57 + Expo Router)
│       ├── assets/             # Iconos y splash nativo
│       ├── metro.config.js     # Resolución de paquetes monorepo
│       └── src/
│           ├── app/            # Rutas móviles (Explorar, Profesional/[id], Solicitudes)
│           ├── context/        # Estado de sesión (AuthContext)
│           └── services/       # Cliente HTTP (api.ts) conectado a apps/web
│
├── packages/
│   └── shared/                 # Paquete compartido (@oficios/shared)
│       └── src/
│           ├── constants.ts    # Oficios, Distritos de Rosario y WhatsApp helpers
│           └── types.ts        # Interfaces y tipos de datos compartidos
│
├── package.json                # Workspaces de npm y scripts de orquestación
└── turbo.json                  # Configuración de pipelines (Turborepo)
```

---

## 📚 Documentación Completa

Para acceder a toda la documentación estratégica y técnica del proyecto:
- [Resumen Ejecutivo e Índice General](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/00_INDICE_Y_RESUMEN_EJECUTIVO.md)
- [01 — Negocio (Modelo, GTM y KPIs)](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/01_NEGOCIO/01_MODELO_DE_NEGOCIO_Y_ESTRATEGIA.md)
- [02 — Producto (Visión, Personas, Historias de Usuario)](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/02_PRODUCTO/01_VISION_Y_ALCANCE_DEL_PRODUCTO.md)
- [03 — Técnica (Arquitectura C4, DB, Seguridad, Despliegue)](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/03_TECNICA/01_ARQUITECTURA_DEL_SISTEMA.md)
- [Guía de Carga a Google Drive](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/GUIA_CARGA_GOOGLE_DRIVE.md)

