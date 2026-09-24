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
   npx prisma db push
   npm run seed
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

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

## 📁 Estructura del Proyecto

```
├── prisma/
│   ├── schema.prisma       # Modelos User, ProfessionalProfile, ContactRequest
│   └── seed.ts             # Datos iniciales para Rosario
├── public/
│   └── uploads/            # Fotos subidas por clientes
├── scripts/
│   └── test-flows.ts       # Test automatizado de flujos de negocio
├── src/
│   ├── app/
│   │   ├── actions/        # Server actions (auth, requests, profile)
│   │   ├── api/upload/     # Endpoint para subida de fotos
│   │   ├── login/          # Inicio de sesión
│   │   ├── registro/       # Registro de cliente o profesional
│   │   ├── mis-solicitudes/# Bandeja de seguimiento del cliente
│   │   ├── panel/          # Panel del profesional (solicitudes y perfil)
│   │   ├── profesionales/  # Detalle público del profesional y formulario
│   │   ├── layout.tsx      # Layout con navegación
│   │   └── page.tsx        # Home con catálogo y filtros por zona de Rosario
│   ├── components/         # Navbar, WhatsAppButton, TradeIcon, formularios
│   └── lib/                # Prisma client, autenticación y constantes de Rosario
```
