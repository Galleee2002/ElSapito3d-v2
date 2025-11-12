/**
 * Script de prueba para verificar credenciales de Mercado Pago
 *
 * Uso:
 * 1. Configura las variables de entorno o edita directamente las constantes
 * 2. Ejecuta: node test-mercado-pago.js
 *
 * IMPORTANTE: Este script es solo para pruebas. No lo uses en producción.
 */

// ============================================
// CONFIGURACIÓN - Edita estas variables
// ============================================
const MERCADO_PAGO_ACCESS_TOKEN =
  process.env.MERCADO_PAGO_ACCESS_TOKEN || "TU_ACCESS_TOKEN_AQUI";
const MERCADO_PAGO_PUBLIC_KEY =
  process.env.MERCADO_PAGO_PUBLIC_KEY || "TU_PUBLIC_KEY_AQUI";

// ============================================
// FUNCIONES DE PRUEBA
// ============================================

/**
 * Prueba 1: Verificar información de la cuenta
 */
async function testAccountInfo() {
  console.log("\n🔍 Prueba 1: Verificando información de la cuenta...\n");

  try {
    const response = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Credenciales válidas!\n");
      console.log("Información de la cuenta:");
      console.log(`  - ID: ${data.id}`);
      console.log(`  - Nickname: ${data.nickname || "N/A"}`);
      console.log(`  - Email: ${data.email || "N/A"}`);
      console.log(`  - País: ${data.country_id || "N/A"}`);
      console.log(`  - Tipo de cuenta: ${data.site_id || "N/A"}\n`);
      return true;
    } else {
      console.log("❌ Error al verificar credenciales:\n");
      console.log(`  Código: ${data.status || response.status}`);
      console.log(`  Mensaje: ${data.message || "Error desconocido"}\n`);
      return false;
    }
  } catch (error) {
    console.log("❌ Error de conexión:\n");
    console.log(`  ${error.message}\n`);
    return false;
  }
}

/**
 * Prueba 2: Crear una preferencia de pago de prueba
 */
async function testCreatePreference() {
  console.log("🔍 Prueba 2: Creando preferencia de pago de prueba...\n");

  try {
    const preferenceData = {
      items: [
        {
          title: "Producto de Prueba",
          description:
            "Este es un producto de prueba para verificar las credenciales",
          quantity: 1,
          unit_price: 100.0,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "https://tu-dominio.com/success",
        failure: "https://tu-dominio.com/failure",
        pending: "https://tu-dominio.com/pending",
      },
      auto_return: "approved",
      notification_url: "https://tu-dominio.com/webhook",
      statement_descriptor: "PRUEBA",
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferenceData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Preferencia creada exitosamente!\n");
      console.log("Información de la preferencia:");
      console.log(`  - ID: ${data.id}`);
      console.log(`  - Init Point: ${data.init_point}`);
      console.log(
        `  - Sandbox Init Point: ${data.sandbox_init_point || "N/A"}\n`
      );
      console.log("🔗 URL de pago:");
      console.log(`  ${data.init_point}\n`);
      return true;
    } else {
      console.log("❌ Error al crear preferencia:\n");
      console.log(`  Código: ${data.status || response.status}`);
      console.log(`  Mensaje: ${data.message || "Error desconocido"}`);
      if (data.cause) {
        console.log(`  Causa: ${JSON.stringify(data.cause, null, 2)}`);
      }
      console.log("");
      return false;
    }
  } catch (error) {
    console.log("❌ Error de conexión:\n");
    console.log(`  ${error.message}\n`);
    return false;
  }
}

/**
 * Prueba 3: Verificar métodos de pago disponibles
 */
async function testPaymentMethods() {
  console.log("🔍 Prueba 3: Verificando métodos de pago disponibles...\n");

  try {
    const response = await fetch(
      "https://api.mercadopago.com/v1/payment_methods",
      {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok && Array.isArray(data)) {
      console.log(
        `✅ Se encontraron ${data.length} métodos de pago disponibles\n`
      );
      console.log("Métodos de pago:");
      data.slice(0, 5).forEach((method) => {
        console.log(`  - ${method.name} (${method.id})`);
      });
      if (data.length > 5) {
        console.log(`  ... y ${data.length - 5} más\n`);
      } else {
        console.log("");
      }
      return true;
    } else {
      console.log("❌ Error al obtener métodos de pago:\n");
      console.log(`  ${JSON.stringify(data, null, 2)}\n`);
      return false;
    }
  } catch (error) {
    console.log("❌ Error de conexión:\n");
    console.log(`  ${error.message}\n`);
    return false;
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function runTests() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  PRUEBA DE CREDENCIALES DE MERCADO PAGO");
  console.log("═══════════════════════════════════════════════════════");

  // Verificar que las credenciales estén configuradas
  if (
    MERCADO_PAGO_ACCESS_TOKEN === "TU_ACCESS_TOKEN_AQUI" ||
    MERCADO_PAGO_ACCESS_TOKEN === ""
  ) {
    console.log("\n❌ ERROR: No se configuró el Access Token");
    console.log(
      "   Configura la variable MERCADO_PAGO_ACCESS_TOKEN o edita el script\n"
    );
    process.exit(1);
  }

  if (
    MERCADO_PAGO_PUBLIC_KEY === "TU_PUBLIC_KEY_AQUI" ||
    MERCADO_PAGO_PUBLIC_KEY === ""
  ) {
    console.log("\n⚠️  ADVERTENCIA: No se configuró la Public Key");
    console.log("   Algunas pruebas pueden fallar\n");
  }

  console.log(
    `\nAccess Token: ${MERCADO_PAGO_ACCESS_TOKEN.substring(0, 20)}...`
  );
  console.log(`Public Key: ${MERCADO_PAGO_PUBLIC_KEY.substring(0, 20)}...\n`);

  // Ejecutar pruebas
  const results = {
    accountInfo: await testAccountInfo(),
    createPreference: await testCreatePreference(),
    paymentMethods: await testPaymentMethods(),
  };

  // Resumen
  console.log("═══════════════════════════════════════════════════════");
  console.log("  RESUMEN DE PRUEBAS");
  console.log("═══════════════════════════════════════════════════════\n");
  console.log(`  Verificación de cuenta: ${results.accountInfo ? "✅" : "❌"}`);
  console.log(
    `  Creación de preferencia: ${results.createPreference ? "✅" : "❌"}`
  );
  console.log(`  Métodos de pago: ${results.paymentMethods ? "✅" : "❌"}\n`);

  const allPassed = Object.values(results).every((result) => result);

  if (allPassed) {
    console.log(
      "✅ Todas las pruebas pasaron. Las credenciales están funcionando correctamente.\n"
    );
    process.exit(0);
  } else {
    console.log(
      "❌ Algunas pruebas fallaron. Revisa las credenciales y la configuración.\n"
    );
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch((error) => {
    console.error("Error inesperado:", error);
    process.exit(1);
  });
}

export { runTests, testAccountInfo, testCreatePreference, testPaymentMethods };
