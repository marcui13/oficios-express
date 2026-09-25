# Guía de Estilo de Código y Estándares de Ingeniería (CODE_STYLE.md) — Oficios Express

**Versión:** 1.0.0  
**Fecha:** Septiembre 2026  
**Ámbito:** Monorepo Completo (`apps/web`, `apps/mobile`, `packages/shared`)  
**Stack Principal:** TypeScript 5, Next.js 16, React 19, Expo SDK 57, Tailwind CSS v4, Prisma ORM  

---

## 1. Principios Fundamentales de Ingeniería

1. **Simplicidad sobre Complejidad Prematura:** Preferir código directo, legible y fácil de eliminar antes que abstracciones sofisticadas que aumentan la carga cognitiva.
2. **Seguridad de Tipos Estricta (Zero `any`):** Todo dato que viaje entre el cliente y el servidor debe contar con tipos estáticos definidos. Si un tipo es desconocido en tiempo de compilación, utilizar `unknown` y validación en tiempo de ejecución.
3. **Fuente Única de Verdad (`@oficios/shared`):** Ninguna interfaz de API, DTO de solicitud o listado de distritos/oficios debe duplicarse entre aplicaciones. Si es de dominio, pertenece al paquete compartido.
4. **Server Components por Defecto:** En Next.js, todo componente es un React Server Component (RSC) salvo que requiera explícitamente estado local, efectos o manejadores de eventos.
5. **Ergonomía y Rendimiento Móvil:** Escribir código pensando en procesadores móviles de gama media y conexiones 4G/5G con latencia variable.

---

## 2. Estándares de TypeScript

### 2.1. Configuración Estricta
El proyecto opera con `"strict": true` en todos los archivos `tsconfig.json`.

- ❌ **Prohibido el uso de `any`:**
  ```typescript
  // ❌ INCORRECTO
  function formatUser(data: any) {
    return data.name;
  }

  // ✅ CORRECTO
  import { UserSummary } from "@oficios/shared";

  function formatUser(data: UserSummary): string {
    return data.name;
  }
  ```

- **Uso de Interfaces vs Types:**
  - Utilizar `interface` para definir formas de objetos, modelos de datos y contratos de componentes que puedan ser extendidos.
  - Utilizar `type` para uniones discriminadas, tuplas o tipos utilitarios.
  ```typescript
  // ✅ Interfaces para contratos de objetos
  export interface TradeOption {
    id: string;
    name: string;
    description: string;
    icon: string;
  }

  // ✅ Types para uniones y literales
  export type RequestStatus = "pending" | "accepted" | "rejected";
  export type RosarioDistrict = (typeof ROSARIO_DISTRICTS)[number];
  ```

- **Evitar Enums de TypeScript Clásicos:**  
  Preferir objetos constantes con `as const` o tipos literales de cadena, ya que generan menos overhead en el bundle de JavaScript:
  ```typescript
  // ✅ RECOMENDADO
  export const USER_ROLES = ["client", "professional", "both"] as const;
  export type UserRole = (typeof USER_ROLES)[number];
  ```

---

## 3. Convenciones en Next.js 16 y React 19 (Web)

### 3.1. React Server Components (RSC) vs Client Components
- Mantener los componentes del servidor en el nivel superior de la jerarquía (ej. páginas `page.tsx` y layouts `layout.tsx`).
- Mover la directiva `"use client"` únicamente a los nodos hoja interactivos (botones con listeners, formularios reactivos, uploaders).

```tsx
// apps/web/src/app/profesionales/[id]/page.tsx (Server Component)
import { prisma } from "@/lib/prisma";
import { ContactRequestForm } from "@/components/ContactRequestForm"; // Client Component
import { TradeIcon } from "@/components/TradeIcon";

export default async function ProfessionalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pro = await prisma.professionalProfile.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!pro) return <div>Profesional no encontrado</div>;

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-slate-900">{pro.user.name}</h1>
      {/* El formulario interactivo se delega como Client Component */}
      <ContactRequestForm professionalId={pro.id} />
    </main>
  );
}
```

