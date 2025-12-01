/// <reference types="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno puede importar desde URLs en tiempo de ejecución
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
} from "../_shared/response-helpers.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return handleOptionsRequest(origin);
  }

  try {
    // Cliente para validar el token del usuario (con anon key)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Cliente para operaciones administrativas (con service role key)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createErrorResponse("No authorization header", 401, origin);
    }

    // Extraer el token JWT del header (formato: "Bearer <token>")
    const token = authHeader.replace(/^Bearer\s+/i, "");

    // Validar el token usando el cliente con anon key
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return createErrorResponse("Invalid token", 401, origin);
    }

    const { action, email, password, is_admin } = await req.json();

    // Para la acción "get_status", permitir a cualquier usuario autenticado consultar su propio estado
    if (action === "get_status") {
      if (!user.email) {
        return createErrorResponse("User email not found", 400, origin);
      }

      const isAdmin = Boolean(user.user_metadata?.is_admin);

      return createSuccessResponse(
        {
          email: user.email,
          is_admin: isAdmin,
        },
        origin
      );
    }

    // Para otras acciones, verificar que el usuario sea admin
    const isAdmin = Boolean(user.user_metadata?.is_admin);

    if (!isAdmin) {
      return createErrorResponse("Unauthorized", 403, origin);
    }

    switch (action) {
      case "create": {
        if (!email || !password) {
          return createErrorResponse(
            "Email and password required",
            400,
            origin
          );
        }

        const { data: newUser, error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              is_admin: is_admin || false,
            },
          });

        if (createError) {
          return createErrorResponse(createError.message, 400, origin);
        }

        return createSuccessResponse(
          {
            email: newUser.user?.email,
            is_admin: newUser.user?.user_metadata?.is_admin || false,
          },
          origin
        );
      }

      case "update": {
        if (!email) {
          return createErrorResponse("Email required", 400, origin);
        }

        // Obtener el usuario por email
        const {
          data: { users },
          error: listError,
        } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
          return createErrorResponse(listError.message, 400, origin);
        }

        const targetUser = users.find((u) => u.email === email);

        if (!targetUser) {
          return createErrorResponse("User not found", 404, origin);
        }

        // Actualizar el user_metadata
        // @ts-ignore - El tipo updateUserById existe en la versión de producción
        const { data: updatedUser, error: updateError } =
          await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
            user_metadata: {
              ...targetUser.user_metadata,
              is_admin: is_admin || false,
            },
          });

        if (updateError) {
          return createErrorResponse(updateError.message, 400, origin);
        }

        return createSuccessResponse(
          {
            email: updatedUser.user?.email,
            is_admin: updatedUser.user?.user_metadata?.is_admin || false,
          },
          origin
        );
      }

      case "list": {
        const {
          data: { users },
          error: listError,
        } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
          return createErrorResponse(listError.message, 400, origin);
        }

        const usersList = users.map((u) => ({
          email: u.email,
          is_admin: Boolean(u.user_metadata?.is_admin),
        }));

        return createSuccessResponse(usersList, origin);
      }

      default:
        return createErrorResponse("Invalid action", 400, origin);
    }
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Unknown error",
      500,
      origin
    );
  }
});
