# Guía de Despliegue en Vercel

## Problemas Comunes y Soluciones

### 1. El commit no llega a Vercel

#### Verificar en el Dashboard de Vercel:

1. **Conexión con Git:**
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Git
   - Verifica que el repositorio esté conectado correctamente
   - Verifica que la rama `master` (o `main`) esté seleccionada

2. **Webhooks de Git:**
   - Settings → Git → Webhooks
   - Verifica que los webhooks estén activos
   - Si no hay webhooks, reconecta el repositorio

3. **Variables de Entorno:**
   - Settings → Environment Variables
   - Asegúrate de tener configuradas:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Verifica que estén en "Production", "Preview" y "Development"

4. **Build Settings:**
   - Settings → General → Build & Development Settings
   - Framework Preset: Vite
   - Build Command: `npm run build` (ya configurado en vercel.json)
   - Output Directory: `dist` (ya configurado en vercel.json)
   - Install Command: `npm install`

### 2. El build falla en Vercel

#### Verificar logs de build:

1. Ve a Deployments en el dashboard
2. Haz clic en el deployment fallido
3. Revisa los logs para identificar el error

#### Errores comunes:

- **Variables de entorno faltantes:** Asegúrate de configurarlas en Vercel
- **Dependencias no instaladas:** Verifica que `package.json` esté correcto
- **Errores de TypeScript:** El build incluye `tsc`, verifica que no haya errores

### 3. Forzar un nuevo despliegue

Si los commits no se detectan automáticamente:

1. **Opción 1: Desde el Dashboard**
   - Ve a Deployments
   - Haz clic en "Redeploy" en el último deployment

2. **Opción 2: Desde Git**
   ```bash
   git commit --allow-empty -m "trigger: forzar despliegue en Vercel"
   git push origin master
   ```

3. **Opción 3: Desconectar y reconectar**
   - Settings → Git → Disconnect
   - Vuelve a conectar el repositorio

### 4. Verificar que el proyecto esté conectado

```bash
# Verificar remotes
git remote -v

# Verificar que estás en la rama correcta
git branch

# Verificar últimos commits
git log --oneline -5
```

## Checklist de Verificación

- [ ] Repositorio conectado en Vercel Dashboard
- [ ] Webhooks activos
- [ ] Variables de entorno configuradas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] Build settings correctos (Framework: Vite)
- [ ] Último commit pusheado a la rama correcta
- [ ] Build funciona localmente (`npm run build`)

## Comandos Útiles

```bash
# Build local para verificar
npm run build

# Verificar TypeScript
npx tsc --noEmit

# Verificar que el build funciona
npm run preview
```

## Contacto con Soporte de Vercel

Si el problema persiste:
1. Revisa los logs de build en el dashboard
2. Verifica el estado de Vercel: https://www.vercel-status.com/
3. Contacta soporte desde el dashboard: Settings → Support