### 3.2. Server Actions y Mutaciones
- Toda Server Action debe comenzar con la directiva `"use server"`.
- Validar siempre los datos de entrada en el servidor antes de tocar la base de datos.
- Verificar explícitamente la sesión del usuario mediante `getSession()`.
- Invalidar la caché de ruta correspondiente con `revalidatePath()`.
- Retornar siempre objetos de resultado estructurados y predecibles:

```typescript
// apps/web/src/app/actions/requests.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export interface RequestActionResult {
  success?: boolean;
  error?: string;
  requestId?: string;
}

export async function updateRequestStatusAction(
  requestId: string,
  newStatus: "accepted" | "rejected"
): Promise<RequestActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Tenés que iniciar sesión para continuar" };
  }

  const request = await prisma.contactRequest.findUnique({
    where: { id: requestId },
    include: { professional: true },
  });

  if (!request || request.professional.userId !== session.userId) {
    return { success: false, error: "No tenés permiso para responder esta solicitud" };
  }

  await prisma.contactRequest.update({
    where: { id: requestId },
    data: { status: newStatus },
  });

  revalidatePath("/panel/solicitudes");
  revalidatePath("/mis-solicitudes");

  return { success: true };
}
```

---

## 4. Convenciones en React Native y Expo (Mobile)

### 4.1. Enrutamiento con Expo Router
- Usar la estructura de carpetas de `apps/mobile/src/app/`.
- Rutas dinámicas en carpetas o archivos con corchetes (ej. `profesional/[id].tsx`).
- Rutas comunes en layouts agrupados `_layout.tsx`.

### 4.2. Soporte Multiplataforma y Archivos de Extensión
Cuando una funcionalidad o animación se comporte de forma diferente en la web versus los dispositivos móviles nativos, utilizar la convención de extensiones de Expo/Metro:
- `componente.tsx` -> Código nativo (iOS / Android)
- `componente.web.tsx` -> Código para navegador web

### 4.3. Ergonomía Táctil y Áreas Seguras
- Envolver las pantallas completas en `SafeAreaView` de `react-native-safe-area-context` para respetar notches, Dynamic Island y barras de navegación del sistema operativo.
- Usar `TouchableOpacity` o `Pressable` con `hitSlop` adecuado o dimensiones mínimas de 44x44 puntos.

---

## 5. Estándares de Estilo y CSS (Tailwind CSS v4)

1. **Utilidades Semánticas:** Usar tokens establecidos en `DESIGN_SYSTEM.md` (`blue-600`, `emerald-600`, `amber-500`, `slate-900`).
2. **Diseño Mobile-First:** Declarar primero los estilos móviles y escalar con prefijos responsivos:
   ```tsx
   // ✅ RECOMENDADO
   <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
   ```
3. **Evitar Valores Arbitrarios Injustificados:**
   - ❌ Evitar: `p-[17px]`, `text-[13.5px]`, `w-[312px]`
   - ✅ Usar la escala Tailwind: `p-4`, `text-sm`, `w-full max-w-sm`
4. **Agrupación Lógica de Clases:** Ordenar mentalmente las clases de utilidad:
   1. *Layout / Display:* `flex`, `grid`, `block`, `hidden`
   2. *Posicionamiento:* `relative`, `absolute`, `top-0`
   3. *Dimensiones:* `w-full`, `h-11`, `max-w-md`
   4. *Espaciado:* `p-4`, `mx-auto`, `gap-2`
   5. *Tipografía:* `text-base`, `font-semibold`, `text-slate-900`
   6. *Apariencia:* `bg-white`, `border`, `rounded-xl`, `shadow-sm`
   7. *Interactividad:* `hover:bg-blue-700`, `transition`, `focus:ring-2`

---

