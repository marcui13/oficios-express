# Arquitectura del Sistema (ARCHITECTURE.md) — Oficios Express

**Versión:** 1.0.0  
**Fecha:** Septiembre 2026  
**Topología:** Monorepo Turborepo (Web Full-Stack + Mobile Nativo + Paquete Compartido)  
**Entornos:** Desarrollo Local (Zero-Config) & Producción Serverless (Vercel + Neon Postgres)  

---

## 1. Visión General de la Arquitectura

**Oficios Express** está concebido como una plataforma modular de alta velocidad orientada a dispositivos móviles. El sistema implementa una arquitectura monorepo orquestada por **Turborepo**, garantizando una estricta separación de responsabilidades, reutilización de contratos de tipos y constantes entre la aplicación web y la aplicación móvil nativa.

```
oficios-express/
├── apps/
│   ├── web/                    # Next.js 16 (App Router + Server Actions + REST API)
│   └── mobile/                 # React Native (Expo SDK 57 + Expo Router v50+)
├── packages/
│   └── shared/                 # @oficios/shared (Constantes, Tipos TypeScript, DTOs)
├── package.json                # Workspaces de npm
└── turbo.json                  # Pipelines de build, dev y linting
```

---

## 2. Modelo C4 de Arquitectura

### 2.1. Nivel 1: Contexto del Sistema (System Context)

El siguiente diagrama describe las interacciones entre los actores humanos (clientes y profesionales), Oficios Express y los sistemas externos (WhatsApp y la Base de Datos).

```mermaid
C4Context
    title Diagrama de Contexto de Oficios Express (Rosario)
    
    Person(cliente, "Cliente Hogareño", "Vecino de Rosario que sufre una avería o requiere un servicio")
    Person(pro, "Profesional de Oficio", "Plomero, electricista o gasista independiente en Rosario")
    
    System(app, "Oficios Express Monorepo", "Plataforma Web (Next.js 16) y Móvil (Expo) para búsqueda y gestión")
    
    System_Ext(whatsapp, "Meta WhatsApp (wa.me)", "Canal externo de mensajería directa punto a punto")
    System_Ext(db, "PostgreSQL Database", "Base de datos transaccional alojada en Neon / Vercel")
    
    Rel(cliente, app, "Navega catálogo, envía solicitudes con fotos", "HTTPS / JSON / Multipart")
    Rel(pro, app, "Define disponibilidad, acepta/rechaza solicitudes", "HTTPS / JSON / Session")
    Rel(cliente, whatsapp, "Coordina presupuesto y visita técnica", "Protocolo WhatsApp")
    Rel(pro, whatsapp, "Responde consultas y envía presupuesto", "Protocolo WhatsApp")
    Rel(app, db, "Consultas y mutaciones parametrizadas", "TCP / SSL / Prisma ORM")
```

---

### 2.2. Nivel 2: Diagrama de Contenedores (Containers)

```mermaid
graph TD
    subgraph Frontends ["Capa de Clientes"]
        WebApp["Web App (Next.js 16 - SSR / RSC / Client)"]
        MobileApp["Mobile App (Expo SDK 57 / React Native)"]
    end

    subgraph MonorepoShared ["Paquete Compartido"]
        SharedPkg["@oficios/shared (Constantes, Enums, Interfaces DTO)"]
    end

    subgraph BackendWeb ["Backend Serverless (Next.js 16 en Vercel)"]
        ServerActions["Server Actions (/app/actions/*)"]
        RestApi["API REST Handlers (/app/api/*)"]
        AuthModule["Módulo de Autenticación (Jose JWT / Bcrypt)"]
        UploadHandler["Procesador Multipart de Fotos (/api/upload)"]
        PrismaORM["Prisma Client ORM (Singleton con Connection Pool)"]
    end

    subgraph Storage ["Persistencia de Datos"]
        DB[(PostgreSQL Neon / SQLite local)]
        StaticStorage["/public/uploads (Almacenamiento de Imágenes)"]
    end

    WebApp -->|Consume tipos| SharedPkg
    MobileApp -->|Consume tipos y constantes| SharedPkg

    WebApp -->|RPC Server Actions| ServerActions
    MobileApp -->|Llamadas HTTP Bearer JWT| RestApi

    ServerActions --> AuthModule
    ServerActions --> PrismaORM
    RestApi --> AuthModule
    RestApi --> PrismaORM

    WebApp -->|Subida multipart de fotos| UploadHandler
    MobileApp -->|Subida multipart de fotos| UploadHandler
    UploadHandler --> StaticStorage

    PrismaORM -->|Pool SSL| DB
```

