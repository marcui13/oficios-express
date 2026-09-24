# 03 — Autenticación, Sesiones y Seguridad

## 1. Arquitectura de Autenticación Stateless

Oficios Express implementa un esquema de autenticación sin estado (stateless) basado en **JSON Web Tokens (JWT)** firmados criptográficamente mediante la librería de estándar abierto **`jose`**, almacenados en **Cookies HTTP-Only** en el navegador del usuario.

### Razones Técnicas de esta Elección:
1. **Serverless-Ready**: Vercel ejecuta funciones que se inicializan y destruyen dinámicamente; mantener sesiones en memoria RAM o consultar Redis en cada petición añadiría latencia y costos.
2. **Inmune a Robo por XSS**: Al estar almacenado en una cookie con flag `HttpOnly`, el token no puede ser leído ni extraído por ningún script malicioso ejecutado en el cliente vía JavaScript (`document.cookie` no tiene acceso al token).
3. **Persistencia Óptima**: Las cookies se configuran con una duración de 30 días (`maxAge: 30 * 24 * 60 * 60`), evitando que el profesional deba ingresar contraseña a cada momento en su celular.

---

## 2. Configuración de la Cookie de Sesión

```typescript
// src/lib/auth.ts
cookieStore.set("oficios_session", token, {
  httpOnly: true,                                    // Inaccesible desde JavaScript en el cliente
  secure: process.env.NODE_ENV === "production",     // Solo transmitida sobre HTTPS en producción
  sameSite: "lax",                                   // Protección contra ataques Cross-Site Request Forgery
  path: "/",                                         // Válida para todas las rutas de la app
  maxAge: 30 * 24 * 60 * 60,                         // 30 días de persistencia
});
```

---

## 3. Criptografía y Hashing de Contraseñas

- **Algoritmo de Hash**: Se utiliza **`bcryptjs`** con un factor de costo (salt rounds) de **10**.
- **Resistencia**: Un salt round de 10 garantiza que un ataque de fuerza bruta por diccionario o tablas rainbow sea computacionalmente inviable.
- **Firma del JWT**: Algoritmo `HS256` utilizando la clave secreta `JWT_SECRET` inyectada en variables de entorno. En desarrollo, si no se proporciona, se utiliza un fallback documentado.

---

## 4. Matriz de Mitigación de Vulnerabilidades (OWASP Top 10)

| Vulnerabilidad OWASP | Riesgo Potencial | Mitigación Implementada en Oficios Express |
|---|---|---|
| **A01: Broken Access Control** | Un profesional intenta ver o responder pedidos de otro colega | En `updateRequestStatusAction`, se verifica estrictamente en servidor que `request.professional.userId === session.userId`. |
| **A02: Cryptographic Failures** | Exposición de contraseñas | Hashing unidireccional con Bcrypt (10 rounds). Tokens JWT firmados con HMAC-SHA256. |
| **A03: Injection (SQLi / XSS)** | Inyección en búsquedas o formularios | Prisma ORM utiliza consultas parametrizadas internamente, anulando la inyección SQL. React escapa cadenas por defecto contra XSS. |
| **A04: Insecure Design** | Auto-asignación de pedidos fraudulentos | Validación explícita en `createContactRequestAction`: si `pro.userId === session.userId`, se bloquea el envío. |
| **A05: Security Misconfiguration** | Errores con stacktraces visibles | En producción, los logs de Prisma se reducen a `['error']` y los errores de servidor no devuelven internals al cliente. |
| **A07: Identification and Auth Failures** | Enumeración de usuarios o contraseñas débiles | Exigencia de mínimo 6 caracteres en registro; mensaje unificado "Email o contraseña incorrectos" para prevenir enumeración. |
| **A08: Software and Data Integrity** | Subida de archivos maliciosos (ej. ejecutables camuflados) | Validación en `/api/upload`: verificación de `file.type.startsWith('image/')`, límite de 5MB y renombrado criptográfico con `Date.now() + random`. |

---

## 5. Control de Acceso Basado en Roles (RBAC)

La plataforma maneja tres roles principales:
- **`client`**: Puede explorar, crear solicitudes, subir fotos y ver su historial en `/mis-solicitudes`.
- **`professional`**: Tiene asociado un `ProfessionalProfile`, puede recibir solicitudes, aceptarlas, rechazarlas, configurar su disponibilidad y zonas en `/panel`.
- **`both`**: Permite actuar como cliente para el hogar y como profesional para trabajar.