## 6. Convenciones de Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| **Componentes React** | `PascalCase.tsx` | `Navbar.tsx`, `TradeIcon.tsx`, `ContactRequestForm.tsx` |
| **Archivos de Página / Layout** | `lowercase.tsx` (App Router) | `page.tsx`, `layout.tsx`, `_layout.tsx` |
| **Archivos de Utilidad / Servicios** | `kebab-case.ts` o `camelCase.ts` | `auth.ts`, `prisma.ts`, `api.ts`, `seed-data.ts` |
| **Funciones y Métodos** | `camelCase` | `formatWhatsAppUrl()`, `createContactRequestAction()` |
| **Interfaces y Tipos** | `PascalCase` | `UserSummary`, `ContactRequestPayload` |
| **Constantes Globales** | `SCREAMING_SNAKE_CASE` | `ROSARIO_DISTRICTS`, `TRADES`, `COOKIE_NAME` |
| **Variables de Base de Datos / Prisma** | `camelCase` (campos) / `PascalCase` (modelos) | `userId`, `professionalProfile`, `ContactRequest` |

---

## 7. Manejo Defensivo de Errores y Mensajes

1. **Nunca Silenciar Errores Críticos:** Si se captura una excepción con `try/catch`, registrarla con contexto explicativo mediante `console.error` o servicio de observabilidad.
2. **Mensajes al Usuario en Español Auténtico (Voseo de Rosario):**
   - ❌ *"Por favor inicie sesión para continuar."*
   - ✅ *"Tenés que iniciar sesión o registrarte para enviar una solicitud."*
   - ❌ *"Error 500: Database constraint violation."*
   - ✅ *"No pudimos guardar los cambios. Por favor intentá de nuevo en unos minutos."*
3. **Manejo Seguro de Parseo JSON:** Al parsear campos almacenados como texto JSON (`trades`, `zones`, `photos`), utilizar siempre bloques de seguridad con fallback a arreglo vacío:
   ```typescript
   let photos: string[] = [];
   if (rawPhotos) {
     try {
       const parsed = JSON.parse(rawPhotos);
       if (Array.isArray(parsed)) photos = parsed;
     } catch {
       photos = [];
     }
   }
   ```

---

## 8. Flujo de Trabajo en Git y Commits Convencionales

### 8.1. Estructura de Mensajes de Commit (Conventional Commits)
Los commits deben seguir el formato estándar:  
`<tipo>(<ámbito opcional>): <descripción breve en imperativo>`

- `feat(web)`: Incorpora uploader de fotos con previsualización en solicitud.
- `feat(mobile)`: Conecta pantalla de detalle con servicio REST de profesionales.
- `fix(auth)`: Resuelve verificación de sesión en peticiones con Bearer token.
- `refactor(shared)`: Centraliza interfaces de DTOs en `@oficios/shared`.
- `style(ui)`: Ajusta padding táctil a mínimo de 44px en botones móviles.
- `docs`: Desarrolla suite de documentación técnica y estándares.
- `chore(deps)`: Actualiza versión de dependencias de Turborepo.

### 8.2. Nomenclatura de Ramas
- `feat/nombre-de-la-funcionalidad` (ej. `feat/filtro-distritos-mobile`)
- `fix/descripcion-del-bug` (ej. `fix/formato-telefono-whatsapp`)
- `refactor/area-modificada` (ej. `refactor/auth-cookie-bearer`)
- `docs/archivo-o-guia` (ej. `docs/design-system-update`)

### 8.3. Checklist Pre-Pull Request
Antes de solicitar revisión o hacer merge:
- [ ] Ejecutar `npm run lint` y verificar cero errores.
- [ ] Ejecutar `npm run build` para asegurar compilación limpia en todos los workspaces de Turborepo.
- [ ] Verificar que no existan secretos ni variables de entorno en el commit.
- [ ] Probar la vista en dimensiones móviles (ancho de pantalla de 375px a 414px).
