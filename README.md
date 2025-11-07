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

## Configuración de Supabase

Esta aplicación requiere Supabase para almacenar modelos y archivos. Asegúrate de configurar:

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Buckets de Storage

La aplicación requiere dos buckets en Supabase Storage:

1. **`model-images`**: Para almacenar imágenes de productos
2. **`model-videos`**: Para almacenar videos de productos

#### Crear Buckets en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Storage** en el menú lateral
3. Crea los buckets `model-images` y `model-videos`
4. Configura las políticas de acceso:

**Para `model-images` y `model-videos`:**

```sql
-- Política para permitir lectura pública de imágenes y videos
CREATE POLICY "Model Images Videos Public Read" ON storage.objects
FOR SELECT USING (bucket_id = 'model-images' OR bucket_id = 'model-videos');

-- Política para permitir subida a usuarios autenticados
CREATE POLICY "Model Images Videos Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'model-images' OR bucket_id = 'model-videos');

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Model Images Videos Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'model-images' OR bucket_id = 'model-videos');

-- Política para permitir eliminación a usuarios autenticados
CREATE POLICY "Model Images Videos Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'model-images' OR bucket_id = 'model-videos');
```

**Nota:** Si ya tienes políticas existentes con nombres similares, puedes:

1. Eliminar las políticas existentes primero con `DROP POLICY "nombre_politica" ON storage.objects;`
2. O usar nombres completamente diferentes para las nuevas políticas

## Configuración del Servidor para Producción

Esta aplicación es una SPA (Single Page Application) que usa React Router. Para que funcione correctamente en producción, el servidor debe redirigir todas las rutas a `index.html`.

### Apache

Si usas Apache, el archivo `.htaccess` en la carpeta `public/` ya está configurado. Asegúrate de que:

- El módulo `mod_rewrite` esté habilitado
- Los archivos `.htaccess` estén permitidos en la configuración de Apache

### Nginx

Si usas Nginx, agrega esta configuración a tu archivo de configuración:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Otros Servidores

Para otros servidores, asegúrate de configurar una regla de reescritura que redirija todas las rutas a `index.html`.

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
