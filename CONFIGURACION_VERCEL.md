# Configuración de Variables de Entorno en Vercel

## Problema

Si la aplicación funciona en desarrollo local (`npm run dev`) pero no en Vercel, es muy probable que las variables de entorno no estén configuradas correctamente en Vercel.

## Solución: Configurar Variables de Entorno en Vercel

### Paso 1: Obtener las Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Settings** → **API**
3. Copia los siguientes valores:
   - **Project URL** → Esta es tu `VITE_SUPABASE_URL`
   - **anon public** key → Esta es tu `VITE_SUPABASE_ANON_KEY`

### Paso 2: Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables:

#### Variables Requeridas:

| Nombre                   | Valor                          | Entornos                         |
| ------------------------ | ------------------------------ | -------------------------------- |
| `VITE_SUPABASE_URL`      | Tu Project URL de Supabase     | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Tu anon public key de Supabase | Production, Preview, Development |

**Importante:**

- ✅ Marca todas las opciones: **Production**, **Preview**, y **Development**
- ✅ Asegúrate de que los nombres sean exactamente como se muestran (con `VITE_` al inicio)
- ✅ No agregues comillas alrededor de los valores

### Paso 3: Redesplegar

Después de agregar las variables de entorno:

1. Ve a la pestaña **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **Redeploy**
4. O simplemente haz un nuevo commit y push (Vercel redesplegará automáticamente)

### Paso 4: Verificar

1. Abre tu aplicación desplegada en Vercel
2. Abre la consola del navegador (F12)
3. Verifica que no haya errores relacionados con variables de entorno
4. Intenta acceder al panel de admin (`/admin`)
5. Verifica que los datos se carguen correctamente

## Verificación de Variables de Entorno

Si quieres verificar que las variables están configuradas correctamente, puedes agregar temporalmente este código en tu aplicación (luego elimínalo):

```typescript
// Solo para debugging - eliminar después
console.log(
  "VITE_SUPABASE_URL:",
  import.meta.env.VITE_SUPABASE_URL ? "✅ Configurada" : "❌ No configurada"
);
console.log(
  "VITE_SUPABASE_ANON_KEY:",
  import.meta.env.VITE_SUPABASE_ANON_KEY
    ? "✅ Configurada"
    : "❌ No configurada"
);
```

## Problemas Comunes

### ❌ Error: "Las siguientes variables de entorno son requeridas"

**Causa:** Las variables no están configuradas en Vercel o tienen nombres incorrectos.

**Solución:**

1. Verifica que los nombres sean exactamente `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
2. Verifica que estén marcadas para todos los entornos
3. Redesplega la aplicación

### ❌ Error: "No pudimos obtener los usuarios. Verifica las políticas RLS en Supabase"

**Causa:** Las políticas RLS están bloqueando las consultas.

**Solución:** Sigue las instrucciones en `CONFIGURACION_SUPABASE_RLS.md`

### ❌ La aplicación carga pero los datos no aparecen

**Causa:** Puede ser un problema de autenticación o políticas RLS.

**Solución:**

1. Verifica que estés autenticado correctamente
2. Abre la consola del navegador y revisa los errores
3. Verifica las políticas RLS en Supabase

## Notas Importantes

⚠️ **Nunca commitees el archivo `.env`** a tu repositorio. Las variables de entorno deben configurarse directamente en Vercel.

⚠️ **Las variables que empiezan con `VITE_`** son expuestas al cliente. No uses claves secretas aquí.

✅ **Después de agregar variables de entorno**, siempre necesitas redesplegar la aplicación para que los cambios surtan efecto.
