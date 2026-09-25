# Política y Modelo de Seguridad (SECURITY.md) — Oficios Express

**Versión:** 1.0.0  
**Fecha:** Septiembre 2026  
**Ámbito:** Monorepo Oficios Express (Web Next.js 16 + API REST + App Móvil Expo)  
**Clasificación:** Política Oficial de Seguridad y Guía de Mitigación OWASP  

---

## 1. Declaración de Compromiso y Divulgación Responsable

La seguridad de los datos de nuestros usuarios, tanto clientes hogareños como profesionales de oficios de la ciudad de Rosario, es una prioridad crítica de ingeniería. Agradecemos la colaboración de la comunidad y de investigadores de seguridad independientes para identificar y resolver de forma proactiva cualquier vulnerabilidad.

### 1.1. Procedimiento de Reporte
Si descubrís una vulnerabilidad de seguridad o falla potencial en la plataforma:
- **Canal Oficial:** Envianos un correo electrónico confidencial a `seguridad@oficiosexpress.com.ar` (o mediante el issue tracker privado de GitHub marcando la opción *"Security advisory"*).
- **Detalle del Reporte:** Incluí pasos claros para reproducir la falla (PoC), endpoints o rutas afectadas y descripción del impacto estimado.
- **Acuerdo de Divulgación Responsable (Coordinated Vulnerability Disclosure):** Nos comprometemos a acusar recibo en menos de **48 horas hábiles**, proporcionar una evaluación técnica inicial en un máximo de **5 días hábiles**, y acordar una ventana de remediación antes de cualquier divulgación pública.

---

## 2. Modelo de Amenazas (STRIDE Threat Model)

| Categoría STRIDE | Amenaza Potencial en Oficios Express | Mitigación Técnica Implementada |
|---|---|---|
| **Spoofing (Suplantación)** | Un atacante se hace pasar por un profesional o usurpa la sesión de otro cliente. | Sesiones firmadas criptográficamente con tokens JWT (HS256) vía `jose`. En Web, cookies `HttpOnly` inaccesibles por JS. |
| **Tampering (Manipulación)** | Alteración de los datos de una solicitud o forzado de estados de ticket (ej. pasar a `accepted` sin ser el profesional asignado). | Validación estricta en el servidor en cada Server Action y Route Handler: `request.professional.userId === session.userId`. |
| **Repudiation (Repudio)** | Un profesional niega haber aceptado o rechazado una solicitud. | Registro inmutable de transiciones con sellos de tiempo (`createdAt`, `updatedAt`) vinculados a `userId` autenticado. |
| **Information Disclosure (Fuga)** | Exposición de números de teléfono, correos electrónicos o contraseñas en respuestas públicas. | El catálogo público y endpoints `/api/profesionales` filtran hashes de contraseñas (`select` explícito en Prisma). Los datos del cliente solo se revelan al profesional asignado. |
| **Denial of Service (DoS)** | Saturación del servidor mediante subida masiva de archivos pesados o flooding de solicitudes. | Límite estricto de **5 MB por archivo** y máximo **3 fotos** por solicitud. Validación de tipos MIME antes de persistir en disco. |
| **Elevation of Privilege (Privilegios)** | Un usuario con rol `client` intenta modificar configuraciones de un perfil profesional o acceder a `/panel`. | Control de acceso basado en roles (RBAC) verificado en el servidor antes de ejecutar mutaciones. |

---

## 3. Matriz de Mitigación OWASP Top 10 (2021 - 2026)

### A01: Broken Access Control (Control de Acceso Defectuoso)
- **Riesgo:** IDOR (Insecure Direct Object Reference) en la actualización de estados de solicitudes o edición de perfiles.
- **Mitigación:** En `apps/web/src/app/actions/requests.ts` y `/api/solicitudes/[id]`, se comprueba explícitamente la propiedad del recurso:
  ```typescript
  // Verificación estricta en servidor
  const request = await prisma.contactRequest.findUnique({
    where: { id: requestId },
    include: { professional: true },
  });
  if (request.professional.userId !== session.userId) {
    return { success: false, error: "No tenés permiso para responder esta solicitud" };
  }
  ```
