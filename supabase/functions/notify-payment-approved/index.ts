// @ts-nocheck
/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@elsapito3d.com";
const SITE_URL = Deno.env.get("SITE_URL") || "https://elsapito3d.com";

interface PaymentData {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  payment_status: string;
}

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    mercado_pago: "Mercado Pago",
    tarjeta_credito: "Tarjeta de Crédito",
    tarjeta_debito: "Tarjeta de Débito",
    transferencia: "Transferencia Bancaria",
    efectivo: "Efectivo",
    otro: "Otro método",
  };
  return methods[method] || method;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const createEmailHTML = (payment: PaymentData): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pago Aprobado - ElSapito3D</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">¡Pago Aprobado!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hola <strong>${payment.customer_name}</strong>,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Nos complace informarte que tu pago ha sido <strong style="color: #10b981;">aprobado exitosamente</strong>.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h2 style="margin-top: 0; color: #333; font-size: 20px;">Detalles del Pago</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Monto:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333; font-size: 18px;">
            ${formatAmount(payment.amount)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Método de Pago:</td>
          <td style="padding: 8px 0; text-align: right; color: #333;">
            ${formatPaymentMethod(payment.payment_method)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Fecha:</td>
          <td style="padding: 8px 0; text-align: right; color: #333;">
            ${formatDate(payment.payment_date)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">ID de Pago:</td>
          <td style="padding: 8px 0; text-align: right; color: #666; font-size: 12px; font-family: monospace;">
            ${payment.id.slice(0, 12)}...
          </td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; margin-bottom: 20px;">
      Tu pedido está siendo procesado y te notificaremos cuando esté listo para envío.
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.
    </p>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      <p style="color: #666; font-size: 14px; margin: 0;">
        Gracias por confiar en <strong>ElSapito3D</strong>
      </p>
      <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
        Este es un email automático, por favor no respondas a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

const createEmailText = (payment: PaymentData): string => {
  return `
¡Pago Aprobado!

Hola ${payment.customer_name},

Nos complace informarte que tu pago ha sido aprobado exitosamente.

Detalles del Pago:
- Monto: ${formatAmount(payment.amount)}
- Método de Pago: ${formatPaymentMethod(payment.payment_method)}
- Fecha: ${formatDate(payment.payment_date)}
- ID de Pago: ${payment.id.slice(0, 12)}...

Tu pedido está siendo procesado y te notificaremos cuando esté listo para envío.

Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.

Gracias por confiar en ElSapito3D

Este es un email automático, por favor no respondas a este mensaje.
  `.trim();
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();

    let payment: PaymentData | null = null;

    if (body.payment) {
      payment = body.payment as PaymentData;
    } else if (body.record && body.type === "UPDATE") {
      const record = body.record as Record<string, unknown>;
      const oldRecord = body.old_record as Record<string, unknown> | null;

      if (
        record.payment_status === "aprobado" &&
        oldRecord?.payment_status !== "aprobado"
      ) {
        payment = {
          id: record.id as string,
          customer_name: record.customer_name as string,
          customer_email: record.customer_email as string,
          amount: Number(record.amount),
          payment_method: record.payment_method as string,
          payment_date:
            (record.payment_date as string) || new Date().toISOString(),
          payment_status: record.payment_status as string,
        };
      } else {
        return new Response(
          JSON.stringify({
            message: "Payment status did not change to approved",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (!payment || !payment.customer_email) {
      return new Response(
        JSON.stringify({ error: "Payment data is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (payment.payment_status !== "aprobado") {
      return new Response(
        JSON.stringify({ error: "Payment is not approved" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({
          error: "Email service is not configured",
          message: "Payment approved but email notification could not be sent",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payment.customer_email,
        subject: `Pago Aprobado - ${formatAmount(payment.amount)} - ElSapito3D`,
        html: createEmailHTML(payment),
        text: createEmailText(payment),
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          details: errorData,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailResult = await emailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email notification sent successfully",
        emailId: emailResult.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in notify-payment-approved function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
