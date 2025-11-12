# Solución de Problemas de Sesión en Producción

## Problema Identificado

Cuando se desplegaba en Vercel, la aplicación presentaba los siguientes problemas:

1. **Sesión atrapada**: Al cerrar y volver a abrir, la sesión permanecía abierta sin poder cerrarla
2. **Carga infinita**: El panel de admin mostraba "Verificando acceso..." indefinidamente
3. **Funcionalidades bloqueadas**: No se podían subir productos ni categorías (quedaban cargando)
4. **Respuestas HTML en lugar de JSON**: Las peticiones de verificación de admin devolvían HTML del index

## Causas Raíz

### 1. Carga Prematura desde LocalStorage
La aplicación cargaba el usuario desde `localStorage` inmediatamente sin validar primero si la sesión de Supabase seguía siendo válida.

### 2. Sin Timeout en Verificaciones
Las verificaciones de admin y queries a Supabase no tenían timeout, causando bloqueos indefinidos cuando:
- El token había expirado
- Problemas de red
- Supabase no respondía rápidamente

### 3. Manejo de Errores Insuficiente
No había manejo robusto de errores en:
- Verificación de credenciales de admin
- Inicialización de autenticación
- Queries a la base de datos

### 4. Sin Opción de Escape
El usuario quedaba atrapado en la pantalla de carga sin forma de forzar el cierre de sesión.

## Soluciones Implementadas

### 1. Eliminación de Carga Prematura desde LocalStorage

**Antes:**
```typescript
const storedUser = loadStoredUser();
const [user, setUser] = useState<AuthUser | null>(storedUser);
```

**Después:**
```typescript
const [user, setUser] = useState<AuthUser | null>(null);
```

**Beneficio**: La aplicación ahora siempre valida la sesión con Supabase antes de confiar en el usuario almacenado.

### 2. Timeouts en Todas las Operaciones Críticas

#### Inicialización de Auth (10 segundos)
```typescript
const timeoutPromise = new Promise<never>((_, reject) => {
  setTimeout(() => reject(new Error('Auth timeout')), 10000);
});

const authPromise = supabase.auth.getSession();

const { data, error } = await Promise.race([
  authPromise,
  timeoutPromise,
]);
```

#### Verificación de Admin (5 segundos)
```typescript
const timeoutPromise = new Promise<boolean>((_, reject) => {
  setTimeout(() => reject(new Error('Admin check timeout')), 5000);
});

const adminCheckPromise = adminCredentialService.hasAdminAccess(email);

isAdmin = await Promise.race([adminCheckPromise, timeoutPromise]);
```

#### Queries a Base de Datos (5 segundos)
```typescript
const timeoutPromise = new Promise<never>((_, reject) => {
  setTimeout(() => reject(new Error('Database query timeout')), 5000);
});

const queryPromise = supabase
  .from("admin_credentials")
  .select(selectColumns)
  .eq("email", email)
  .maybeSingle();

const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
```

#### Logout (3 segundos)
```typescript
const timeoutPromise = new Promise<never>((_, reject) => {
  setTimeout(() => reject(new Error('Logout timeout')), 3000);
});

const logoutPromise = supabase.auth.signOut();

await Promise.race([logoutPromise, timeoutPromise]);
```

### 3. Manejo Robusto de Errores

Ahora todas las operaciones tienen try-catch y logging adecuado:

```typescript
try {
  isAdmin = await Promise.race([adminCheckPromise, timeoutPromise]);
} catch (error) {
  console.error('Error checking admin access:', error);
  isAdmin = false;
}
```

**Beneficio**: Si una verificación falla, la app continúa funcionando en lugar de quedarse colgada.

### 4. Botón de Emergencia para Forzar Logout

Agregado en `ProtectedRoute` que aparece después de 8 segundos:

```typescript
const [showEmergencyButton, setShowEmergencyButton] = useState(false);

useEffect(() => {
  if (isLoading) {
    const timer = setTimeout(() => {
      setShowEmergencyButton(true);
    }, 8000);
    
    return () => clearTimeout(timer);
  }
}, [isLoading]);

const handleEmergencyLogout = async () => {
  await logout();
  localStorage.clear();
  window.location.href = '/';
};
```

