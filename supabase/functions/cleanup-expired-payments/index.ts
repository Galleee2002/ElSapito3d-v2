// @ts-nocheck
/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      SUPABASE_URL ?? "",
      SUPABASE_SERVICE_ROLE_KEY ?? ""
    );

    // Calcular el tiempo límite: 30 minutos atrás
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() - 30);
    const expirationTimeISO = expirationTime.toISOString();

    // Buscar pagos pendientes creados hace más de 30 minutos
    const { data: expiredPayments, error: fetchError } = await supabase
      .from("payments")
      .select("id, mp_external_reference, customer_name, customer_email, amount, created_at")
      .eq("payment_status", "pendiente")
      .lt("created_at", expirationTimeISO);

    if (fetchError) {
      console.error("Error fetching expired payments:", fetchError);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch expired payments",
          details: fetchError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!expiredPayments || expiredPayments.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No expired payments found",
          cancelled_count: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Actualizar todos los pagos expirados a "cancelado"
    const idsToUpdate = expiredPayments.map((p) => p.id);

    const { error: updateError } = await supabase
      .from("payments")
      .update({
        payment_status: "cancelado",
        notes: "Pago cancelado automáticamente: Usuario no completó el pago dentro del tiempo límite (30 minutos)",
        updated_at: new Date().toISOString(),
      })
      .in("id", idsToUpdate);

    if (updateError) {
      console.error("Error updating expired payments:", updateError);
      return new Response(
        JSON.stringify({
          error: "Failed to update expired payments",
          details: updateError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `Successfully cancelled ${expiredPayments.length} expired payment(s)`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully cancelled ${expiredPayments.length} expired payment(s)`,
        cancelled_count: expiredPayments.length,
        cancelled_payments: expiredPayments.map((p) => ({
          id: p.id,
          external_reference: p.mp_external_reference,
          customer_email: p.customer_email,
          amount: p.amount,
          created_at: p.created_at,
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in cleanup-expired-payments:", error);
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









