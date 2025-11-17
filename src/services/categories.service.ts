import { supabase } from "./supabase";
import { Category } from "@/types";
import { ensureSupabaseConfigured, handleSupabaseError } from "@/utils";

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


export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    ensureSupabaseConfigured();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      handleSupabaseError(error);
    }

    const rows = (data ?? []) as CategoryRow[];
    return rows.map(mapRowToCategory);
  },

  getById: async (id: string): Promise<Category | null> => {
    ensureSupabaseConfigured();
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
    ensureSupabaseConfigured();
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
    ensureSupabaseConfigured();
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
    ensureSupabaseConfigured();
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

