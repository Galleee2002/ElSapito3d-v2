// @ts-nocheck
/// <reference path="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import {
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
} from "../_shared/response-helpers.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const BUCKET_NAME = "payment-proofs";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadPaymentProofRequest {
  directory?: string;
  fileName: string;
  fileExt?: string;
  contentType: string;
  base64: string;
  size?: number;
}

const sanitizeSegment = (value: string, fallback: string): string => {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return sanitized || fallback;
};

const sanitizeFileName = (value: string): string => {
  const nameWithoutExtension = value.replace(/\.[^/.]+$/, "");
  const sanitized = nameWithoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return sanitized || "comprobante";
};

const estimateBase64Size = (base64: string): number => {
  return Math.floor((base64.length * 3) / 4);
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
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return createErrorResponse("Supabase configuration missing", 500, origin);
    }

    const body: UploadPaymentProofRequest = await req.json();

    if (!body.base64 || !body.contentType || !body.fileName) {
      return createErrorResponse(
        "base64, contentType y fileName son obligatorios",
        400,
        origin
      );
    }

    const cleanedBase64 = body.base64.includes(",")
      ? body.base64.split(",").pop() ?? ""
      : body.base64;

    if (!cleanedBase64) {
      return createErrorResponse(
        "El archivo enviado es inválido",
        400,
        origin
      );
    }

    const estimatedSize = estimateBase64Size(cleanedBase64);
    if (estimatedSize > MAX_FILE_SIZE) {
      return createErrorResponse(
        "El archivo supera el tamaño máximo permitido (10MB)",
        400,
        origin
      );
    }

    if (body.size && body.size > MAX_FILE_SIZE) {
      return createErrorResponse(
        "El archivo supera el tamaño máximo permitido (10MB)",
        400,
        origin
      );
    }

    const directory = sanitizeSegment(
      body.directory ?? `temp-${crypto.randomUUID()}`,
      `temp-${crypto.randomUUID()}`
    );
    const baseFileName = sanitizeFileName(body.fileName);

    const extensionFromBody = body.fileExt
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const extensionFromContentType = body.contentType.split("/")[1]?.trim();
    const fileExtension =
      extensionFromBody || extensionFromContentType || "dat";

    const filePath = `${directory}/${Date.now()}-${crypto
      .randomUUID()
      .slice(0, 8)}-${baseFileName}.${fileExtension}`;

    const fileBuffer = base64Decode(cleanedBase64);

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

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: body.contentType,
      });

    if (uploadError) {
      console.error(
        "[UPLOAD-PAYMENT-PROOF] Error al subir comprobante:",
        uploadError
      );
      return createErrorResponse(
        `No se pudo subir el comprobante: ${uploadError.message}`,
        500,
        origin
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    console.log("[UPLOAD-PAYMENT-PROOF] Comprobante subido:", {
      filePath,
      contentType: body.contentType,
      directory,
    });

    return createSuccessResponse(
      {
        success: true,
        url: publicUrl,
        path: filePath,
      },
      origin
    );
  } catch (error) {
    console.error("Error in upload-payment-proof:", error);
    return createErrorResponse(
      `Internal server error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500,
      origin
    );
  }
});
