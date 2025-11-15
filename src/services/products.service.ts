import type { PostgrestError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "./supabase";
import { storageService } from "./storage.service";
import { Product, ColorWithName } from "@/types";

const PRODUCTS_CHANGED_EVENT = "products-changed";

const dispatchProductsChanged = (): void => {
  window.dispatchEvent(new CustomEvent(PRODUCTS_CHANGED_EVENT));
};

const ensureSupabaseConfigured = (): void => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase no está configurado. Verifica que las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas."
    );
  }
};

interface ProductRow {
  id: string;
  name: string;
  price: number;
  image_urls: string[];
  image_alt: string | null;
  plastic_type: string | null;
  print_time: string | null;
  stock: number;
  description: string;
  available_colors: ColorWithName[];
  is_featured: boolean;
  category_id: string | null;
  model_3d_url: string | null;
  created_at: string;
  updated_at: string;
}

const mapRowToProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  image: row.image_urls,
  description: row.description,
  alt: row.image_alt ?? undefined,
  plasticType: row.plastic_type ?? undefined,
  printTime: row.print_time ?? undefined,
  availableColors: Array.isArray(row.available_colors)
    ? row.available_colors
    : [],
  stock: Number(row.stock),
  isFeatured: row.is_featured ?? false,
  categoryId: row.category_id ?? undefined,
  model3DUrl: row.model_3d_url ?? undefined,
});

const mapProductToRow = (
  product: Omit<Product, "id"> | Partial<Product>
): Partial<ProductRow> => {
  const row: Partial<ProductRow> = {};

  if ("name" in product && product.name !== undefined) {
    row.name = product.name.trim();
  }
  if ("price" in product && product.price !== undefined) {
    row.price = Number(product.price);
  }
  if ("image" in product && product.image !== undefined) {
    row.image_urls = Array.isArray(product.image)
      ? product.image.filter(
          (url): url is string =>
            typeof url === "string" && url.trim().length > 0
        )
      : [];
  }
  if ("alt" in product) {
    row.image_alt = product.alt?.trim() ?? null;
  }
  if ("plasticType" in product) {
    row.plastic_type = product.plasticType?.trim() ?? null;
  }
  if ("printTime" in product) {
    row.print_time = product.printTime?.trim() ?? null;
  }
  if ("stock" in product && product.stock !== undefined) {
    row.stock = Math.floor(Number(product.stock));
  }
  if ("description" in product && product.description !== undefined) {
    row.description = product.description.trim();
  }
  if ("availableColors" in product && product.availableColors !== undefined) {
    row.available_colors = Array.isArray(product.availableColors)
      ? product.availableColors.filter(
          (color): color is ColorWithName =>
            typeof color === "object" &&
            color !== null &&
            "code" in color &&
            "name" in color &&
            typeof color.code === "string" &&
            typeof color.name === "string"
        )
      : [];
  }
  if ("isFeatured" in product && product.isFeatured !== undefined) {
    row.is_featured = Boolean(product.isFeatured);
  }
  if ("categoryId" in product) {
    row.category_id = product.categoryId?.trim() || null;
  }
  if ("model3DUrl" in product) {
    row.model_3d_url =
      product.model3DUrl && product.model3DUrl.trim().length > 0
        ? product.model3DUrl.trim()
        : null;
  }

  return row;
};

const handleSupabaseError = (error: PostgrestError | null): never => {
  if (!error) {
    throw new Error("Error desconocido al realizar la operación");
  }

  const message =
    error.message || "No pudimos completar la operación. Intenta nuevamente.";

  if (error.code === "PGRST116") {
    throw new Error("No se encontró el recurso solicitado");
  }

  if (error.code === "42501" || error.message?.includes("permission denied")) {
    throw new Error(
      "No tienes permisos para realizar esta acción. Verifica que estés autenticado correctamente."
    );
  }

  throw new Error(message);
};

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    ensureSupabaseConfigured();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    const rows = (data ?? []) as ProductRow[];
    return rows.map(mapRowToProduct);
  },

  getFeatured: async (): Promise<Product[]> => {
    ensureSupabaseConfigured();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    const rows = (data ?? []) as ProductRow[];
    return rows.map(mapRowToProduct);
  },

  getById: async (id: string): Promise<Product | null> => {
    ensureSupabaseConfigured();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error);
    }

    if (!data) {
      return null;
    }

    return mapRowToProduct(data as ProductRow);
  },

  add: async (product: Omit<Product, "id">): Promise<Product> => {
    ensureSupabaseConfigured();
    const row = mapProductToRow(product);

    if (!row.name || !row.price || !row.image_urls || !row.description) {
      throw new Error(
        "El producto debe tener nombre, precio, imágenes y descripción"
      );
    }

    if (!Array.isArray(row.image_urls) || row.image_urls.length === 0) {
      throw new Error("El producto debe tener al menos una imagen");
    }

    if (!Array.isArray(row.available_colors)) {
      row.available_colors = [];
    }

    if (typeof row.stock !== "number" || row.stock < 0) {
      row.stock = 0;
    }

    const { data, error } = await supabase
      .from("products")
      .insert([row])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    if (!data) {
      throw new Error("No se pudo crear el producto");
    }

    dispatchProductsChanged();
    return mapRowToProduct(data as ProductRow);
  },

  update: async (
    id: string,
    updates: Partial<Omit<Product, "id">>
  ): Promise<Product> => {
    ensureSupabaseConfigured();
    const row = mapProductToRow(updates);

    if (
      row.image_urls &&
      (!Array.isArray(row.image_urls) || row.image_urls.length === 0)
    ) {
      throw new Error("El producto debe tener al menos una imagen");
    }

    if (
      row.stock !== undefined &&
      (typeof row.stock !== "number" || row.stock < 0)
    ) {
      row.stock = 0;
    }

    const { data, error } = await supabase
      .from("products")
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    if (!data) {
      throw new Error("No se encontró el producto para actualizar");
    }

    dispatchProductsChanged();
    return mapRowToProduct(data as ProductRow);
  },

  delete: async (id: string): Promise<boolean> => {
    ensureSupabaseConfigured();
    const { data: productData, error: fetchError } = await supabase
      .from("products")
      .select("image_urls")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (productData && Array.isArray(productData.image_urls)) {
      const hasSupabaseImages = productData.image_urls.some((url: string) => {
        try {
          const urlObj = new URL(url);
          return urlObj.hostname.includes("supabase.co") || urlObj.hostname.includes("supabase");
        } catch {
          return false;
        }
      });

      if (hasSupabaseImages) {
        await storageService.deleteProductImages(id);
      }
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      handleSupabaseError(error);
    }

    dispatchProductsChanged();
    return true;
  },

  onProductsChanged: (callback: () => void): (() => void) => {
    const handler = () => callback();
    window.addEventListener(PRODUCTS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(PRODUCTS_CHANGED_EVENT, handler);
  },
};
