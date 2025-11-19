# Auditoría Técnica y Guía de Mejoras - ElSapito3d-v2

Este documento recopila un análisis exhaustivo del código actual, identificando patrones a evitar (anti-patrones) y las soluciones recomendadas para tu próximo proyecto. El objetivo es la **escalabilidad, mantenibilidad y performance**.

---

## 1. Arquitectura y Estructura de Archivos

### ❌ A evitar: Atomic Design Estricto con "Barrel Files" excesivos
Actualmente usas una estructura donde cada componente tiene su propia carpeta y un archivo `index.ts`:
```text
components/
  atoms/
    Badge/
      Badge.tsx
      index.ts
```
**Por qué es problemático:**
- **Explosión de archivos:** Triplica la cantidad de archivos innecesariamente.
- **Navegación lenta:** Buscar "Badge" te lleva a 3 resultados (carpeta, tsx, index).
- **Barrel Files (`index.ts`):** Aunque limpian los imports, pueden causar "Circular Dependency Errors" y ralentizan el compilador (Vite/Webpack) al tener que resolver re-exportaciones constantes.

### ✅ Mejora para el próximo proyecto: Estructura Modular o Plana
Adopta una estructura más pragmática. Agrupa por dominio (Feature-based) o usa una carpeta UI plana.

**Opción A (Recomendada - Shadcn/ui style):**
```text
src/
  components/
    ui/           # Componentes base reutilizables (Botones, Badges)
      badge.tsx   # Archivo único, exportación directa
      button.tsx
    features/     # Componentes específicos de negocio
      products/
        product-grid.tsx
        product-card.tsx
      cart/
        cart-drawer.tsx
```

**Ventaja:** Menos ruido, navegación más rápida y mejor code-splitting.

---

## 2. Integración con Supabase

### ❌ A evitar: Mapeo Manual de Tipos y Snake_Case
En `src/services/products.service.ts`, realizas un mapeo manual tedioso:
```typescript
// ESTO ES PROPENSO A ERRORES Y MANTENIMIENTO COSTOSO
const mapRowToProduct = (row: ProductRow): Product => ({
  id: row.id,
  price: Number(row.price), // Conversión manual
  // ...20 líneas más de mapeo
});
```
**Por qué es problemático:**
- Si cambias la DB, rompes el frontend y TypeScript no te avisará hasta que falle el runtime o los tests.
- Gastas tiempo escribiendo adaptadores (Snake Case de DB -> Camel Case de JS).

### ✅ Mejora: Supabase Type Generator + Utility Types
Usa la CLI de Supabase para generar tipos automáticamente y úsalos directamente.

1. **Generar tipos:** `supabase gen types typescript --project-id "..." > src/types/database.types.ts`
2. **Usar tipos directos:**

```typescript
import { Database } from '@/types/database.types';

// El tipo es inferido automáticamente de la DB
type Product = Database['public']['Tables']['products']['Row'];

// En tu servicio:
const { data } = await supabase.from('products').select('*');
// 'data' ya está tipado correctamente. No hace falta mapear si configuras tu linter para tolerar snake_case en objetos de DB.
```

---

## 3. Autenticación y Estado

### ❌ A evitar: Persistencia Manual de Sesión en LocalStorage
En `src/hooks/useAuth.tsx`, estás gestionando manualmente el almacenamiento:
```typescript
const persistUser = (nextUser: AuthUser | null) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser)); // ❌ Redundante
};
```
**Por qué es problemático:**
- Supabase (`supabase-js`) **ya maneja esto automáticamente**.
- Crear tu propia persistencia introduce riesgo de "estado desincronizado" (el token expira en Supabase pero tu localStorage dice que el usuario sigue logueado).
- Hackear `console.error` en `src/services/supabase.ts` para ocultar errores de token es una mala práctica ("Swallowing errors").

### ✅ Mejora: Confiar en el Cliente de Supabase
Usa `onAuthStateChange` como única fuente de verdad. Si necesitas cachear datos del usuario (rol, nombre), usa **React Query** o un store ligero como **Zustand**, pero deja que Supabase maneje la sesión.

---

## 4. Rendimiento y Data Fetching

### ❌ A evitar: Fetching Total (`SELECT *`) sin Paginación
En `src/services/products.service.ts`:
```typescript
getAll: async () => {
  // ❌ Trae TODA la tabla. Si tienes 1000 productos, la app morirá.
  const { data } = await supabase.from("products").select("*"); 
}
```

### ✅ Mejora: Paginación Infinita o por Página
Implementa paginación desde el día 1 en la API.
```typescript
// Ejemplo con React Query
const getProducts = async (page = 0) => {
  const from = page * 20;
  const to = from + 19;
  return supabase.from('products').select('*').range(from, to);
}
```

### ❌ A evitar: Lógica de Negocio en el Cliente
Validaciones críticas como `if (row.stock < 0)` en `products.service.ts` son inseguras. Un usuario malintencionado puede saltarse el frontend y llamar a la API directamente.

### ✅ Mejora: Database Functions o Edge Functions
Mueve la lógica crítica (crear pagos, descontar stock) a `supabase/functions` (ya tienes algunas, ¡bien!) o PostgreSQL Functions (PL/pgSQL) disparadas por Triggers. El cliente solo debe pedir "Comprar" y la DB decide si es posible.

---

## 5. Estilos y CSS (Tailwind)

### ❌ A evitar: Clases CSS Personalizadas y `!important`
En `src/styles/global.css`:
```css
/* ❌ Anti-patrón en Tailwind */
.text-success {
  color: #22c55e !important;
}
```
**Por qué es problemático:**
- `!important` rompe la especificidad y hace difícil sobreescribir estilos después.
- Crear clases `.text-success` duplica la utilidad de Tailwind `text-green-500`.

### ✅ Mejora: Configuración de Tema y Variables CSS
Define tus colores semánticos en el archivo de configuración o variables CSS, y usa las clases de utilidad.

```css
/* global.css */
@theme {
  --color-success: #22c55e;
}
```
En el HTML:
`<span class="text-success">` (Usando la clase generada por Tailwind, no una custom).

---

## 6. Resumen de Checklist para el Próximo Proyecto

1.  **Inicialización:**
    *   [ ] Usar `Vite` + `React` + `TypeScript`.
    *   [ ] Instalar **TanStack Query (React Query)** para manejo de estado asíncrono (reemplaza `useEffect` + `useState` para data fetching).

2.  **Estructura:**
    *   [ ] **Features Folder:** `/src/features/auth`, `/src/features/products`.
    *   [ ] **UI Folder:** `/src/components/ui` (sin subcarpetas por componente).

3.  **Base de Datos:**
    *   [ ] Usar **Supabase Type Gen** (automático).
    *   [ ] **RLS (Row Level Security):** Obligatorio para todas las tablas.
    *   [ ] No lógica de negocio crítica en JS del cliente.

4.  **Componentes:**
    *   [ ] Evitar props drilling > 2 niveles. Usar composición o Zustand.
    *   [ ] Usar librerías de componentes "Headless" o "Copy-paste" (Radix UI, Shadcn) en lugar de construir modales/dropdowns desde cero (ahorra tiempo y bugs de accesibilidad).

Esta guía garantiza que tu próximo proyecto sea profesional, seguro y fácil de mantener.

