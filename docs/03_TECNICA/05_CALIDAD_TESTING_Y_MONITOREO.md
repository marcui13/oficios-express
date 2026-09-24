# 05 — Calidad, Testing y Monitoreo

## 1. Estrategia Integral de Aseguramiento de Calidad (QA)

La confiabilidad del marketplace depende de que las operaciones de mutación de solicitudes y disponibilidad se ejecuten con integridad transaccional. La estrategia de calidad comprende tres niveles:

1. **Tipado Estricto en TypeScript**: Verificación estática de esquemas de datos, parámetros de Server Actions e interfaces de componentes.
2. **Linting y Estándares**: Reglas de ESLint 9 configuradas con `@next/eslint-plugin-next`.
3. **Suite Automatizada de Flujos de Negocio E2E (`scripts/test-flows.ts`)**: Pruebas de integración de extremo a extremo que validan el ciclo de vida completo de usuarios, búsquedas distritales, creación de solicitudes, transiciones de estado y números de WhatsApp.

---

## 2. Cobertura de la Suite de Pruebas (`scripts/test-flows.ts`)

El script de pruebas automatizadas ejecuta 7 verificaciones críticas contra la base de datos real:

| Paso de Prueba | Qué Verifica | Criterio de Éxito |
|---|---|---|
| **Paso 1: Existencia de profesionales** | Disponibilidad de profesionales precargados en Rosario | Mínimo 5 profesionales activos en la base. |
| **Paso 2: Filtrado combinado** | Filtro de oficio `"plomeria"` y zona `"Distrito Centro"` | Retorna a Roberto Gómez y profesionales multizona. |
| **Paso 3: Creación de cliente** | Hashing de contraseña y registro de usuario cliente | Registro insertado en tabla `User` con rol `"client"`. |
| **Paso 4: Envío de solicitud** | Creación de `ContactRequest` con fotos JSON | Solicitud persistida en estado `"pending"`. |
| **Paso 5: Aceptación por el pro** | Transición de estado a `"accepted"` | Estado actualizado y relaciones de foreign key íntegras. |
| **Paso 6: Formato de WhatsApp** | Normalización de teléfonos móviles de Rosario | Cumplimiento del prefijo internacional `549341...`. |
| **Paso 7: Pausa de disponibilidad** | Modificación de `isActive: false` | El profesional se oculta inmediatamente de las consultas activas y se restaura luego. |

### Cómo Ejecutar la Suite:
```bash
npx tsx scripts/test-flows.ts
```

---

## 3. Observabilidad, Logging y Manejo de Errores

### En Servidor (Server Actions y Route Handlers):
- Todo bloque crítico está envuelto en estructuras `try/catch`.
- Los errores técnicos se registran en los logs de la consola del servidor con contexto suficiente (`requestId`, `userId`), devolviendo al cliente mensajes amigables y sanitizados (evitando filtrar detalles de infraestructura o errores de SQL).

### En Cliente:
- Los formularios utilizan el hook nativo de React `useActionState` para reflejar estados de carga (`pending`), errores de validación en tiempo real y confirmaciones de éxito sin recargar la página.

---

## 4. Checklist de Pre-Lanzamiento a Producción

- [x] Todas las contraseñas de usuarios en el seed usan bcrypt con salt rounds 10.
- [x] Los tokens JWT están firmados con clave secreta segura y viajan en cookies HTTP-Only.
- [x] Los enlaces a WhatsApp sanitizan caracteres especiales y validan el prefijo argentino.
- [x] Las imágenes subidas tienen cuota estricta de 3 fotos y 5MB de tamaño máximo.
- [x] La base de datos sincroniza automáticamente tablas y ejecuta seed idempotente en Vercel.
- [x] El diseño es 100% responsivo y táctil en pantallas móviles desde 320px de ancho.
- [x] Los filtros de distritos de Rosario devuelven resultados precisos sin duplicados.
