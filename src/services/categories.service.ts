import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { Category } from "@/types";

const CATEGORIES_CHANGED_EVENT = "categories-changed";

const dispatchCategoriesChanged = (): void => {
  window.dispatchEvent(new CustomEvent(CATEGORIES_CHANGED_EVENT));
};

interface CategoryRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const mapRowToCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const handleSupabaseError = (error: PostgrestError | null): never => {
  if (!error) {
    throw new Error("Error desconocido al realizar la operación");
  }

  console.error("Error de Supabase:", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });

  const message =
    error.message || "No pudimos completar la operación. Intenta nuevamente.";

  if (error.code === "PGRST116") {
    throw new Error("No se encontró el recurso solicitado");
  }

  if (error.code === "42501" || error.message?.includes("permission denied")) {
    throw new Error(
      "No tienes permisos para realizar esta acción. Verifica que:\n" +
        "1. Estés autenticado correctamente\n" +
        "2. Las políticas RLS en Supabase permitan el acceso a la tabla categories"
    );
  }

  throw new Error(message);
};

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error al obtener categorías:", error);
      handleSupabaseError(error);
    }

    const rows = (data ?? []) as CategoryRow[];
    return rows.map(mapRowToCategory);
  },

  getById: async (id: string): Promise<Category | null> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error);
    }

    if (!data) {
      return null;
    }

    return mapRowToCategory(data as CategoryRow);
  },

  add: async (name: string): Promise<Category> => {
    if (!name.trim()) {
      throw new Error("El nombre de la categoría es requerido");
    }

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: name.trim() }])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    if (!data) {
      throw new Error("No se pudo crear la categoría");
    }

    dispatchCategoriesChanged();
    return mapRowToCategory(data as CategoryRow);
  },

  update: async (id: string, name: string): Promise<Category> => {
    if (!name.trim()) {
      throw new Error("El nombre de la categoría es requerido");
    }

    const { data, error } = await supabase
      .from("categories")
      .update({ name: name.trim() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    if (!data) {
      throw new Error("No se encontró la categoría para actualizar");
    }

    dispatchCategoriesChanged();
    return mapRowToCategory(data as CategoryRow);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      handleSupabaseError(error);
    }

    dispatchCategoriesChanged();
    return true;
  },

  onCategoriesChanged: (callback: () => void): (() => void) => {
    const handler = () => callback();
    window.addEventListener(CATEGORIES_CHANGED_EVENT, handler);
    return () => window.removeEventListener(CATEGORIES_CHANGED_EVENT, handler);
  },
};

