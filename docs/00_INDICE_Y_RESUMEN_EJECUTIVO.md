# Oficios Express — Rosario, Santa Fe
## Índice Maestro y Resumen Ejecutivo del Proyecto

---

### 1. Resumen Ejecutivo (Executive Summary)

**Oficios Express** es una plataforma digital mobile-first diseñada específicamente para el ecosistema urbano de **Rosario, Santa Fe (Argentina)**, cuyo propósito es conectar de forma ágil, segura y directa a personas que necesitan reparaciones, mantenimiento o instalaciones en el hogar con trabajadores de oficios verificados y calificados (plomeros, electricistas, gasistas, albañiles, pintores, cerrajeros, carpinteros, jardineros y técnicos de climatización).

#### El Problema
- **Para los clientes/hogares en Rosario**: Encontrar un profesional de oficio confiable y disponible en su zona sigue dependiendo del boca a boca informal, grupos dispersos de Facebook o recomendaciones precarias. Existe incertidumbre de precios, falta de respuesta rápida en emergencias y temor a la informalidad.
- **Para los profesionales independientes**: Tienen dificultades para conseguir clientes continuos en sus zonas de cobertura habituales, pierden tiempo coordinando visitas sin información técnica previa (ej. no saben qué repuesto llevar o cuál es el problema exacto), y las plataformas globales les cobran altas comisiones por adelantado o exigen intermediaciones burocráticas que no se adaptan al uso cotidiano del teléfono móvil en Argentina.

#### La Solución Oficios Express (MVP Validado)
Una aplicación web progresiva y ultraliviana con:
1. **Catálogo geolocalizado por distritos de Rosario**: Filtros inmediatos por oficio y distrito municipal (Centro, Norte, Noroeste, Oeste, Sudoeste, Sur).
2. **Cero fricción en la exploración**: El cliente busca y descubre profesionales sin registrarse previamente.
3. **Solicitudes enriquecidas**: El cliente detalla su necesidad y adjunta hasta 3 fotos del problema real (bacha rota, tablero quemado, pared con humedad), permitiendo al profesional diagnosticar antes de responder.
4. **Conexión directa vía WhatsApp**: En lugar de forzar un chat cerrado y costoso dentro de la app, el profesional acepta la solicitud y se abre una conversación pre-formateada directa en WhatsApp (`wa.me`), el canal de comunicación nativo y dominante en Argentina.
5. **Control de disponibilidad para el profesional**: Switch para pausar o activar su perfil en tiempo real, evitando solicitudes cuando está saturado de trabajo.

---

### 2. Estructura de la Documentación

Esta suite de documentación ha sido organizada en tres pilares estratégicos exhaustivos:

```
docs/
├── 00_INDICE_Y_RESUMEN_EJECUTIVO.md           # Visión global y mapa de navegación
├── GUIA_CARGA_GOOGLE_DRIVE.md                 # Instrucciones para sincronizar con Google Drive
│
├── 01_NEGOCIO/
│   ├── 01_MODELO_DE_NEGOCIO_Y_ESTRATEGIA.md   # Business model canvas, monetización, unit economics
│   ├── 02_GO_TO_MARKET_Y_CRECIMIENTO.md       # Estrategia de lanzamiento local en Rosario y canales GTM
│   └── 03_METRICAS_Y_KPIS.md                  # North Star metric, métricas operativas y de retención
│
├── 02_PRODUCTO/
│   ├── 01_VISION_Y_ALCANCE_DEL_PRODUCTO.md    # Visión de producto, alcance del MVP vs Roadmap
│   ├── 02_USER_PERSONAS_Y_JOURNEYS.md         # Perfiles de usuarios y Customer Journey Maps
│   ├── 03_ESPECIFICACIONES_FUNCIONALES.md     # User stories (Gherkin), reglas de negocio y validaciones
│   └── 04_UX_UI_Y_ARQUITECTURA_DE_INFORMACION.md # Diseño mobile-first, flujos de pantalla y navegación
│
└── 03_TECNICA/
    ├── 01_ARQUITECTURA_DEL_SISTEMA.md         # Next.js 16 App Router, C4 diagrams y Server Actions
    ├── 02_MODELO_DE_DATOS_Y_BASE_DE_DATOS.md  # Esquema relacional Prisma, PostgreSQL y DDL
    ├── 03_AUTENTICACION_Y_SEGURIDAD.md        # JWT HS256, cookies HTTP-Only, bcrypt y mitigación OWASP
    ├── 04_DESPLIEGUE_DEVOPS_Y_ENTORNO.md      # Vercel, Neon Postgres, db-sync automático y runtime
    └── 05_CALIDAD_TESTING_Y_MONITOREO.md      # Suite de tests E2E de flujos, observabilidad y logs
```

---

### 3. Ficha Técnica del Proyecto

| Parámetro | Detalle |
|---|---|
| **Nombre del Producto** | Oficios Express (Rosario) |
| **Versión Actual** | 0.1.0 (MVP Producción Estable) |
| **Mercado Geográfico** | Gran Rosario (Santa Fe, Argentina) — 6 distritos oficiales |
| **Front-End / Back-End** | Next.js 16.3.6 (App Router, Server Actions, React 19.2.8) |
| **Estilos e Iconografía** | Tailwind CSS v4, Lucide React Icons |
| **Base de Datos** | PostgreSQL (Neon / Vercel Postgres) con Prisma ORM 6.19 |
| **Autenticación** | Stateless HTTP-Only Session Cookies, Jose JWT (HS256), Bcrypt.js |
| **Despliegue** | Vercel Serverless con sincronización automática de base de datos |
| **Repositorio** | `https://github.com/marcui13/oficios-express` |

---

### 4. Enlaces Rápidos a Documentos

- **Estrategia y Monetización**: [01_MODELO_DE_NEGOCIO_Y_ESTRATEGIA.md](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/01_NEGOCIO/01_MODELO_DE_NEGOCIO_Y_ESTRATEGIA.md)
- **Crecimiento y GTM Rosario**: [02_GO_TO_MARKET_Y_CRECIMIENTO.md](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/01_NEGOCIO/02_GO_TO_MARKET_Y_CRECIMIENTO.md)
- **Métricas y KPIs**: [03_METRICAS_Y_KPIS.md](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/01_NEGOCIO/03_METRICAS_Y_KPIS.md)
- **Visión y Roadmap de Producto**: [01_VISION_Y_ALCANCE_DEL_PRODUCTO.md](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/02_PRODUCTO/01_VISION_Y_ALCANCE_DEL_PRODUCTO.md)
- **Historias de Usuario y Casos de Uso**: [03_ESPECIFICACIONES_FUNCIONALES.md](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/02_PRODUCTO/03_ESPECIFICACIONES_FUNCIONALES.md)
- **Arquitectura de Software y C4**: [01_ARQUITECTURA_DEL_SISTEMA.md](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/03_TECNICA/01_ARQUITECTURA_DEL_SISTEMA.md)
- **Modelo Relacional de Datos**: [02_MODELO_DE_DATOS_Y_BASE_DE_DATOS.md](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/03_TECNICA/02_MODELO_DE_DATOS_Y_BASE_DE_DATOS.md)
- **Guía de Carga a Google Drive**: [GUIA_CARGA_GOOGLE_DRIVE.md](file:///Users/agustinmarquardt/Documents/SourceCodes/oficios-express/docs/GUIA_CARGA_GOOGLE_DRIVE.md)
