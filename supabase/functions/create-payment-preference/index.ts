// @ts-nocheck
/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface CreatePreferenceRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  amount: number;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  product_id?: string;
  order_id?: string;
}

const getSiteUrl = (): string => {
  const siteUrl = Deno.env.get("SITE_URL");
  if (siteUrl) return siteUrl;
  
  const supabaseUrl = SUPABASE_URL || "";
  if (supabaseUrl.includes("supabase.co")) {
    const projectRef = supabaseUrl.split("//")[1]?.split(".")[0];
    return `https://${projectRef}.supabase.co`;
  }
  
  return "https://elsapito3d.com";
};

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    "https://elsapito3d.com",
    "https://www.elsapito3d.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  
  const originPattern = /^https:\/\/elsapito-.*\.vercel\.app$/;
  const isAllowedOrigin = origin && (
    allowedOrigins.includes(origin) || 
    originPattern.test(origin) ||
    origin.includes("vercel.app")
  );
  
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Manejar preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Length": "0",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "MERCADO_PAGO_ACCESS_TOKEN not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body: CreatePreferenceRequest = await req.json();

    if (!body.customer_name || !body.customer_email || !body.amount || !body.items || body.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const siteUrl = getSiteUrl();
    const externalReference = crypto.randomUUID();

    const preferenceData = {
      items: body.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      payer: {
        name: body.customer_name,
        email: body.customer_email,
        phone: body.customer_phone ? { number: body.customer_phone } : undefined,
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
      return new Response(
        JSON.stringify({
          error: "Failed to create payment preference",
          details: errorData,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
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
        customer_address: body.customer_address || null,
        amount: body.amount,
        payment_method: "mercado_pago",
        payment_status: "pendiente",
        product_id: body.product_id || null,
        order_id: body.order_id || null,
        mp_preference_id: preference.id,
        mp_external_reference: externalReference,
        metadata: {
          items: body.items,
          currency: "ARS",
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({
          error: "Failed to save payment record",
          details: dbError.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        preference: {
          id: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point,
        },
        payment,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in create-payment-preference:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

