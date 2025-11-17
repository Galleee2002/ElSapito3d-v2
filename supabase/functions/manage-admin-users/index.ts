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

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return createErrorResponse("Invalid token", 401, origin);
    }

    const { action, email, password, is_admin } = await req.json();

    // Para la acción "get_status", permitir a cualquier usuario autenticado consultar su propio estado
    if (action === "get_status") {
      if (!user.email) {
        return createErrorResponse("User email not found", 400, origin);
      }

      // Consultar la tabla de usuarios en la base de datos
      const dbClient = supabaseAdmin as any;
      const { data: dbUser, error: dbError } = await dbClient
        .from("admin_credentials")
        .select("email, is_admin")
        .eq("email", user.email)
        .single();

      if (dbError && dbError.code !== "PGRST116") {
        return createErrorResponse(dbError.message, 400, origin);
      }

      const isAdmin = dbUser
        ? Boolean(dbUser.is_admin)
        : user.user_metadata?.is_admin ?? false;

      return createSuccessResponse(
        {
          email: user.email,
          is_admin: isAdmin,
        },
        origin
      );
    }

    // Para otras acciones, verificar que el usuario sea admin
    // Primero consultar la base de datos, luego user_metadata como fallback
    const dbClient = supabaseAdmin as any;
    let isAdmin = false;

    if (user.email) {
      const { data: dbUser } = await dbClient
        .from("admin_credentials")
        .select("is_admin")
        .eq("email", user.email)
        .single();

      if (dbUser) {
        isAdmin = Boolean(dbUser.is_admin);
      } else {
        isAdmin = user.user_metadata?.is_admin === true;
      }
    } else {
      isAdmin = user.user_metadata?.is_admin === true;
    }

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

        // Consultar la tabla de usuarios en la base de datos para obtener el estado is_admin
        const emails = users.map((u) => u.email).filter(Boolean) as string[];

        let dbUsers: Record<string, boolean> = {};
        if (emails.length > 0) {
          // El cliente con service role key tiene acceso a la base de datos
          const dbClient = supabaseAdmin as any;
          const { data: dbData, error: dbError } = await dbClient
            .from("admin_credentials")
            .select("email, is_admin")
            .in("email", emails);

          if (!dbError && dbData) {
            dbUsers = dbData.reduce((acc, user) => {
              if (user.email) {
                acc[user.email] = Boolean(user.is_admin);
              }
              return acc;
            }, {} as Record<string, boolean>);
          }
        }

        const usersList = users.map((u) => ({
          email: u.email,
          is_admin: u.email
            ? dbUsers[u.email] ?? u.user_metadata?.is_admin ?? false
            : false,
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
