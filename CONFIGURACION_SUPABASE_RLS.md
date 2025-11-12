# Configuración de Políticas RLS en Supabase

## Problema

Si ves mensajes de "Cargando usuarios...", "Cargando categorías..." o "Cargando productos..." que no terminan, es probable que las políticas RLS (Row Level Security) en Supabase estén bloqueando las consultas.

## Solución

Necesitas configurar las políticas RLS en Supabase para permitir el acceso a las tablas. Aquí están las políticas recomendadas:

### 1. Tabla `admin_credentials`

Permite que los usuarios autenticados lean y escriban en esta tabla:

```sql
-- Política para SELECT (leer)
CREATE POLICY "Los usuarios autenticados pueden leer admin_credentials"
ON admin_credentials
FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT (crear)
CREATE POLICY "Los usuarios autenticados pueden insertar admin_credentials"
ON admin_credentials
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE (actualizar)
CREATE POLICY "Los usuarios autenticados pueden actualizar admin_credentials"
ON admin_credentials
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE (eliminar)
CREATE POLICY "Los usuarios autenticados pueden eliminar admin_credentials"
ON admin_credentials
FOR DELETE
TO authenticated
USING (true);
```

### 2. Tabla `categories`

```sql
-- Política para SELECT
CREATE POLICY "Los usuarios autenticados pueden leer categories"
ON categories
FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT
CREATE POLICY "Los usuarios autenticados pueden insertar categories"
ON categories
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE
CREATE POLICY "Los usuarios autenticados pueden actualizar categories"
ON categories
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE
CREATE POLICY "Los usuarios autenticados pueden eliminar categories"
ON categories
FOR DELETE
TO authenticated
USING (true);
```

### 3. Tabla `products`

```sql
-- Política para SELECT
CREATE POLICY "Los usuarios autenticados pueden leer products"
ON products
FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT
CREATE POLICY "Los usuarios autenticados pueden insertar products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE
CREATE POLICY "Los usuarios autenticados pueden actualizar products"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE
CREATE POLICY "Los usuarios autenticados pueden eliminar products"
ON products
FOR DELETE
TO authenticated
USING (true);
```

### 4. Tabla `payments` (si aplica)

```sql
-- Política para SELECT
CREATE POLICY "Los usuarios autenticados pueden leer payments"
ON payments
FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT
CREATE POLICY "Los usuarios autenticados pueden insertar payments"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE
CREATE POLICY "Los usuarios autenticados pueden actualizar payments"
ON payments
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

## Cómo aplicar estas políticas

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Ejecuta las políticas SQL anteriores para cada tabla
4. Asegúrate de que RLS esté habilitado en cada tabla:
   - Ve a **Table Editor**
   - Selecciona cada tabla
   - En la pestaña **Policies**, verifica que RLS esté habilitado

## Verificación

Después de aplicar las políticas:

1. Recarga la página del panel de admin
2. Abre la consola del navegador (F12)
3. Verifica que no haya errores de permisos
4. Los mensajes de "Cargando..." deberían desaparecer y mostrar los datos

## Nota de Seguridad

⚠️ **Importante**: Estas políticas permiten que cualquier usuario autenticado acceda a todas las tablas. Si necesitas más seguridad, puedes:

1. Crear políticas más restrictivas basadas en roles
2. Usar funciones de Supabase para verificar permisos de administrador
3. Implementar políticas basadas en el email del usuario

Para una implementación más segura, considera verificar el campo `is_admin` en `admin_credentials` antes de permitir el acceso.