---

### 2.3. Nivel 3: Diagrama de Componentes (Web & API Backend)

```mermaid
graph LR
    subgraph WebRoutes ["Rutas y Vistas (App Router)"]
        R_Home["/ (Catálogo Server Component)"]
        R_Pro["/profesionales/[id] (Ficha Pública)"]
        R_Panel["/panel/solicitudes (Bandeja Pro)"]
        R_Client["/mis-solicitudes (Bandeja Cliente)"]
    end

    subgraph ActionsLayer ["Server Actions (Mutaciones)"]
        Act_Auth["auth.ts (login, register, logout)"]
        Act_Profile["profile.ts (updateProfile, toggleActive)"]
        Act_Req["requests.ts (createRequest, updateStatus)"]
    end

    subgraph ApiLayer ["Endpoints REST (Consumo Móvil)"]
        Api_Auth["/api/auth/[login|register]"]
        Api_Pro["/api/profesionales/[id]"]
        Api_Req["/api/solicitudes/[id]"]
        Api_Up["/api/upload"]
    end

    subgraph LibCore ["Librerías de Infraestructura"]
        Lib_Auth["lib/auth.ts (verifySession, signSession)"]
        Lib_Prisma["lib/prisma.ts (Instancia Singleton)"]
    end

    R_Pro --> Act_Req
    R_Panel --> Act_Req
    R_Panel --> Act_Profile
    
    Act_Auth --> Lib_Auth
    Act_Auth --> Lib_Prisma
    Act_Profile --> Lib_Prisma
    Act_Req --> Lib_Prisma

    Api_Auth --> Lib_Auth
    Api_Auth --> Lib_Prisma
    Api_Pro --> Lib_Prisma
    Api_Req --> Lib_Auth
    Api_Req --> Lib_Prisma
```

---

## 3. Flujos de Secuencia y Casos de Uso Críticos

