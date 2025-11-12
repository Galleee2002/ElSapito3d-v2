import type { PostgrestError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { AdminCredential } from "@/types";

interface AdminCredentialRow {
  email: string;
  is_admin: boolean;
  password_hash?: string | null;
}

const toAdminCredential = (row: AdminCredentialRow): AdminCredential => ({
  email: row.email,
  isAdmin: row.is_admin,
});

const ensureSupabaseConfigured = (): void => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase no está configurado. Verifica que las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas."
    );
  }
};

const isNotFoundError = (error: PostgrestError | null): boolean => {
  return Boolean(error?.code === "PGRST116");
};

const selectColumns = "email, is_admin";

const findByEmail = async (email: string): Promise<AdminCredential | null> => {
  ensureSupabaseConfigured();
  
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000);
    });

    const queryPromise = supabase
      .from("admin_credentials")
      .select(selectColumns)
      .eq("email", email)
      .maybeSingle();

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error && !isNotFoundError(error)) {
      console.error('Error finding admin by email:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return toAdminCredential(data as AdminCredentialRow);
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
};

const list = async (): Promise<AdminCredential[]> => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase
    .from("admin_credentials")
    .select(selectColumns)
    .order("email", { ascending: true });

  if (error) {
    if (error.code === "42501" || error.message?.includes("permission denied")) {
      throw new Error(
        "No tienes permisos para acceder a esta información. Verifica que estés autenticado correctamente."
      );
    }

    throw new Error(
      error.message || "No pudimos obtener los usuarios. Intenta nuevamente."
    );
  }

  const rows = (data ?? []) as AdminCredentialRow[];
  return rows.map(toAdminCredential);
};

interface AdminCredentialUpsertArgs {
  email: string;
  isAdmin?: boolean;
  passwordHash?: string;
}

const insertCredential = async ({
  email,
  isAdmin = false,
  passwordHash,
}: AdminCredentialUpsertArgs): Promise<AdminCredential> => {
  ensureSupabaseConfigured();
  if (!passwordHash) {
    throw new Error(
      "Se requiere una contraseña para crear un nuevo administrador."
    );
  }

  const payload: AdminCredentialRow = {
    email,
    is_admin: isAdmin,
    password_hash: passwordHash,
  };

  const { data, error } = await supabase
    .from("admin_credentials")
    .insert([payload], { defaultToNull: false })
    .select(selectColumns);

  if (error) {
    throw error;
  }

  const dataRows = (data ?? []) as AdminCredentialRow[];
  const firstRow = dataRows[0];

  if (!firstRow) {
    throw new Error("No se pudo registrar el usuario.");
  }

  return toAdminCredential(firstRow);
};

const updateCredential = async ({
  email,
  isAdmin,
  passwordHash,
}: AdminCredentialUpsertArgs): Promise<AdminCredential> => {
  ensureSupabaseConfigured();
  const payload: Partial<AdminCredentialRow> = {};

  if (typeof isAdmin === "boolean") {
    payload.is_admin = isAdmin;
  }
  if (passwordHash) {
    payload.password_hash = passwordHash;
  }

  if (Object.keys(payload).length === 0) {
    const current = await findByEmail(email);
    if (!current) {
      throw new Error("No encontramos al usuario para actualizar.");
    }
    return current;
  }

  const { data, error } = await supabase
    .from("admin_credentials")
    .update(payload)
    .eq("email", email)
    .select(selectColumns)
    .single();

  if (error) {
    throw error;
  }

  return toAdminCredential(data as AdminCredentialRow);
};

const upsert = async (
  credential: AdminCredentialUpsertArgs
): Promise<AdminCredential> => {
  const existing = await findByEmail(credential.email);

  if (existing) {
    return updateCredential(credential);
  }

  return insertCredential(credential);
};

const setAdminStatus = async (
  email: string,
  isAdmin: boolean
): Promise<AdminCredential> => {
  return upsert({ email, isAdmin });
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
  upsert,
  setAdminStatus,
  hasAdminAccess,
};