**Beneficio**: El usuario nunca queda completamente atrapado. Si la verificación tarda demasiado, puede forzar el cierre de sesión.

### 5. Mejor Configuración de Supabase

Agregadas opciones de configuración adicionales:

```typescript
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-key",
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-client-info': 'elsa-3d-app',
      },
    },
    db: {
      schema: 'public',
    },
  }
);
```

## Archivos Modificados

1. **src/hooks/useAuth.tsx**
   - Eliminada carga prematura desde localStorage
   - Agregados timeouts en inicialización, verificación de admin y logout
   - Mejor manejo de errores

2. **src/components/templates/ProtectedRoute/ProtectedRoute.tsx**
   - Agregado botón de emergencia para forzar logout
   - Timer de 8 segundos antes de mostrar el botón

3. **src/services/admin-credentials.service.ts**
   - Timeout de 5 segundos en queries a la base de datos
   - Mejor logging de errores

4. **src/services/supabase.ts**
   - Configuración mejorada del cliente de Supabase

## Cómo Desplegar en Vercel

1. **Hacer commit de los cambios:**
   ```bash
   git add .
   git commit -m "fix: solución problemas de sesión en producción"
   git push origin master
   ```

2. **Vercel desplegará automáticamente** al detectar el push a master

3. **Verificar variables de entorno en Vercel:**
   - `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase

## Pruebas Recomendadas

Después del despliegue, verificar:

1. ✅ Login funciona correctamente
2. ✅ Cerrar sesión funciona sin quedarse colgado
3. ✅ Al recargar la página, verifica la sesión correctamente
4. ✅ Si hay problemas de conexión, el botón de emergencia aparece
5. ✅ Subir productos funciona sin quedarse cargando
6. ✅ Gestión de categorías funciona correctamente
7. ✅ Panel de admin carga sin quedarse en "Verificando acceso..."

## Prevención de Problemas Futuros

### Monitoreo
Revisar los logs del navegador (Console) para detectar:
- "Auth timeout"
- "Admin check timeout"
- "Database query timeout"
- "Logout timeout"

### Optimización de Supabase
Si los timeouts siguen ocurriendo:

1. **Verificar índices en la base de datos:**
   ```sql
   -- Asegurar que hay un índice en la columna email
   CREATE INDEX IF NOT EXISTS idx_admin_credentials_email 
   ON admin_credentials(email);
   ```

2. **Revisar la configuración de RLS (Row Level Security):**
   - Las políticas muy complejas pueden hacer queries lentas
   - Simplificar cuando sea posible

3. **Aumentar los timeouts si es necesario:**
   - Actualmente: 10s (auth), 5s (admin), 5s (queries), 3s (logout)
   - Se pueden ajustar en caso de conexiones lentas consistentes

## Flujo de Autenticación Mejorado

```
Usuario carga la app
    ↓
Estado inicial: user = null, isLoading = true
    ↓
Intenta getSession() con timeout de 10s
    ↓
¿Hay sesión válida?
    ├── SÍ → Verifica admin con timeout de 5s
    │         ↓
    │         ¿Es admin?
    │         ├── SÍ → user = { email, isAdmin: true }
    │         └── NO → user = { email, isAdmin: false }
    │
    └── NO → user = null
    ↓
isLoading = false
    ↓
¿isLoading = true por más de 8s?
    ├── SÍ → Mostrar botón "Forzar cierre de sesión"
    └── NO → Continuar normalmente
```

## Notas Adicionales

- **LocalStorage se sigue usando**: Pero solo para persistir la sesión DESPUÉS de validarla con Supabase
- **Compatibilidad**: Los cambios son retrocompatibles y no requieren cambios en la base de datos
- **Performance**: Los timeouts no afectan la velocidad normal, solo previenen bloqueos
- **UX**: El usuario tiene feedback constante y una opción de escape siempre disponible

