// @ts-nocheck
/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const supabaseUrl = SUPABASE_URL.replace(/\/$/, "");
    const apiUrl = `${supabaseUrl}/rest/v1/payments`;

    const fetchPaymentResponse = await fetch(
      `${apiUrl}?id=eq.${body.payment_id}&select=*`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: "return=representation",
        },
      }
    );

    if (!fetchPaymentResponse.ok) {
      const errorText = await fetchPaymentResponse.text();
      console.error("Error fetching payment:", errorText);
      return new Response(
        JSON.stringify({
          error: "Payment not found",
          details: errorText,
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

    const payments = await fetchPaymentResponse.json();
    const existingPayment = payments[0];

    if (!existingPayment) {
      return new Response(JSON.stringify({ error: "Payment not found" }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
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

    const updateResponse = await fetch(`${apiUrl}?id=eq.${body.payment_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error("Error updating payment:", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to approve payment",
          details: errorText,
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

    const updatedPayments = await updateResponse.json();
    const updatedPayment = updatedPayments[0];

    return new Response(
      JSON.stringify({
        success: true,
        payment: updatedPayment,
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
