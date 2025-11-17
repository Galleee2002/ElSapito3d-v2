import type { PostgrestError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { AdminCredential } from "@/types";

const ensureSupabaseConfigured = (): void => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase no está configurado. Verifica que las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas."
    );
  }
};

const list = async (): Promise<AdminCredential[]> => {
  ensureSupabaseConfigured();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Debes estar autenticado para ver los usuarios.");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const response = await fetch(`${supabaseUrl}/functions/v1/manage-admin-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
    },
    body: JSON.stringify({ action: "list" }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error || "No pudimos obtener los usuarios. Intenta nuevamente."
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((user: { email: string; is_admin: boolean }) => ({
      email: user.email,
      isAdmin: Boolean(user.is_admin),
    }))
    .filter((credential) => credential.email)
    .sort((a, b) => a.email.localeCompare(b.email));
};

const findByEmail = async (email: string): Promise<AdminCredential | null> => {
  ensureSupabaseConfigured();

  try {
    const { data, error } = await supabase.rpc("get_user_admin_status", {
      user_email: email,
    });

    if (error || !data) {
      return null;
    }

    return {
      email: data.email || email,
      isAdmin: Boolean(data.is_admin),
    };
  } catch {
    return null;
  }
};

const createUser = async (
  email: string,
  password: string,
  isAdmin = false
): Promise<AdminCredential> => {
  ensureSupabaseConfigured();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Debes estar autenticado para crear usuarios.");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const response = await fetch(`${supabaseUrl}/functions/v1/manage-admin-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
    },
    body: JSON.stringify({
      action: "create",
      email,
      password,
      is_admin: isAdmin,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (
      error.error?.includes("already") ||
      error.error?.includes("exists") ||
      error.error?.includes("registered")
    ) {
      throw new Error("Ya existe un usuario con ese correo electrónico.");
    }
    throw new Error(
      error.error || "No pudimos crear el usuario. Intenta nuevamente."
    );
  }

  const data = await response.json();

  if (!data || !data.email) {
    throw new Error("No se pudo crear el usuario.");
  }

  return {
    email: data.email,
    isAdmin: Boolean(data.is_admin),
  };
};

const setAdminStatus = async (
  email: string,
  isAdmin: boolean
): Promise<AdminCredential> => {
  ensureSupabaseConfigured();

  const { data, error } = await supabase.rpc("update_user_admin_status", {
    user_email: email,
    admin_status: isAdmin,
  });

  if (error) {
    if (error.message?.includes("not found")) {
      throw new Error("No encontramos al usuario para actualizar.");
    }
    if (error.code === "42883") {
      throw new Error(
        "Las funciones de administración no están configuradas. Por favor, ejecuta los scripts SQL en Supabase."
      );
    }
    throw new Error(
      error.message || "No pudimos actualizar los permisos. Intenta nuevamente."
    );
  }

  if (!data || !data.email) {
    throw new Error("No se pudo actualizar el usuario.");
  }

  return {
    email: data.email,
    isAdmin: Boolean(data.is_admin),
  };
};

const hasAdminAccess = async (email: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const credential = await findByEmail(email);
    return Boolean(credential?.isAdmin);
  } catch {
    return false;
  }
};

export const adminCredentialService = {
  findByEmail,
  list,
  createUser,
  setAdminStatus,
  hasAdminAccess,
};
