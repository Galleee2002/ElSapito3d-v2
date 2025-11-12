// @ts-nocheck
/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface ApprovePaymentRequest {
  payment_id: string;
  notes?: string;
}

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    "https://elsapito3d.com",
    "https://www.elsapito3d.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  const originPattern = /^https:\/\/elsapito-.*\.vercel\.app$/;
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

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

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
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const body: ApprovePaymentRequest = await req.json();

    if (!body.payment_id) {
      return new Response(JSON.stringify({ error: "payment_id is required" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
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
      return new Response(
        JSON.stringify({
          error: "Payment not found",
          details: fetchError
            ? JSON.stringify(fetchError)
            : "Payment not found",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (existingPayment.payment_status !== "pendiente") {
      return new Response(
        JSON.stringify({
          error: `Payment is already ${existingPayment.payment_status}`,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
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
      return new Response(
        JSON.stringify({
          error: "Failed to approve payment",
          details: JSON.stringify(updateError),
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

    // Enviar notificación por email después de aprobar el pago
    let emailNotificationStatus = {
      sent: false,
      error: null as string | null,
      emailId: null as string | null,
    };

    try {
      console.log(`[APPROVE-PAYMENT] Intentando enviar email a: ${updatedPayment.customer_email}`);
      const notifyUrl = `${SUPABASE_URL}/functions/v1/notify-payment-approved`;
      const notifyResponse = await fetch(notifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          payment: {
            id: updatedPayment.id,
            customer_name: updatedPayment.customer_name,
            customer_email: updatedPayment.customer_email,
            amount: updatedPayment.amount,
            payment_method: updatedPayment.payment_method,
            payment_date: updatedPayment.payment_date,
            payment_status: updatedPayment.payment_status,
          },
        }),
      });

      if (!notifyResponse.ok) {
        const notifyError = await notifyResponse.text();
        const errorMessage = `Error ${notifyResponse.status}: ${notifyError}`;
        console.error("[APPROVE-PAYMENT] Error al enviar email de notificación:", errorMessage);
        emailNotificationStatus.error = errorMessage;
      } else {
        const notifyResult = await notifyResponse.json().catch(() => ({}));
        console.log("[APPROVE-PAYMENT] Email de notificación enviado exitosamente:", {
          emailId: notifyResult.emailId,
          customerEmail: updatedPayment.customer_email,
        });
        emailNotificationStatus.sent = true;
        emailNotificationStatus.emailId = notifyResult.emailId || null;
      }
    } catch (notifyError) {
      const errorMessage = notifyError instanceof Error ? notifyError.message : "Error desconocido";
      console.error("[APPROVE-PAYMENT] Excepción al enviar notificación:", errorMessage);
      emailNotificationStatus.error = errorMessage;
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: updatedPayment,
        emailNotification: emailNotificationStatus,
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
    console.error("Error in approve-payment:", error);
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
