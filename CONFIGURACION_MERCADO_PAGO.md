# Configuración de Mercado Pago - Guía Completa

Esta guía te ayudará a configurar completamente Mercado Pago en tu aplicación ElSapito3D.

## ✅ Lo que ya está implementado

### Edge Functions

1. **`create-payment-preference`** - Crea preferencias de pago en Mercado Pago
2. **`webhook-mercado-pago`** - Procesa webhooks de Mercado Pago
3. **`notify-payment-approved`** - Envía emails cuando un pago se aprueba (ya existía)

### Frontend

1. **Servicio de Mercado Pago** (`src/services/mercado-pago.service.ts`)
2. **Componente CheckoutModal** (`src/components/organisms/CheckoutModal/`)
3. **Páginas de resultado** (Success, Failure, Pending)
4. **Integración en CartPage**

---

## 📋 Pasos de Configuración en Supabase

### 1. Configurar Variables de Entorno en Edge Functions

1. Ve a [Supabase Dashboard](https://app.supabase.com) → Tu proyecto
2. Navega a **Settings** → **Edge Functions** → **Secrets**
3. Agrega las siguientes variables:

```
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-tu-access-token-de-produccion
MERCADO_PAGO_PUBLIC_KEY=APP_USR-tu-public-key-de-produccion
SITE_URL=https://tu-dominio.com
RESEND_API_KEY=tu_resend_api_key
FROM_EMAIL=noreply@elsapito3d.com
```

**⚠️ IMPORTANTE:**

- Reemplaza `tu-access-token-de-produccion` con tu Access Token real de Mercado Pago
- Reemplaza `tu-public-key-de-produccion` con tu Public Key real de Mercado Pago
- Reemplaza `tu-dominio.com` con tu dominio real (ej: `elsapito3d.com`)
- El `SITE_URL` se usa para las URLs de retorno después del pago

### 2. Instalar Supabase CLI

**⚠️ IMPORTANTE:** Supabase CLI NO se puede instalar globalmente con `npm install -g`. Usa una de estas opciones:

#### Opción A: Scoop (Recomendado para Windows)

```powershell
# Instalar Scoop si no lo tienes
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Instalar Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Opción B: Chocolatey

```powershell
# Instalar Chocolatey si no lo tienes (ejecutar como administrador)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar Supabase CLI
choco install supabase
```

#### Opción C: npm como dependencia local

```bash
# En la raíz de tu proyecto
npm install --save-dev supabase

# Luego usa npx para ejecutar comandos
npx supabase login
npx supabase link --project-ref tu-project-ref
npx supabase functions deploy create-payment-preference
```

#### Opción D: Descargar binario directamente

1. Ve a [Releases de Supabase CLI](https://github.com/supabase/cli/releases)
2. Descarga `supabase_windows_amd64.zip`
3. Extrae el archivo `supabase.exe`
4. Agrega la carpeta al PATH de Windows o mueve `supabase.exe` a una carpeta que ya esté en el PATH

### 3. Desplegar las Edge Functions

Una vez instalado Supabase CLI:

```bash
# Iniciar sesión en Supabase
supabase login

# Vincular tu proyecto (si aún no lo has hecho)
supabase link --project-ref tu-project-ref

# Desplegar las funciones
supabase functions deploy create-payment-preference
supabase functions deploy webhook-mercado-pago
```

**🔍 ¿Dónde encontrar el `project-ref`?**

El `project-ref` es el identificador único de tu proyecto de Supabase. Puedes encontrarlo de estas formas:

1. **En la URL del Dashboard de Supabase:**

   - Ve a [Supabase Dashboard](https://app.supabase.com)
   - Selecciona tu proyecto
   - Mira la URL: `https://app.supabase.com/project/[tu-project-ref]`
   - El `project-ref` es la parte que aparece después de `/project/`

2. **En la URL de tu API de Supabase:**

   - Si tu URL de Supabase es: `https://abcdefghijklmnop.supabase.co`
   - El `project-ref` es: `abcdefghijklmnop` (la parte antes de `.supabase.co`)

3. **En la configuración del proyecto:**
   - Ve a **Settings** → **General** → **Reference ID**
   - Ahí verás el `project-ref` de tu proyecto

**Ejemplo:**
Si tu URL de Supabase es `https://vujkuakdtfgtvoveoqvj.supabase.co`, entonces:

```bash
supabase link --project-ref vujkuakdtfgtvoveoqvj
```

**Nota:** Si ya tienes `notify-payment-approved` desplegada, no necesitas desplegarla de nuevo.

**Si usas npm local (Opción C), reemplaza `supabase` con `npx supabase` en todos los comandos.**

### 4. Configurar Database Webhook (Para emails automáticos)

1. Ve a [Supabase Dashboard](https://app.supabase.com) → Tu proyecto
2. Navega a **Database** → **Webhooks** (o **Database** → **Replication** → **Webhooks**)
3. Haz clic en **"Create a new webhook"**
4. Configura:
   - **Nombre**: `notify-payment-approved`
   - **Table**: `payments`
   - **Events**: Selecciona solo **UPDATE**
   - **Type**: **HTTP Request**
   - **Method**: `POST`
   - **URL**:
     ```
     https://vujkuakdtfgtvoveoqvj.supabase.co/functions/v1/notify-payment-approved
     ```
     > **Nota:** `vujkuakdtfgtvoveoqvj` es tu `project-ref` (el identificador único de tu proyecto de Supabase)
   - **Headers**:
     ```
     Content-Type: application/json
     ```
5. Guarda el webhook

### 5. Configurar Webhook en Mercado Pago

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Inicia sesión y accede a tu aplicación
3. Ve a **Webhooks** o **Notificaciones IPN**
4. Configura la URL del webhook:
   ```
   https://vujkuakdtfgtvoveoqvj.supabase.co/functions/v1/webhook-mercado-pago
   ```
   > **Nota:** `vujkuakdtfgtvoveoqvj` es tu `project-ref` (el identificador único de tu proyecto de Supabase)
5. Selecciona los eventos que quieres recibir:
   - ✅ `payment`
   - ✅ `merchant_order` (opcional)
6. Guarda la configuración

---

## 🔧 Configuración de la Base de Datos

### Verificar que la tabla `payments` existe

La tabla `payments` debe tener estos campos (ya deberían existir):

```sql
-- Verificar estructura de la tabla
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'payments';
```

Campos requeridos para Mercado Pago:

**Campos básicos:**

- `id` (UUID)
- `customer_name` (TEXT)
- `customer_email` (TEXT)
- `customer_phone` (TEXT, nullable)
- `customer_address` (TEXT, nullable)
- `amount` (NUMERIC)
- `payment_method` (USER-DEFINED enum o TEXT)
- `payment_status` (USER-DEFINED enum o TEXT)
- `payment_date` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `metadata` (JSONB, nullable)

**Campos de Mercado Pago:**

- `mp_preference_id` (TEXT, nullable)
- `mp_external_reference` (TEXT, nullable)
- `mp_payment_id` (TEXT, nullable)
- `mp_collection_id` (TEXT, nullable)
- `mp_collection_status` (TEXT, nullable)
- `mp_merchant_order_id` (TEXT, nullable)
- `mp_payment_type` (TEXT, nullable)

**Campos adicionales (opcionales pero recomendados):**

- `product_id` (UUID, nullable) - Para asociar pagos con productos
- `order_id` (TEXT, nullable) - Para identificar órdenes
- `notes` (TEXT, nullable) - Para notas adicionales

✅ **Tu tabla `payments` tiene todos los campos necesarios y está correctamente configurada.**

**Nota:** Si en el futuro necesitas agregar algún campo adicional, puedes hacerlo con:

```sql
-- Ejemplo: agregar campo si no existe
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS nombre_campo TIPO_DATO;
```

---

## 🧪 Probar la Integración

### 1. Probar creación de preferencia

1. Agrega productos al carrito en tu aplicación
2. Haz clic en "Finalizar compra"
3. Completa el formulario de checkout
4. Haz clic en "Pagar con Mercado Pago"
5. Deberías ser redirigido a Mercado Pago

### 2. Probar con tarjeta de prueba

En el entorno de prueba de Mercado Pago, usa estas tarjetas:

**Tarjeta aprobada:**

- Número: `5031 7557 3453 0604`
- CVV: `123`
- Fecha: Cualquier fecha futura
- Nombre: Cualquier nombre

**Tarjeta rechazada:**

- Número: `5031 4332 1540 6351`
- CVV: `123`
- Fecha: Cualquier fecha futura

### 3. Verificar webhooks

1. Completa un pago de prueba
2. Ve a **Supabase Dashboard** → **Edge Functions** → **Logs**
3. Verifica que `webhook-mercado-pago` recibió y procesó el webhook
4. Verifica que la tabla `payments` se actualizó correctamente
5. Verifica que se envió el email (si configuraste Resend)

---

## 🔍 Troubleshooting

### Error: "MERCADO_PAGO_ACCESS_TOKEN not configured"

**Solución:** Verifica que agregaste la variable en **Settings** → **Edge Functions** → **Secrets** en Supabase.

### Error: "Failed to create payment preference"

**Posibles causas:**

1. El Access Token es inválido o de prueba
2. El Access Token no tiene permisos suficientes
3. Los datos enviados son inválidos

**Solución:**

- Verifica que estás usando el Access Token de **producción**
- Revisa los logs de la Edge Function en Supabase
- Verifica que todos los campos requeridos están presentes

### Los webhooks no llegan

**Posibles causas:**

1. La URL del webhook no es accesible públicamente
2. La URL no es HTTPS
3. Mercado Pago no puede alcanzar tu endpoint

**Solución:**

- Verifica que la URL del webhook es correcta
- Asegúrate de que es HTTPS
- Revisa los logs de `webhook-mercado-pago` en Supabase
- Verifica en el dashboard de Mercado Pago si hay intentos de webhook fallidos

### Los pagos no se actualizan en la base de datos

**Solución:**

- Verifica que el `mp_external_reference` coincide entre la preferencia y el webhook
- Revisa los logs de `webhook-mercado-pago`
- Verifica que la tabla `payments` tiene todos los campos necesarios

### Los emails no se envían

**Solución:**

- Verifica que `RESEND_API_KEY` está configurado en Edge Functions Secrets
- Verifica que el Database Webhook está configurado correctamente
- Revisa los logs de `notify-payment-approved`
- Verifica que `FROM_EMAIL` está configurado y verificado en Resend

---

## 📝 Checklist Final

Antes de ir a producción, verifica:

- [ ] Access Token de producción configurado en Supabase
- [ ] Public Key de producción configurado (si la necesitas en frontend)
- [ ] Edge Functions desplegadas
- [ ] Database Webhook configurado para emails
- [ ] Webhook de Mercado Pago configurado
- [ ] `SITE_URL` configurado con tu dominio real
- [ ] `RESEND_API_KEY` configurado (para emails)
- [ ] Tabla `payments` tiene todos los campos necesarios
- [ ] Probado con tarjetas de prueba
- [ ] URLs de retorno funcionan correctamente
- [ ] Emails se envían cuando un pago se aprueba

---

## 🚀 Flujo Completo

1. **Usuario agrega productos al carrito** → `CartPage`
2. **Usuario hace clic en "Finalizar compra"** → Se abre `CheckoutModal`
3. **Usuario completa el formulario** → Se llama a `mercadoPagoService.createPaymentPreference()`
4. **Edge Function crea preferencia** → `create-payment-preference`
5. **Usuario es redirigido a Mercado Pago** → Paga con su método preferido
6. **Mercado Pago procesa el pago** → Envía webhook a `webhook-mercado-pago`
7. **Edge Function actualiza la base de datos** → Tabla `payments` se actualiza
8. **Database Webhook detecta cambio** → Llama a `notify-payment-approved`
9. **Email se envía al cliente** → Confirmación de pago aprobado
10. **Usuario es redirigido** → `/payment/success`, `/payment/failure`, o `/payment/pending`

---

## 📚 Recursos Adicionales

- [Documentación de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs)
- [Documentación de Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Documentación de Resend](https://resend.com/docs)

---

## 💡 Notas Importantes

1. **Nunca expongas el Access Token en el frontend** - Solo debe estar en Edge Functions
2. **Usa HTTPS siempre** - Mercado Pago requiere HTTPS para webhooks
3. **Valida los webhooks** - Aunque no está implementado en esta versión, considera validar la firma de los webhooks de Mercado Pago
4. **Maneja errores** - Asegúrate de tener manejo de errores robusto en producción
5. **Monitorea los logs** - Revisa regularmente los logs de las Edge Functions

---

¡Listo! Tu integración de Mercado Pago está completa. 🎉
