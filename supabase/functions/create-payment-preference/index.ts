// @ts-nocheck
/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    "https://elsapito3d.com",
    "https://www.elsapito3d.com",
    "https://elsapito.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
  ];

  const vercelPattern = /^https:\/\/.*\.vercel\.app$/;
  const isAllowedOrigin =
    origin &&
    (allowedOrigins.includes(origin) ||
      vercelPattern.test(origin));

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
};

const createErrorResponse = (
  error: string,
  status: number,
  origin: string | null
): Response => {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
};

const createSuccessResponse = (
  data: unknown,
  origin: string | null
): Response => {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
};

const handleOptionsRequest = (origin: string | null): Response => {
  return new Response(null, {
    status: 200,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Length": "0",
    },
  });
};

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface CreatePreferenceRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_instagram?: string;
  customer_address?: string;
  amount: number;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    selectedColors?: Array<{
      name: string;
      code: string;
    }>;
    selectedSections?: Array<{
      sectionId: string;
      sectionLabel: string;
      colorId: string;
      colorName: string;
      colorCode: string;
    }>;
    selectedAccessories?: Array<{
      name: string;
      color: {
        name: string;
        code: string;
      };
      quantity: number;
      price?: number;
    }>;
  }>;
  product_id?: string;
  order_id?: string;
  delivery_method?: "pickup" | "shipping";
}

const getSiteUrl = (origin: string | null): string => {
  // Priorizar origin del request si está disponible y es válido
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const allowedHosts = [
        "elsapito3d.com",
        "www.elsapito3d.com",
        "localhost",
      ];
      const isVercel = originUrl.hostname.includes("vercel.app");
      
      if (
        allowedHosts.some((host) => originUrl.hostname.includes(host)) ||
        isVercel
      ) {
        return `${originUrl.protocol}//${originUrl.hostname}`;
      }
    } catch {
      // Si no se puede parsear, continuar con otros métodos
    }
  }

  const siteUrl = Deno.env.get("SITE_URL");
  if (siteUrl) return siteUrl;

  const supabaseUrl = SUPABASE_URL || "";
  if (supabaseUrl.includes("supabase.co")) {
    const projectRef = supabaseUrl.split("//")[1]?.split(".")[0];
    return `https://${projectRef}.supabase.co`;
  }

  return "https://elsapito3d.com";
};

serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return handleOptionsRequest(origin);
  }

  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed", 405, origin);
  }

  try {
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      return createErrorResponse(
        "MERCADO_PAGO_ACCESS_TOKEN not configured",
        500,
        origin
      );
    }

    const body: CreatePreferenceRequest = await req.json();

    if (
      !body.customer_name ||
      !body.customer_email ||
      !body.amount ||
      !body.items ||
      body.items.length === 0
    ) {
      return createErrorResponse("Missing required fields", 400, origin);
    }

    const siteUrl = getSiteUrl(origin);
    const externalReference = crypto.randomUUID();

    const itemsTotal = body.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const difference = body.amount - itemsTotal;

    const preferenceItems = body.items.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    // Si hay una diferencia positiva significativa (> 1 peso para evitar errores de redondeo),
    // agregamos el recargo como un item adicional
    if (difference > 1) {
      preferenceItems.push({
        id: "payment-surcharge",
        title: "Recargo por método de pago",
        quantity: 1,
        unit_price: Number(difference.toFixed(2)),
      });
    }

    // Establecer fecha de expiración: 30 minutos desde ahora
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 30);

    const preferenceData = {
      items: preferenceItems,
      payer: {
        name: body.customer_name,
        email: body.customer_email,
        phone: body.customer_phone
          ? { number: body.customer_phone }
          : undefined,
        address: body.customer_address
          ? { street_name: body.customer_address }
          : undefined,
      },
      back_urls: {
        success: `${siteUrl}/payment/success`,
        failure: `${siteUrl}/payment/failure`,
        pending: `${siteUrl}/payment/pending`,
      },
      auto_return: "approved" as const,
      notification_url: `${SUPABASE_URL}/functions/v1/webhook-mercado-pago`,
      external_reference: externalReference,
      statement_descriptor: "ElSapito3D",
      currency_id: "ARS",
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: expirationDate.toISOString(),
      binary_mode: false,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
      },
    };

    const mpResponse = await fetch(
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

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error("Mercado Pago API error:", errorData);
      return createErrorResponse(
        `Failed to create payment preference: ${errorData}`,
        500,
        origin
      );
    }

    const preference = await mpResponse.json();

    const supabase = createClient(
      SUPABASE_URL ?? "",
      SUPABASE_SERVICE_ROLE_KEY ?? ""
    );

    const { data: payment, error: dbError } = await supabase
      .from("payments")
      .insert({
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone || null,
        customer_instagram: body.customer_instagram || null,
        customer_address: body.customer_address || null,
        amount: body.amount,
        payment_method: "mercado_pago",
        payment_status: "pendiente",
        product_id: body.product_id || null,
        order_id: body.order_id || null,
        mp_preference_id: preference.id,
        mp_external_reference: externalReference,
        metadata: {
          items: body.items.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            selectedColors: item.selectedColors || [],
            selectedSections: item.selectedSections || [],
            selectedAccessories: item.selectedAccessories || [],
          })),
          currency: "ARS",
          delivery_method: body.delivery_method || null,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return createErrorResponse(
        `Failed to save payment record: ${dbError.message}`,
        500,
        origin
      );
    }

    return createSuccessResponse(
      {
        success: true,
        preference: {
          id: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point,
        },
        payment,
      },
      origin
    );
  } catch (error) {
    console.error("Error in create-payment-preference:", error);
    return createErrorResponse(
      `Internal server error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500,
      origin
    );
  }
});
