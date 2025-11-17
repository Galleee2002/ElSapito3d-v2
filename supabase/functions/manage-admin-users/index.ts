/// <reference types="../deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno puede importar desde URLs en tiempo de ejecución
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, email, password, is_admin } = await req.json();

    // Para la acción "get_status", permitir a cualquier usuario autenticado consultar su propio estado
    if (action === "get_status") {
      if (!user.email) {
        return new Response(JSON.stringify({ error: "User email not found" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Consultar la tabla de usuarios en la base de datos
      const dbClient = supabaseAdmin as any;
      const { data: dbUser, error: dbError } = await dbClient
        .from("admin_credentials")
        .select("email, is_admin")
        .eq("email", user.email)
        .single();

      if (dbError && dbError.code !== "PGRST116") {
        return new Response(JSON.stringify({ error: dbError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const isAdmin = dbUser
        ? Boolean(dbUser.is_admin)
        : user.user_metadata?.is_admin ?? false;

      return new Response(
        JSON.stringify({
          email: user.email,
          is_admin: isAdmin,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (action) {
      case "create": {
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: "Email and password required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
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
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({
            email: newUser.user?.email,
            is_admin: newUser.user?.user_metadata?.is_admin || false,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "update": {
        if (!email) {
          return new Response(JSON.stringify({ error: "Email required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Obtener el usuario por email
        const {
          data: { users },
          error: listError,
        } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
          return new Response(JSON.stringify({ error: listError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const targetUser = users.find((u) => u.email === email);

        if (!targetUser) {
          return new Response(JSON.stringify({ error: "User not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
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
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({
            email: updatedUser.user?.email,
            is_admin: updatedUser.user?.user_metadata?.is_admin || false,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "list": {
        const {
          data: { users },
          error: listError,
        } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
          return new Response(JSON.stringify({ error: listError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
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

        return new Response(JSON.stringify(usersList), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
