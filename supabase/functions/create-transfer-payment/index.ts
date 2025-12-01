// @ts-nocheck
/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    "https://elsapito3d.com",
    "https://www.elsapito3d.com",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
  ];

  const originPattern = /^https:\/\/elsapito.*\.vercel\.app$/;
  const isAllowedOrigin =
    origin &&
    (allowedOrigins.includes(origin) ||
      originPattern.test(origin) ||
      origin.includes("vercel.app"));

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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface CreateTransferPaymentRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_instagram?: string;
  customer_address?: string;
  amount: number;
  transfer_proof_url: string;
  notes?: string;
  metadata?: {
    items?: Array<{
      id?: string;
      title?: string;
      quantity?: number;
      unit_price?: number;
      selectedColors?: Array<{ name: string; code: string }>;
      selectedSections?: Array<{
        sectionId: string;
        sectionLabel: string;
        colorId: string;
        colorName: string;
        colorCode: string;
      }>;
      selectedAccessories?: Array<{
        name: string;
        color: { name: string; code: string };
        quantity: number;
        price?: number;
      }>;
    }>;
    currency?: string;
    delivery_method?: "pickup" | "shipping" | string | null;
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return handleOptionsRequest(origin);
  }

  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed", 405, origin);
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return createErrorResponse("Supabase configuration missing", 500, origin);
    }

    const body: CreateTransferPaymentRequest = await req.json();

    if (
      !body.customer_name ||
      !body.customer_email ||
      !body.amount ||
      !body.transfer_proof_url
    ) {
      return createErrorResponse("Missing required fields", 400, origin);
    }

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

    const { data: payment, error: dbError } = await supabase
      .from("payments")
      .insert({
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone || null,
        customer_instagram: body.customer_instagram || null,
        customer_address: body.customer_address || null,
        amount: body.amount,
        payment_method: "transferencia",
        payment_status: "pendiente",
        transfer_proof_url: body.transfer_proof_url,
        notes: body.notes || null,
        metadata: body.metadata || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return createErrorResponse(
        `Failed to create payment: ${dbError.message}`,
        500,
        origin
      );
    }

    console.log("[CREATE-TRANSFER-PAYMENT] Pago creado exitosamente:", {
      paymentId: payment.id,
      customerEmail: payment.customer_email,
      amount: payment.amount,
    });

    return createSuccessResponse(
      {
        success: true,
        payment,
      },
      origin
    );
  } catch (error) {
    console.error("Error in create-transfer-payment:", error);
    return createErrorResponse(
      `Internal server error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500,
      origin
    );
  }
});