- **Auto-solicitud bloqueada:** Un profesional tiene prohibido enviarse solicitudes a sí mismo (`pro.userId === session.userId`).

### A02: Cryptographic Failures (Fallas Criptográficas)
- **Contraseñas:** Hasheadas unidireccionalmente con **`bcryptjs`** utilizando un factor de coste (salt rounds) de **`10`**. Las contraseñas en texto plano nunca se registran en logs ni se almacenan en la base de datos.
- **Firma de Tokens:** Generación de JWTs mediante estándar **`HS256`** con una clave secreta (`JWT_SECRET`) robusta proveniente de variables de entorno.
- **Tránsito:** Forzado de conexiones HTTPS con certificados TLS 1.3 en el despliegue productivo de Vercel.

### A03: Injection (Inyecciones SQL / NoSQL / XSS)
- **Inyección SQL:** Anulada por diseño al utilizar **Prisma ORM**. Todas las consultas (`findUnique`, `findMany`, `create`, `update`) se ejecutan como consultas parametrizadas (*prepared statements*) en el motor PostgreSQL / SQLite.
- **Cross-Site Scripting (XSS):** React 19 y Next.js escapan automáticamente todas las cadenas interpoladas en el JSX/TSX. No se utiliza `dangerouslySetInnerHTML` en ningún componente del proyecto.

### A04: Insecure Design (Diseño Inseguro)
- Máquina de estados finita y controlada para las solicitudes: únicamente se permiten transiciones válidas (`pending` -> `accepted` | `rejected`).
- Flujo de contacto con WhatsApp: se desacopla la mensajería interna; la aplicación únicamente genera el enlace seguro pre-formateado a `wa.me` sin exponer credenciales externas.

### A05: Security Misconfiguration (Mala Configuración de Seguridad)
- **Entorno de Producción:** Mensajes de error amigables sin exponer stack traces ni detalles internos de la base de datos al cliente.
- **Configuración de Cookies:**
  ```typescript
  cookieStore.set("oficios_session", token, {
    httpOnly: true,                                // Inaccesible por JavaScript (XSS safe)
    secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
    sameSite: "lax",                               // Mitiga ataques CSRF
    path: "/",
    maxAge: 30 * 24 * 60 * 60,                     // Expiración a 30 días
  });
  ```

### A06: Vulnerable and Outdated Components (Dependencias Vulnerables)
- Auditorías automatizadas de dependencias vía `npm audit` integradas en el ciclo de integración continua.
- Pinned versions en `package.json` para librerías críticas de autenticación (`jose`, `bcryptjs`, `prisma`).

### A07: Identification and Authentication Failures (Fallas de Identificación)
- **Prevención de Enumeración de Cuentas:** El endpoint de inicio de sesión (`/api/auth/login` y Server Action de login) responde con el mensaje genérico unificado:  
  *"Email o contraseña incorrectos"* tanto si el correo no existe como si la clave es errónea.
- **Tiempos de Comparación:** `bcrypt.compare` opera en tiempo constante, previniendo ataques de análisis de tiempo (*timing attacks*).

### A08: Software and Data Integrity Failures (Seguridad en Subida de Archivos)
- En `apps/web/src/app/api/upload/route.ts`:
  1. Verificación obligatoria de tipo MIME: Solo se admiten archivos cuyo `file.type` comience con `image/` (`image/jpeg`, `image/png`, `image/webp`).
  2. Límite de tamaño: Rechazo inmediato de archivos mayores a **5 MB**.
  3. Renombrado aleatorio criptográfico: Los archivos nunca conservan el nombre original enviado por el cliente; se renombran con prefijos temporales y hashes aleatorios (`${Date.now()}-${randomString}.${ext}`) para evitar sobrescrituras y ataques de Directory Traversal (`../../`).