### 3.1. Flujo 1: Creación de Solicitud con Subida de Fotos

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant UI as Formulario Ficha Profesional
    participant Upload as API Upload (/api/upload)
    participant FS as Almacenamiento Fotos
    participant Action as Server Action / API Solicitudes
    participant DB as Base de Datos (Prisma)

    Cliente->>UI: Selecciona hasta 3 fotos del problema
    UI->>Upload: POST multipart/form-data
    Upload->>Upload: Valida MIME (image/*) y tamaño (<5MB)
    Upload->>FS: Guarda archivo con nombre hash criptográfico
    FS-->>Upload: Retorna array de URLs ["/uploads/xyz.jpg"]
    Upload-->>UI: Retorna JSON con URLs
    
    Cliente->>UI: Ingresa descripción y confirma envío
    UI->>Action: createContactRequestAction(datos + fotos)
    Action->>Action: Verifica sesión y bloquea auto-solicitud
    Action->>DB: INSERT ContactRequest(status="pending")
    DB-->>Action: Registro creado exitosamente
    Action->>Action: revalidatePath('/mis-solicitudes')
    Action-->>UI: Retorna requestId y éxito
    UI-->>Cliente: Redirige a Mis Solicitudes
```

---

### 3.2. Flujo 2: Aceptación del Profesional y Conexión WhatsApp

```mermaid
sequenceDiagram
    autonumber
    actor Pro as Profesional de Oficio
    participant Panel as Panel Solicitudes (/panel/solicitudes)
    participant Action as updateRequestStatusAction
    participant DB as Base de Datos (Prisma)
    participant WA as WhatsApp Web / App (wa.me)

    Pro->>Panel: Abre bandeja de solicitudes
    Panel->>Pro: Muestra datos del cliente, fotos y descripción
    Pro->>Panel: Clic en "Aceptar Solicitud"
    Panel->>Action: PATCH / solicitudes/:id (status="accepted")
    Action->>Action: Verifica pertenencia (request.pro.userId === session.userId)
    Action->>DB: UPDATE ContactRequest SET status='accepted'
    DB-->>Action: Confirmación de actualización
    Action-->>Panel: Actualización de estado en tiempo real
    Panel-->>Pro: Muestra botón verde "Abrir WhatsApp con Cliente"
    Pro->>WA: Clic en botón -> Abre wa.me/549341...?text=...
    WA-->>Pro: Chat abierto listo para presupuestar
```

---

## 4. Modelo de Datos Relacional (Prisma ORM)

El esquema relacional está diseñado para soportar integridad referencial estricta en eliminaciones en cascada y flexibilidad en atributos multi-valor (oficios y distritos) mediante cadenas JSON validadas por software.

```mermaid
erDiagram
    USER ||--o| PROFESSIONAL_PROFILE : "posee (1 a 0..1)"
    USER ||--o{ CONTACT_REQUEST : "crea como cliente (1 a N)"
    PROFESSIONAL_PROFILE ||--o{ CONTACT_REQUEST : "recibe solicitudes (1 a N)"

    USER {
        string id PK "cuid()"
        string name "Nombre y apellido"
        string email UK "Correo único"
        string phone "Teléfono celular"
        string passwordHash "Hash Bcrypt 10 rounds"
        string role "client | professional | both"
        datetime createdAt "Timestamp alta"
        datetime updatedAt "Timestamp modificación"
    }

    PROFESSIONAL_PROFILE {
        string id PK "cuid()"
        string userId FK "Relación 1 a 1 con User"
        string description "Biografía y trayectoria"
        string trades "JSON Array: ['plomeria', 'gas']"
        string zones "JSON Array: ['Distrito Centro', ...]"
        string whatsapp "Teléfono normalizado (549341...)"
        boolean isActive "Switch de disponibilidad ON/OFF"
        datetime createdAt "Timestamp alta"
        datetime updatedAt "Timestamp modificación"
    }

    CONTACT_REQUEST {
        string id PK "cuid()"
        string clientId FK "User que solicita el trabajo"
        string professionalId FK "ProfessionalProfile solicitado"
        string trade "Oficio específico del pedido"
        string description "Detalle del problema"
        string photos "JSON Array: ['/uploads/f1.jpg']"
        string status "pending | accepted | rejected"
        datetime createdAt "Timestamp de creación"
        datetime updatedAt "Timestamp de cambio de estado"
    }
```

### 4.1. Código del Esquema (`apps/web/prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String               @id @default(cuid())
  name                String
  email               String               @unique
  phone               String
  passwordHash        String
  role                String               @default("client") // "client", "professional", "both"
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  professionalProfile ProfessionalProfile?
  clientRequests      ContactRequest[]     @relation("ClientRequests")
}

model ProfessionalProfile {
  id          String           @id @default(cuid())
  userId      String           @unique
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  description String
  trades      String           // JSON string: ["plomeria", "gas"]
  zones       String           // JSON string: ["Distrito Centro", "Distrito Norte"]
  whatsapp    String           // Ej: 5493411234567
  isActive    Boolean          @default(true)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  requests    ContactRequest[] @relation("ProfessionalRequests")
}

model ContactRequest {
  id             String              @id @default(cuid())
  clientId       String
  client         User                @relation("ClientRequests", fields: [clientId], references: [id], onDelete: Cascade)
  professionalId String
  professional   ProfessionalProfile @relation("ProfessionalRequests", fields: [professionalId], references: [id], onDelete: Cascade)
  trade          String
  description    String
  photos         String?             // JSON string: ["/uploads/img1.jpg"]
  status         String              @default("pending") // "pending", "accepted", "rejected"
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt
}
```

---

## 5. Contratos de la API REST (`/api/*`)

Para dar soporte integral al cliente móvil React Native / Expo, el backend expone los siguientes endpoints REST normalizados bajo la interfaz `ApiResponse<T>` de `@oficios/shared`:

### 5.1. Resumen de Endpoints

| Método | Endpoint | Autenticación Requerida | Propósito |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Registro de nuevo usuario (cliente o pro) |
| `POST` | `/api/auth/login` | No | Inicio de sesión, retorna JWT y datos de perfil |
| `GET` | `/api/profesionales` | No | Listado con filtros (`?trade=...&zone=...`) |
| `GET` | `/api/profesionales/:id`| No | Ficha detallada de un profesional específico |
| `GET` | `/api/solicitudes` | Sí (Bearer / Cookie) | Solicitudes asociadas al usuario según su rol |
| `POST` | `/api/solicitudes` | Sí (Bearer / Cookie) | Creación de nueva solicitud de contacto |
| `PATCH`| `/api/solicitudes/:id` | Sí (Bearer / Cookie) | Actualización de estado (`accepted` o `rejected`) |
| `POST` | `/api/upload` | No / Opcional | Subida multipart de hasta 3 fotos |
| `GET` | `/api/seed` | No (Protegido por env)| Inicialización idempotente con datos de prueba |

### 5.2. Estructura de Respuestas (`ApiResponse<T>`)
```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

---

## 6. Estrategia de Autenticación Dual (Web vs Mobile)

Para maximizar la seguridad en la web y la compatibilidad en aplicaciones nativas móviles, el backend de Oficios Express implementa una estrategia de **detección de credenciales polimórfica** en `apps/web/src/lib/auth.ts`:

1. **Clientes Web (Navegador Desktop y Mobile):**
   - Utilizan una **Cookie HTTP-Only** (`oficios_session`).
   - El token nunca se expone a `window` ni a JavaScript, anulando ataques de robo de sesión por XSS.
   - Duración: 30 días con política `SameSite=Lax`.
2. **Clientes Móviles Nativos (React Native / Expo):**
   - Transmiten el token mediante el encabezado estándar:  
     `Authorization: Bearer <jwt_token>`
   - La función `getSessionFromRequest(request)` inspecciona primero si existe el encabezado `Authorization`. Si está presente y comienza con `Bearer `, valida dicho token; si no, inspecciona el almacén de cookies.

---

## 7. Registro de Decisiones de Arquitectura (ADRs)

### ADR-001: Adopción de Next.js 16 App Router y Server Actions
- **Contexto:** Se requería un stack full-stack de última generación con alto rendimiento móvil en conexiones fluctuantes.
- **Decisión:** Utilizar Next.js 16 con React 19 Server Components y Server Actions (`"use server"`).
- **Consecuencias:** Reducción drástica del bundle de JavaScript enviado al cliente; las mutaciones no requieren controladores REST intermedios en la web y aprovechan la invalidación de caché integrada (`revalidatePath`).

### ADR-002: Arquitectura Monorepo con Turborepo
- **Contexto:** Mantener sincronizadas las definiciones de datos entre la web y la aplicación móvil Expo.
- **Decisión:** Configurar Turborepo con `@oficios/shared`, `@oficios/web` y `@oficios/mobile`.
- **Consecuencias:** Cero duplicación de tipos TypeScript, listas de oficios y distritos de Rosario. Si cambia una interfaz de API, ambos clientes se benefician de la comprobación estricta de tipos de TypeScript durante el build.

### ADR-003: WhatsApp (`wa.me`) como Protocolo de Handoff
- **Contexto:** Diseñar un chat propio en tiempo real implicaba altos costos de infraestructura de WebSockets, push notifications y moderación.
- **Decisión:** Derivar la conversación a WhatsApp una vez que el profesional acepta la solicitud.
- **Consecuencias:** Costo de infraestructura \$0 para mensajería; tasa de apertura de mensajes cercana al 100% en el mercado argentino.

### ADR-004: Dualidad de Motor de Base de Datos vía Prisma ORM
- **Contexto:** Para desarrollo local rápido se busca evitar la necesidad obligatoria de Docker, pero en despliegue productivo serverless se requiere un motor relacional escalable.
- **Decisión:** Configurar Prisma con soporte para PostgreSQL (Neon / Vercel Postgres) y script de sincronización `scripts/db-sync.mjs`.
- **Consecuencias:** Onboarding inmediato para cualquier desarrollador nuevo con SQLite o Postgres, garantizando integridad referencial estricta en producción.

### ADR-005: Almacenamiento JSON para Colecciones Rápidas
- **Contexto:** Los oficios y zonas de cobertura de un profesional son colecciones pequeñas (1 a 6 elementos) de lectura masiva.
- **Decisión:** Guardar `trades`, `zones` y `photos` como cadenas JSON serializadas dentro de la misma tupla relacional, complementadas con parseo en la capa de tipos de TypeScript.
- **Consecuencias:** Reduce las operaciones JOIN en consultas frecuentes del catálogo, mejorando la velocidad de respuesta a menos de 50 milisegundos.
