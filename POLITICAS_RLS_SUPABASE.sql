-- Políticas RLS (Row Level Security) para la tabla models
-- Ejecuta estos comandos en el SQL Editor de Supabase

-- 1. Habilitar RLS en la tabla models
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- 2. Política para que los usuarios autenticados puedan ver sus propios modelos
CREATE POLICY "Usuarios pueden ver sus propios modelos"
ON models
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Política para que los usuarios autenticados puedan crear modelos
CREATE POLICY "Usuarios pueden crear modelos"
ON models
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Política para que los usuarios autenticados puedan actualizar sus propios modelos
CREATE POLICY "Usuarios pueden actualizar sus propios modelos"
ON models
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Política para que los usuarios autenticados puedan eliminar sus propios modelos
CREATE POLICY "Usuarios pueden eliminar sus propios modelos"
ON models
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. Política para que todos puedan ver modelos públicos (opcional)
CREATE POLICY "Todos pueden ver modelos públicos"
ON models
FOR SELECT
TO public
USING (is_public = true);

