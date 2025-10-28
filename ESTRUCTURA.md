# Estructura del Proyecto

```
Page_Elsa_v2/
│
├── public/
│   └── vite.svg
│
├── src/
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── components/
│   │   ├── atoms/
│   │   │   └── index.ts
│   │   ├── molecules/
│   │   │   └── index.ts
│   │   ├── organisms/
│   │   │   └── index.ts
│   │   └── templates/
│   │       └── index.ts
│   │
│   ├── constants/
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   └── index.ts
│   │
│   ├── layouts/
│   │   └── index.ts
│   │
│   ├── pages/
│   │   └── index.ts
│   │
│   ├── services/
│   │   └── index.ts
│   │
│   ├── styles/
│   │   └── global.css
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── utils/
│   │   └── index.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .cursorrules
├── .gitignore
├── ESTRUCTURA.md
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## Atomic Design - Jerarquía de Componentes

```
ATOMS (Componentes Básicos)
└── Button, Input, Icon, Text, Image, Label, Badge, Spinner
    │
    └── MOLECULES (Combinación de Átomos)
        └── SearchBar, Card, FormField, MenuItem, Breadcrumb
            │
            └── ORGANISMS (Secciones Complejas)
                └── Header, Footer, Sidebar, ProductGrid, ContactForm
                    │
                    └── TEMPLATES (Estructuras de Página)
                        └── HomeTemplate, ProductTemplate, DashboardTemplate
                            │
                            └── PAGES (Páginas Completas)
                                └── HomePage, ProductPage, ContactPage
```

## Flujo de Datos

```
User Interaction
    ↓
Page Component
    ↓
Template Component
    ↓
Organism Components
    ↓
Molecule Components
    ↓
Atom Components
    ↓
Services/API (si es necesario)
    ↓
State Update
    ↓
Re-render
```

## Ejemplo de Arquitectura para una Funcionalidad

```
Feature: Catálogo de Productos 3D

atoms/
├── Button.tsx
├── Image.tsx
├── Text.tsx
└── Badge.tsx

molecules/
├── ProductCard.tsx (usa Image, Text, Badge, Button)
└── PriceTag.tsx (usa Text, Badge)

organisms/
├── ProductGrid.tsx (usa ProductCard[])
├── FilterBar.tsx (usa Button[], Input)
└── ProductHeader.tsx (usa Text, Button)

templates/
└── CatalogTemplate.tsx (usa ProductHeader, FilterBar, ProductGrid)

pages/
└── CatalogPage.tsx (usa CatalogTemplate con datos reales)

services/
└── product-service.ts (API calls)

types/
└── Product.ts (interface Product)

hooks/
└── useProducts.ts (lógica de productos)
```

## Convenciones de Carpetas

### Components

Cada componente en su propia carpeta cuando tenga estilos/tests asociados:

```
atoms/
└── Button/
    ├── Button.tsx
    ├── Button.test.tsx
    └── index.ts (export { Button } from './Button')
```

### Pages

Páginas organizadas por funcionalidad:

```
pages/
├── Home/
│   ├── HomePage.tsx
│   └── index.ts
├── Products/
│   ├── CatalogPage.tsx
│   ├── DetailPage.tsx
│   └── index.ts
└── Contact/
    ├── ContactPage.tsx
    └── index.ts
```

### Services

Servicios agrupados por dominio:

```
services/
├── api/
│   ├── client.ts
│   └── endpoints.ts
├── product-service.ts
├── user-service.ts
└── index.ts
```

## Importación de Módulos

```typescript
import { Button, Input, Text } from "@/components/atoms";
import { ProductCard } from "@/components/molecules";
import { ProductGrid } from "@/components/organisms";
import { CatalogTemplate } from "@/components/templates";
import { useProducts } from "@/hooks";
import { getProducts } from "@/services";
import { Product } from "@/types";
import { API_URL } from "@/constants";
import { formatPrice } from "@/utils";
```

## Tipos de Archivos por Directorio

```
atoms/          → .tsx (componentes React)
molecules/      → .tsx (componentes React)
organisms/      → .tsx (componentes React)
templates/      → .tsx (componentes React)
pages/          → .tsx (páginas React)
layouts/        → .tsx (layouts React)
hooks/          → .ts (custom hooks)
services/       → .ts (lógica de API)
utils/          → .ts (funciones helper)
types/          → .ts (interfaces/types)
constants/      → .ts (constantes)
styles/         → .css (estilos globales)
```
