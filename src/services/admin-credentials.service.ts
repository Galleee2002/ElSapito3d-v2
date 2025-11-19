import { supabase, isSupabaseConfigured } from "./supabase";
import { getAdminApiHeaders, getSupabaseUrl } from "./admin-api-client";
import { ensureSupabaseConfigured } from "@/utils";
import type { AdminCredential } from "@/types";

const list = async (): Promise<AdminCredential[]> => {
  ensureSupabaseConfigured();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Debes estar autenticado para ver los usuarios.");
  }

  const headers = await getAdminApiHeaders();
  const response = await fetch(
    `${getSupabaseUrl()}/functions/v1/manage-admin-users`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "list" }),
    }
  );

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
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    const headers = await getAdminApiHeaders();
    const response = await fetch(
      `${getSupabaseUrl()}/functions/v1/manage-admin-users`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "get_status" }),
      }
    );

    if (!response.ok) {
      const { data: { user } } = await supabase.auth.getUser();
      return {
        email: user?.email || email,
        isAdmin: Boolean(user?.user_metadata?.is_admin),
      };
    }

    const data = await response.json();

    return {
      email: data.email || email,
      isAdmin: Boolean(data.is_admin),
    };
  } catch {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return {
        email: user?.email || email,
        isAdmin: Boolean(user?.user_metadata?.is_admin),
      };
    } catch {
      return null;
    }
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

  const headers = await getAdminApiHeaders();
  const response = await fetch(
    `${getSupabaseUrl()}/functions/v1/manage-admin-users`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: "create",
        email,
        password,
        is_admin: isAdmin,
      }),
    }
  );

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

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Debes estar autenticado para actualizar permisos.");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No se pudo obtener información del usuario.");
  }

  const headers = await getAdminApiHeaders();
  const response = await fetch(
    `${getSupabaseUrl()}/functions/v1/manage-admin-users`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: "update",
        email,
        is_admin: isAdmin,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error || "No pudimos actualizar los permisos. Intenta nuevamente."
    );
  }

  const data = await response.json();

  return {
    email: data.email || email,
    isAdmin: Boolean(data.is_admin),
  };
};

const hasAdminAccess = async (email: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    // Verificar desde user_metadata (no causa recursión)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email === email) {
      return Boolean(user.user_metadata?.is_admin);
    }

    return false;
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
