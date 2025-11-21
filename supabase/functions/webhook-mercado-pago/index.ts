// @ts-nocheck
/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface MercadoPagoWebhook {
  type: string;
  data: {
    id: string;
  };
}

const statusMap: Record<string, string> = {
  approved: "aprobado",
  pending: "pendiente",
  rejected: "rechazado",
  cancelled: "cancelado",
  refunded: "reembolsado",
};

serve(async (req) => {
  try {
    const webhook: MercadoPagoWebhook = await req.json();

    if (webhook.type !== "payment") {
      return new Response(
        JSON.stringify({ message: "Webhook type not handled", received: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const paymentId = webhook.data.id;

    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error("Failed to fetch payment from Mercado Pago:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to fetch payment details" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const payment = await mpResponse.json();

    const supabase = createClient(
      SUPABASE_URL ?? "",
      SUPABASE_SERVICE_ROLE_KEY ?? ""
    );

    const mappedStatus = statusMap[payment.status] || "pendiente";
    
    const updateData: Record<string, unknown> = {
      payment_status: mappedStatus,
      mp_payment_id: payment.id.toString(),
      mp_collection_id: payment.collection_id?.toString() || null,
      mp_collection_status: payment.status || null,
      mp_payment_type: payment.payment_type_id || null,
      mp_merchant_order_id: payment.order?.id?.toString() || null,
      payment_date: payment.date_approved || payment.date_created || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (payment.status === "approved" && payment.date_approved) {
      updateData.payment_date = payment.date_approved;
    }

    if (payment.status === "cancelled" || payment.status === "rejected") {
      updateData.notes = payment.status_detail 
        ? `Pago ${mappedStatus}: ${payment.status_detail}` 
        : `Pago ${mappedStatus}`;
    }

    const { error: updateError } = await supabase
      .from("payments")
      .update(updateData)
      .eq("mp_external_reference", payment.external_reference);

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({
          error: "Failed to update payment",
          details: updateError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment updated successfully",
        payment_id: payment.id,
        status: payment.status,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in webhook-mercado-pago:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

