# Configuración de Mercado Pago con Supabase

## 1. Obtener Credenciales de Producción

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Inicia sesión y accede a **"Tus integraciones"** → **"Credenciales de producción"**
3. Copia:
   - **Access Token**: `APP_USR-XXXXX-XXXXX-XXXXX`
   - **Public Key**: `APP_USR-XXXXX-XXXXX-XXXXX`

⚠️ **IMPORTANTE**: El Access Token **NUNCA** debe estar en el frontend.

---

## 2. Configurar Credenciales en Supabase

### Opción A: Supabase Edge Functions (Recomendado)

Para crear preferencias de pago y procesar webhooks desde Edge Functions:

1. Ve a [Supabase Dashboard](https://app.supabase.com) → Tu proyecto
2. Navega a **Settings** → **Edge Functions** → **Secrets**
3. Agrega:
   ```
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-tu-access-token
   MERCADO_PAGO_PUBLIC_KEY=APP_USR-tu-public-key
   ```

En tu Edge Function, accede con:

```typescript
const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
```

### Opción B: Tabla de Configuración en Supabase

Si prefieres almacenar las credenciales en la base de datos:

```sql
-- Crear tabla de configuración (si no existe)
CREATE TABLE IF NOT EXISTS mercado_pago_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token TEXT NOT NULL,
  public_key TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar credenciales de producción
INSERT INTO mercado_pago_config (access_token, public_key, environment)
VALUES (
  'APP_USR-tu-access-token-de-produccion',
  'APP_USR-tu-public-key-de-produccion',
  'production'
)
ON CONFLICT DO NOTHING;
```

Luego, en tu servicio (`src/services/payments.service.ts`):

```typescript
// Obtener credenciales desde Supabase
const { data: config } = await supabase
  .from("mercado_pago_config")
  .select("access_token, public_key")
  .eq("environment", "production")
  .single();
```

### Opción C: Public Key en Frontend (Solo si es necesario)

Si necesitas la Public Key en el frontend para inicializar el SDK:

1. Crea/edita `.env` en la raíz del proyecto:

   ```env
   VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-tu-public-key
   ```

2. En tu código:

   ```typescript
   const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
   ```

⚠️ **NUNCA** agregues el Access Token aquí.

---

## 3. Integración con Tablas Existentes

Tu proyecto ya tiene las tablas `payments` y `payment_statistics`. Para integrar Mercado Pago:

### Crear Preferencia de Pago (Edge Function)

Cuando un usuario inicia un pago, crea una preferencia desde una Edge Function:

```typescript
// supabase/functions/create-payment-preference/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");

serve(async (req) => {
  try {
    const { customer_name, customer_email, amount, product_id } =
      await req.json();

    // Crear preferencia en Mercado Pago
    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [{ title: "Producto", quantity: 1, unit_price: amount }],
          payer: { name: customer_name, email: customer_email },
          back_urls: {
            success: "https://tu-dominio.com/payment/success",
            failure: "https://tu-dominio.com/payment/failure",
            pending: "https://tu-dominio.com/payment/pending",
          },
          auto_return: "approved",
          notification_url:
            "https://tu-proyecto.supabase.co/functions/v1/webhook-mercado-pago",
          external_reference: crypto.randomUUID(),
        }),
      }
    );

    const preference = await response.json();

    // Guardar en la tabla payments
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: payment } = await supabase
      .from("payments")
      .insert({
        customer_name,
        customer_email,
        amount,
        product_id,
        payment_method: "mercado_pago",
        payment_status: "pendiente",
        mp_preference_id: preference.id,
        mp_external_reference: preference.external_reference,
      })
      .select()
      .single();

    return new Response(JSON.stringify({ preference, payment }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

### Procesar Webhook (Edge Function)

Cuando Mercado Pago notifica un cambio de estado:

```typescript
// supabase/functions/webhook-mercado-pago/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");

serve(async (req) => {
  try {
    const { type, data } = await req.json();

    if (type === "payment") {
      // Obtener información del pago desde Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        {
          headers: {
            Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          },
        }
      );

      const payment = await paymentResponse.json();

      // Actualizar en la tabla payments
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const statusMap = {
        approved: "aprobado",
        pending: "pendiente",
        rejected: "rechazado",
        cancelled: "cancelado",
        refunded: "reembolsado",
      };

      await supabase
        .from("payments")
        .update({
          payment_status: statusMap[payment.status] || "pendiente",
          mp_payment_id: payment.id.toString(),
          mp_collection_id: payment.collection_id?.toString(),
          mp_collection_status: payment.status,
          mp_payment_type: payment.payment_type_id,
          payment_date: payment.date_approved || payment.date_created,
          updated_at: new Date().toISOString(),
        })
        .eq("mp_external_reference", payment.external_reference);

      // Las estadísticas en payment_statistics se actualizarán automáticamente
      // si tienes triggers o vistas materializadas configuradas
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

---

## 4. Configurar Database Webhooks en Supabase (Automático)

**✅ RECOMENDADO**: Activa los Database Webhooks para automatizar el envío de emails cuando un pago se aprueba.

### ¿Por qué usar Database Webhooks?

- **Automático**: El email se envía automáticamente cuando `payment_status` cambia a "aprobado"
- **Independiente**: Funciona independientemente de dónde venga la actualización (Mercado Pago, admin, etc.)
- **Separación de responsabilidades**: El webhook de Mercado Pago solo actualiza la DB, el email se envía automáticamente

### Configurar Database Webhook

1. Ve a [Supabase Dashboard](https://app.supabase.com) → Tu proyecto
2. Navega a **Database** → **Webhooks** (o **Database** → **Replication** → **Webhooks**)
3. Haz clic en **"Enable Database Webhooks"** si aún no están habilitados
4. Haz clic en **"Create a new webhook"** o **"New webhook"**
5. Configura el webhook:

   **Nombre**: `notify-payment-approved`
   
   **Table**: Selecciona `payments`
   
   **Events**: Selecciona solo **UPDATE**
   
   **Type**: **HTTP Request**
   
   **Method**: `POST`
   
   **URL**: 
   ```
   https://tu-proyecto.supabase.co/functions/v1/notify-payment-approved
   ```
   
   > Reemplaza `tu-proyecto` con el nombre real de tu proyecto de Supabase
   
   **Headers**: 
   ```
   Content-Type: application/json
   ```
   
   **Body (opcional)**: Puedes dejar el body vacío, la función ya maneja los datos del webhook automáticamente.

6. Guarda el webhook

**Nota**: La función `notify-payment-approved` ya está configurada para:
- Detectar cuando `payment_status` cambia a "aprobado"
- Ignorar actualizaciones que no cambian el estado a "aprobado"
- Procesar correctamente el formato de Database Webhooks de Supabase

### Verificar que funciona

1. Actualiza manualmente un pago a "aprobado" en la tabla `payments`
2. Revisa los logs de la Edge Function en **Edge Functions** → **Logs**
3. Verifica que el email se envió correctamente

### Configurar variables de entorno

Asegúrate de tener configuradas estas variables en **Settings** → **Edge Functions** → **Secrets**:

```
RESEND_API_KEY=tu_resend_api_key
FROM_EMAIL=noreply@elsapito3d.com
SITE_URL=https://elsapito3d.com
```

---

## 5. Configurar Webhooks en Mercado Pago

1. En [Mercado Pago Developers](https://www.mercadopago.com.ar/developers), ve a tu aplicación
2. Configura la URL del webhook:
   ```
   https://tu-proyecto.supabase.co/functions/v1/webhook-mercado-pago
   ```
3. Asegúrate de que la URL sea HTTPS y esté accesible públicamente

---

## 6. Probar las Credenciales

Ejecuta el script de prueba:

```bash
# Configura las variables de entorno
export MERCADO_PAGO_ACCESS_TOKEN="tu-token"
export MERCADO_PAGO_PUBLIC_KEY="tu-key"

# Ejecuta el script
node test-mercado-pago.js
```

---

## Checklist

- [ ] Obtuviste las credenciales de producción
- [ ] Configuraste las variables en Supabase (Edge Functions Secrets o tabla)
- [ ] Creaste las Edge Functions para crear preferencias y procesar webhooks
- [ ] **Configuraste Database Webhooks en Supabase para envío automático de emails**
- [ ] Configuraste los webhooks en Mercado Pago
- [ ] Probaste las credenciales con el script
- [ ] Verificaste que el Access Token NO está en el frontend
- [ ] Tu dominio tiene HTTPS válido
- [ ] Las tablas `payments` y `payment_statistics` están configuradas correctamente
- [ ] Configuraste `RESEND_API_KEY` en Edge Functions Secrets

---

## Seguridad

- ✅ El Access Token solo en Supabase (Edge Functions Secrets o tabla protegida)
- ✅ La Public Key puede estar en el frontend si es necesario
- ✅ Usa HTTPS siempre en producción
- ✅ Valida los webhooks antes de procesarlos
- ❌ NO subas credenciales a Git
- ❌ NO expongas el Access Token en el frontend

---

## Troubleshooting

**Error: "Invalid access_token"**

- Verifica que copiaste el token completo
- Asegúrate de que es el token de producción (no test)

**Los webhooks no llegan**

- Verifica que la URL sea HTTPS
- Asegúrate de que el endpoint esté accesible públicamente
- Revisa los logs en Supabase Dashboard → Edge Functions → Logs

**Los pagos no se actualizan en la tabla `payments`**

- Verifica que el webhook esté procesando correctamente
- Revisa que el `external_reference` coincida
- Verifica los logs de la Edge Function

**Los emails no se envían cuando un pago se aprueba**

- Verifica que los Database Webhooks estén habilitados en Supabase
- Revisa que la URL del webhook sea correcta
- Verifica que `RESEND_API_KEY` esté configurado en Edge Functions Secrets
- Revisa los logs de la función `notify-payment-approved`
- Asegúrate de que el webhook se dispare solo cuando `payment_status` cambia a "aprobado"