### A09: Security Logging and Monitoring (Monitoreo y Auditoría)
- Registro estructurado de eventos de autenticación y transiciones de solicitudes en los logs del servidor.
- Supresión de logs sensibles: contraseñas, tokens y datos personales confidenciales no se imprimen en stdout.

### A10: Server-Side Request Forgery (SSRF)
- El backend de Oficios Express no realiza peticiones salientes arbitrarias a URLs provistas por el usuario. La comunicación con WhatsApp se ejecuta exclusivamente en el navegador/dispositivo del usuario mediante deep-links (`https://wa.me/...`).

---

## 4. Control de Acceso Basado en Roles (RBAC)

La plataforma distingue tres niveles de autorización definidos en el enum `UserRole`:

| Recurso / Ruta | Rol `client` | Rol `professional` | Rol `both` | Visitante Anónimo |
|---|:---:|:---:|:---:|:---:|
| **Navegar Catálogo `/`** | ✅ Permitido | ✅ Permitido | ✅ Permitido | ✅ Permitido |
| **Ver Ficha de Profesional `/profesionales/:id`** | ✅ Permitido | ✅ Permitido | ✅ Permitido | ✅ Permitido |
| **Crear Solicitud de Contacto** | ✅ Permitido | ⚠️ Permitido (solo a terceros)| ✅ Permitido | ❌ Requiere Login |
| **Bandeja `/mis-solicitudes`** | ✅ Permitido | ❌ No accesible | ✅ Permitido | ❌ Redirige Login |
| **Bandeja `/panel/solicitudes`** | ❌ No accesible | ✅ Permitido | ✅ Permitido | ❌ Redirige Login |
| **Configuración `/panel/perfil`** | ❌ No accesible | ✅ Permitido | ✅ Permitido | ❌ Redirige Login |
| **Aceptar / Rechazar Solicitudes** | ❌ Denegado | ✅ Permitido (propias) | ✅ Permitido | ❌ Denegado |

---

## 5. Gestión de Secretos y Variables de Entorno

### 5.1. Variables Críticas
- `DATABASE_URL`: Cadena de conexión cifrada con SSL al motor PostgreSQL (Neon) o SQLite. **Nunca debe commitearse al repositorio.**
- `JWT_SECRET`: Clave simétrica de al menos 32 caracteres pseudoaleatorios para la firma HS256 de los tokens de sesión.
- `NODE_ENV`: Define el entorno de ejecución (`development` vs `production`), activando las flags `secure` de cookies y optimizaciones de seguridad de Next.js.

### 5.2. Reglas para Desarrolladores
- Utilizar exclusivamente `.env.example` para documentar la estructura de variables requeridas sin valores reales.
- El archivo `.env` está expresamente ignorado en `.gitignore`.
- Ninguna clave o secreto debe ser inyectado en variables con prefijo `NEXT_PUBLIC_` o `EXPO_PUBLIC_` a menos que sea intrínsecamente pública (ej. `EXPO_PUBLIC_API_URL`).

---

## 6. Procedimiento ante Incidentes de Seguridad

En caso de detectarse un compromiso de seguridad o filtración:
1. **Contención Inmediata:** Revocación de secretos afectados (`JWT_SECRET`, credenciales de base de datos) y forzado de invalidación de sesiones activas.
2. **Aislamiento:** Despliegue de actualización correctiva en Vercel y cierre temporal de endpoints comprometidos si fuera necesario.
3. **Análisis Forense:** Inspección de los logs de transacciones en Vercel y Neon para determinar el alcance exacto de la exposición de datos.
4. **Notificación:** Comunicación transparente a los usuarios afectados conforme a las normativas de protección de datos personales vigentes (Ley 25.326 de la República Argentina).
