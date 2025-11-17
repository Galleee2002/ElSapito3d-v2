// @ts-nocheck
/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getCorsHeaders } from "../_shared/cors.ts";
import { createErrorResponse, createSuccessResponse, handleOptionsRequest } from "../_shared/response-helpers.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface ApprovePaymentRequest {
  payment_id: string;
  notes?: string;
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
    const body: ApprovePaymentRequest = await req.json();

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
        `Payment not found: ${fetchError ? JSON.stringify(fetchError) : "Payment not found"}`,
        404,
        origin
      );
    }

    if (existingPayment.payment_status !== "pendiente") {
      return createErrorResponse(
        `Payment is already ${existingPayment.payment_status}`,
        400,
        origin
      );
    }

    const updateData: Record<string, unknown> = {
      payment_status: "aprobado",
    };

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    } else if (existingPayment.notes) {
      updateData.notes = existingPayment.notes;
    }

    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", body.payment_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating payment:", updateError);
      return createErrorResponse(
        `Failed to approve payment: ${JSON.stringify(updateError)}`,
        500,
        origin
      );
    }

    console.log("[APPROVE-PAYMENT] Pago aprobado exitosamente:", {
      paymentId: updatedPayment.id,
      customerEmail: updatedPayment.customer_email,
    });

    return createSuccessResponse(
      {
        success: true,
        payment: updatedPayment,
      },
      origin
    );
  } catch (error) {
    console.error("Error in approve-payment:", error);
    return createErrorResponse(
      `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
      origin
    );
  }
});
