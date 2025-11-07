# Proyecto Impresión 3D - Elsa

## Arquitectura del Proyecto

### Stack Tecnológico

- React 19.2.0
- TypeScript 5.9.3
- Vite 7.1.7
- Tailwind CSS 4.1.16
- React Router (para navegación multi-página)
- Supabase (Base de datos y autenticación)

### Patrón de Diseño: Atomic Design

El proyecto sigue la metodología Atomic Design para la organización de componentes, facilitando la escalabilidad y reutilización del código.

## Estructura del Proyecto

```
src/
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── constants/
├── hooks/
├── layouts/
├── pages/
├── services/
├── styles/
│   └── global.css
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

### Descripción de Directorios

**assets/**
Recursos estáticos del proyecto (imágenes, iconos, fuentes)

**components/atoms/**
Componentes básicos indivisibles (Button, Input, Icon, Text, Image)

**components/molecules/**
Combinación de átomos que forman componentes funcionales (SearchBar, Card, FormField)

**components/organisms/**
Combinación de moléculas que forman secciones complejas (Header, Footer, Sidebar, ProductGrid)

**components/templates/**
Estructuras de página que definen el layout sin contenido específico

**constants/**
Constantes y configuraciones globales del proyecto

**hooks/**
Custom hooks de React para lógica reutilizable

**layouts/**
Layouts compartidos entre páginas (MainLayout, AdminLayout)

**pages/**
Componentes de páginas completas que se renderizan en rutas específicas

**services/**
Servicios para comunicación con APIs y lógica de negocio

**styles/**
Estilos globales y configuración de Tailwind CSS

**types/**
Definiciones de tipos TypeScript compartidos

**utils/**
Funciones auxiliares y helpers

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

Luego edita `.env` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

Obtén tus credenciales en: https://app.supabase.com

### Instalación

```bash
npm install       # Instalar dependencias
```

## Comandos

```bash
npm run dev       # Iniciar servidor de desarrollo
npm run build     # Compilar para producción
npm run preview   # Previsualizar build de producción
```

## Convenciones de Nomenclatura

- **Componentes**: PascalCase (Button.tsx, ProductCard.tsx)
- **Archivos**: kebab-case (user-service.ts, format-date.ts)
- **Carpetas**: kebab-case o camelCase según contexto
- **Hooks**: camelCase con prefijo 'use' (useAuth.ts, useFetch.ts)
- **Tipos**: PascalCase (User.ts, Product.ts)
- **Constantes**: UPPER_SNAKE_CASE

## Flujo de Desarrollo

1. Crear átomos básicos necesarios
2. Combinar átomos en moléculas
3. Construir organismos con moléculas
4. Diseñar templates con organismos
5. Implementar páginas usando templates
6. Conectar páginas con layouts y routing

## Importaciones

Las importaciones siguen un orden específico:

1. Dependencias externas (React, bibliotecas)
2. Componentes internos
3. Hooks personalizados
4. Utilidades y servicios
5. Tipos
6. Constantes
7. Estilos

## Gestión de Estado

Para gestión de estado se recomienda:

- Context API para estado global ligero
- Custom hooks para lógica compartida
- Props para comunicación entre componentes

## Tipado TypeScript

Todo el código debe estar fuertemente tipado:

- Props de componentes con interfaces
- Respuestas de API con tipos definidos
- Funciones con parámetros y retornos tipados
- Evitar uso de `any`
