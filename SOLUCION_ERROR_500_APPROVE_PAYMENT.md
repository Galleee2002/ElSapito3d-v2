# Solución: Error 500 al Aprobar Pagos

## Problema

Al intentar aprobar un pago desde el panel de administración, aparece el error:

```
Error 500 Internal Server Error
Error updating payment status: Error: Failed to approve payment
```

## Causa

El Edge Function `approve-payment` necesita la variable de entorno `SUPABASE_SERVICE_ROLE_KEY` para poder actualizar los pagos en la base de datos bypasseando las políticas de Row Level Security (RLS).

Si esta variable no está configurada, el Edge Function no tiene permisos suficientes para actualizar el estado del pago.

## Solución

### Paso 1: Obtener tu Service Role Key

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto (`vujkuakdtfgtvoveoqvj`)
3. Navega a **Settings** → **API**
4. En la sección **Project API keys**, busca `service_role` (secret)
5. Haz clic en "Reveal" y copia la key completa (será algo como `eyJhbGc...`)

⚠️ **IMPORTANTE**: Esta key es extremadamente sensible. **NUNCA** la expongas en el frontend ni la compartas públicamente.

### Paso 2: Configurar el Secreto en Edge Functions

1. En Supabase Dashboard, ve a **Settings** → **Edge Functions** → **Secrets**
2. Busca si ya existe `SUPABASE_SERVICE_ROLE_KEY`:
   - Si existe, verifica que el valor sea correcto
   - Si no existe, haz clic en **"Add new secret"**
3. Configura:
   - **Nombre**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Valor**: Pega tu service role key copiada
4. Haz clic en **"Save"** o **"Create"**

### Paso 3: Re-desplegar el Edge Function

Después de configurar el secreto, **debes re-desplegar** la función para que tome los cambios:

```bash
npx supabase functions deploy approve-payment
```

### Paso 4: Verificar que funciona

1. Recarga tu aplicación web
2. Intenta aprobar un pago nuevamente
3. Si aún falla, revisa los logs del Edge Function

## Verificar los Logs del Edge Function

Si el problema persiste después de configurar `SUPABASE_SERVICE_ROLE_KEY`:

1. Ve a [Supabase Dashboard](https://app.supabase.com) → Tu proyecto
2. Navega a **Edge Functions** → **approve-payment** → **Logs**
3. Busca el último error y revisa:
   - El mensaje de error completo
   - El campo `details` que indica la causa específica
   - El campo `hint` con sugerencias de solución
   - El campo `code` con el código de error de Supabase

**Los logs ahora incluyen información detallada de cada paso:**

- ✅ `Supabase configuration OK` - Las variables de entorno están configuradas
- ✅ `Processing payment approval: [payment_id]` - Se está procesando el pago
- ✅ `Creating Supabase client...` - Se está creando el cliente de Supabase
- ✅ `Supabase client created` - El cliente se creó correctamente
- ✅ `Fetching payment from database...` - Se está buscando el pago
- ✅ `Payment found: {...}` - Se encontró el pago
- ✅ `Updating payment status to aprobado...` - Se está actualizando el estado
- ✅ `Update result: {...}` - Resultado de la actualización

Si ves algún log de error (`console.error`), ese es el punto donde está fallando.

## Errores Comunes y Soluciones

### Error: "unrecognized configuration parameter 'app.settings.supabase_url'"

**Causa**: Problema de compatibilidad entre versiones de supabase-js y la configuración del cliente de Supabase.

**Solución**: Este error ya fue corregido en la última versión del Edge Function. Asegúrate de que:

1. El Edge Function usa `@supabase/supabase-js@2.39.3` o superior
2. El cliente se inicializa con las opciones correctas:
   ```typescript
   const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
     auth: {
       autoRefreshToken: false,
       persistSession: false,
       detectSessionInUrl: false,
     },
     db: {
       schema: "public",
     },
   });
   ```
3. El Edge Function fue re-desplegado después de la corrección

Si el error persiste después de re-desplegar, contacta al equipo de desarrollo.

### Error: "SUPABASE_SERVICE_ROLE_KEY is not defined"

**Causa**: La variable de entorno no está configurada.

**Solución**: Sigue los pasos 1-3 arriba.

### Error: "JWT expired" o "Invalid JWT"

**Causa**: La Service Role Key es inválida o fue regenerada.

**Solución**:

1. Regenera una nueva Service Role Key desde Supabase Dashboard
2. Actualiza el secreto en Edge Functions
3. Re-despliega el Edge Function

### Error: "permission denied for table payments"

**Causa**: Hay un problema con las políticas RLS de la tabla `payments`.

**Solución**:

1. Verifica que estás usando la Service Role Key (no la Anon Key)
2. Asegúrate de que el cliente Supabase se inicializa con la Service Role Key:
   ```typescript
   const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
   ```

### Error: "Payment not found" o "Payment is already aprobado"

**Causa**: El pago no existe o ya fue aprobado anteriormente.

**Solución**: Recarga la lista de pagos y verifica el estado actual.

## Variables de Entorno Necesarias

Para que el Edge Function `approve-payment` funcione correctamente, necesitas estas variables configuradas en **Settings** → **Edge Functions** → **Secrets**:

1. **`SUPABASE_URL`** (generalmente se configura automáticamente)
2. **`SUPABASE_SERVICE_ROLE_KEY`** ✅ **REQUERIDA**

## Cambios Implementados

### Mejoras en el Manejo de Errores

Se mejoró el Edge Function para proporcionar mensajes de error más descriptivos:

```typescript
{
  error: "Failed to approve payment",
  details: "Mensaje específico del error de Supabase",
  hint: "Sugerencia de cómo resolver el problema",
  code: "Código de error de Supabase"
}
```

### Mejoras en el Frontend

El frontend ahora muestra mensajes de error más específicos al usuario, facilitando la identificación del problema.

## Verificación Final

Después de configurar `SUPABASE_SERVICE_ROLE_KEY`, verifica que:

- ✅ El secreto está configurado en Supabase Dashboard → Edge Functions → Secrets
- ✅ El Edge Function fue re-desplegado después de configurar el secreto
- ✅ Puedes aprobar pagos sin errores
- ✅ Los pagos cambian su estado a "aprobado" en la base de datos
- ✅ Se envía el email de notificación al cliente (si está configurado)

## Soporte Adicional

Si el problema persiste después de seguir estos pasos:

1. Revisa los logs del Edge Function en Supabase Dashboard
2. Verifica que la tabla `payments` tiene la estructura correcta
3. Asegúrate de que tu usuario tiene permisos de administrador
4. Contacta al equipo de desarrollo con:
   - Capturas de pantalla del error
   - Logs del navegador (Console)
   - Logs del Edge Function

## Referencias

- [Documentación de Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Documentación de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [CONFIGURACION_MERCADO_PAGO.md](./CONFIGURACION_MERCADO_PAGO.md)
