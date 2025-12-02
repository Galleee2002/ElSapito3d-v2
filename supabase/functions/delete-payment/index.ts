// @ts-nocheck
/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface DeletePaymentRequest {
  payment_id: string;
}

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

serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return handleOptionsRequest(origin);
  }

  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed", 405, origin);
  }

  try {
    const body: DeletePaymentRequest = await req.json();

    if (!body.payment_id) {
      return createErrorResponse("payment_id is required", 400, origin);
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return createErrorResponse("Supabase configuration missing", 500, origin);
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

    const { data: existingPayment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", body.payment_id)
      .single();

    if (fetchError || !existingPayment) {
      console.error("Error fetching payment:", fetchError);
      return createErrorResponse(
        `Payment not found: ${
          fetchError ? JSON.stringify(fetchError) : "Payment not found"
        }`,
        404,
        origin
      );
    }

    const { error: deleteError } = await supabase
      .from("payments")
      .delete()
      .eq("id", body.payment_id);

    if (deleteError) {
      console.error("Error deleting payment:", deleteError);
      return createErrorResponse(
        `Failed to delete payment: ${JSON.stringify(deleteError)}`,
        500,
        origin
      );
    }

    console.log("[DELETE-PAYMENT] Pago eliminado exitosamente:", {
      paymentId: existingPayment.id,
      customerEmail: existingPayment.customer_email,
    });

    return createSuccessResponse(
      {
        success: true,
        message: "Payment deleted successfully",
      },
      origin
    );
  } catch (error) {
    console.error("Error in delete-payment:", error);
    return createErrorResponse(
      `Internal server error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500,
      origin
    );
  }
});
