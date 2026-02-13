import { supabase } from "./supabase";
import { storageService } from "./storage.service";
import {
  Product,
  ColorWithName,
  ColorSection,
  ColorMode,
  Accessory,
  BulkPricingRule,
} from "@/types";
import { ensureSupabaseConfigured, handleSupabaseError } from "@/utils";

const PRODUCTS_CHANGED_EVENT = "products-changed";

const dispatchProductsChanged = (): void => {
  window.dispatchEvent(new CustomEvent(PRODUCTS_CHANGED_EVENT));
};

interface ProductRow {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  bulk_pricing_rules: BulkPricingRule[] | null;
  image_urls: string[];
  image_alt: string | null;
  plastic_type: string | null;
  print_time: string | null;
  stock: number;
  description: string;
  available_colors: ColorWithName[];
  color_mode: ColorMode | null;
  color_sections: ColorSection[] | null;
  is_featured: boolean;
  category_id: string | null;
  model_3d_url: string | null;
  model_3d_path: string | null;
  model_3d_grid_position: number | null;
  video_url: string | null;
  video_path: string | null;
  accessory_name: string | null;
  accessories: Array<{ name: string; price?: number; originalPrice?: number } | string> | null;
  width: number | null;
  length: number | null;
  diameter: number | null;
  created_at: string;
  updated_at: string;
}

const mapRowToProduct = (
  row: ProductRow & Record<string, unknown>
): Product => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  originalPrice:
    row.original_price !== null ? Number(row.original_price) : undefined,
  bulkPricingRules:
    "bulk_pricing_rules" in row && Array.isArray(row.bulk_pricing_rules)
      ? row.bulk_pricing_rules
          .map((rule) => {
            const rawRule = rule as {
              minQuantity?: unknown;
              unitPrice?: unknown;
            };
            const minQuantity = Number(rawRule.minQuantity);
            const unitPrice = Number(rawRule.unitPrice);

            if (!Number.isInteger(minQuantity) || minQuantity <= 1) {
              return null;
            }

            if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
              return null;
            }

            return {
              minQuantity,
              unitPrice,
            };
          })
          .filter(
            (rule): rule is BulkPricingRule =>
              rule !== null && rule.minQuantity > 1 && rule.unitPrice > 0
          )
          .sort((a, b) => a.minQuantity - b.minQuantity)
      : undefined,
  image: row.image_urls,
  description: row.description,
  alt: row.image_alt ?? undefined,
  plasticType: row.plastic_type ?? undefined,
  printTime: row.print_time ?? undefined,
  availableColors: Array.isArray(row.available_colors)
    ? row.available_colors
    : [],
  colorMode:
    "color_mode" in row &&
    row.color_mode &&
    (row.color_mode === "default" ||
      row.color_mode === "sections" ||
      row.color_mode === "disabled")
      ? (row.color_mode as ColorMode)
      : "default",
  colorSections:
    "color_sections" in row && Array.isArray(row.color_sections)
      ? row.color_sections
      : undefined,
  stock: Number(row.stock),
  isFeatured: row.is_featured ?? false,
  categoryId: row.category_id ?? undefined,
  model3DUrl: row.model_3d_url ?? undefined,
  model3DPath: row.model_3d_path ?? undefined,
  model3DGridPosition: row.model_3d_grid_position ?? undefined,
  videoUrl: row.video_url ?? undefined,
  videoPath: row.video_path ?? undefined,
  accessory: undefined,
  accessories: (() => {
    if (row.accessories && Array.isArray(row.accessories) && row.accessories.length > 0) {
      return row.accessories
        .map((item): Accessory | null => {
          if (typeof item === "string") {
            return { name: item.trim() };
          }
          if (typeof item === "object" && item !== null) {
            const accessoryItem = item as { name: unknown; price?: unknown; originalPrice?: unknown };
            if ("name" in accessoryItem && typeof accessoryItem.name === "string") {
              return {
                name: accessoryItem.name.trim(),
                price: typeof accessoryItem.price === "number" ? accessoryItem.price : undefined,
                originalPrice: typeof accessoryItem.originalPrice === "number" ? accessoryItem.originalPrice : undefined,
              };
            }
          }
          return null;
        })
        .filter((acc): acc is Accessory => acc !== null && acc.name.length > 0);
    }
    if (row.accessory_name && row.accessory_name.trim().length > 0) {
      return [{ name: row.accessory_name.trim() }];
    }
    return undefined;
  })(),
  dimensions: (() => {
    const width = row.width !== null && row.width !== undefined ? Number(row.width) : undefined;
    const length = row.length !== null && row.length !== undefined ? Number(row.length) : undefined;
    const diameter = row.diameter !== null && row.diameter !== undefined ? Number(row.diameter) : undefined;
    
    if (width !== undefined || length !== undefined || diameter !== undefined) {
      return {
        width: width && width > 0 ? width : undefined,
        length: length && length > 0 ? length : undefined,
        diameter: diameter && diameter > 0 ? diameter : undefined,
      };
    }
    return undefined;
  })(),
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
  if ("originalPrice" in product) {
    row.original_price =
      product.originalPrice !== undefined && product.originalPrice !== null
        ? Number(product.originalPrice)
        : null;
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
  if ("colorMode" in product) {
    const colorMode = product.colorMode;
    if (
      colorMode === "default" ||
      colorMode === "sections" ||
      colorMode === "disabled"
    ) {
      row.color_mode = colorMode;
    } else {
      row.color_mode = "default";
    }
  }
  if ("colorSections" in product && product.colorSections !== undefined) {
    if (
      Array.isArray(product.colorSections) &&
      product.colorSections.length > 0
    ) {
      row.color_sections = product.colorSections.filter(
        (section): section is ColorSection =>
          typeof section === "object" &&
          section !== null &&
          typeof section.id === "string" &&
          typeof section.key === "string" &&
          typeof section.label === "string" &&
          Array.isArray(section.availableColorIds) &&
          section.availableColorIds.length > 0
      );
    } else {
      row.color_sections = null;
    }
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
  if ("model3DPath" in product) {
    row.model_3d_path =
      product.model3DPath && product.model3DPath.trim().length > 0
        ? product.model3DPath.trim()
        : null;
  }
  if ("model3DGridPosition" in product) {
    row.model_3d_grid_position =
      product.model3DGridPosition !== undefined &&
      product.model3DGridPosition !== null
        ? Number(product.model3DGridPosition)
        : null;
  }
  if ("videoUrl" in product) {
    row.video_url =
      product.videoUrl && product.videoUrl.trim().length > 0
        ? product.videoUrl.trim()
        : null;
  }
  if ("videoPath" in product) {
    row.video_path =
      product.videoPath && product.videoPath.trim().length > 0
        ? product.videoPath.trim()
        : null;
  }
  if ("accessories" in product && product.accessories !== undefined) {
    if (Array.isArray(product.accessories) && product.accessories.length > 0) {
      row.accessories = product.accessories
        .filter((acc): acc is { name: string; price?: number; originalPrice?: number } => 
          acc && typeof acc === "object" && "name" in acc && typeof acc.name === "string"
        )
        .map((acc) => ({
          name: acc.name.trim(),
          ...(acc.price !== undefined && acc.price > 0 ? { price: acc.price } : {}),
          ...(acc.originalPrice !== undefined && acc.originalPrice > 0 ? { originalPrice: acc.originalPrice } : {}),
        }))
        .filter((acc) => acc.name.length > 0);
      row.accessory_name = null;
    } else {
      row.accessories = null;
      row.accessory_name = null;
    }
  } else if ("accessory" in product) {
    row.accessory_name =
      product.accessory && product.accessory.name?.trim()
        ? product.accessory.name.trim()
        : null;
    row.accessories = null;
  }
  if ("dimensions" in product && product.dimensions !== undefined) {
    row.width = product.dimensions.width && product.dimensions.width > 0
      ? Number(product.dimensions.width)
      : null;
    row.length = product.dimensions.length && product.dimensions.length > 0
      ? Number(product.dimensions.length)
      : null;
    row.diameter = product.dimensions.diameter && product.dimensions.diameter > 0
      ? Number(product.dimensions.diameter)
      : null;
  }
  if ("bulkPricingRules" in product && product.bulkPricingRules !== undefined) {
    if (Array.isArray(product.bulkPricingRules) && product.bulkPricingRules.length > 0) {
      const validRules = product.bulkPricingRules
        .map((rule) => {
          const minQuantity = Number(rule.minQuantity);
          const unitPrice = Number(rule.unitPrice);

          if (!Number.isInteger(minQuantity) || minQuantity <= 1) {
            return null;
          }

          if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
            return null;
          }

          return { minQuantity, unitPrice };
        })
        .filter(
          (rule): rule is BulkPricingRule =>
            rule !== null && rule.minQuantity > 1 && rule.unitPrice > 0
        )
        .sort((a, b) => a.minQuantity - b.minQuantity);

      const deduplicatedRules: BulkPricingRule[] = [];
      validRules.forEach((rule) => {
        const exists = deduplicatedRules.some(
          (existingRule) => existingRule.minQuantity === rule.minQuantity
        );
        if (!exists) {
          deduplicatedRules.push(rule);
        }
      });

      row.bulk_pricing_rules =
        deduplicatedRules.length > 0 ? deduplicatedRules : null;
    } else {
      row.bulk_pricing_rules = null;
    }
  }

  return row;
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

    const rows = (data ?? []) as (ProductRow & Record<string, unknown>)[];
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

    const rows = (data ?? []) as (ProductRow & Record<string, unknown>)[];
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

    return mapRowToProduct(data as ProductRow & Record<string, unknown>);
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

    if (
      !row.color_mode ||
      (row.color_mode !== "default" &&
        row.color_mode !== "sections" &&
        row.color_mode !== "disabled")
    ) {
      row.color_mode = "default";
    }

    const rowToInsert = { ...row };
    if (
      "color_sections" in rowToInsert &&
      rowToInsert.color_sections === null
    ) {
      delete rowToInsert.color_sections;
    }

    const { data, error } = await supabase
      .from("products")
      .insert([rowToInsert])
      .select()
      .single();

    if (error) {
      if (error.message?.includes("color_sections")) {
        const rowWithoutColorSections = { ...rowToInsert };
        delete rowWithoutColorSections.color_sections;
        const { data: retryData, error: retryError } = await supabase
          .from("products")
          .insert([rowWithoutColorSections])
          .select()
          .single();
        if (retryError) {
          handleSupabaseError(retryError);
        }
        if (!retryData) {
          throw new Error("No se pudo crear el producto");
        }
        dispatchProductsChanged();
        return mapRowToProduct(
          retryData as ProductRow & Record<string, unknown>
        );
      }
      if (error.message?.includes("color_mode")) {
        throw new Error(
          `Error en el modo de color: ${error.message}. Asegúrate de que el constraint en Supabase permita los valores: 'default', 'sections', 'disabled'. Valor enviado: ${rowToInsert.color_mode ?? "undefined"}`
        );
      }
      handleSupabaseError(error);
    }

    if (!data) {
      throw new Error("No se pudo crear el producto");
    }

    dispatchProductsChanged();
    return mapRowToProduct(data as ProductRow & Record<string, unknown>);
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

    if (
      row.color_mode !== undefined &&
      row.color_mode !== null &&
      row.color_mode !== "default" &&
      row.color_mode !== "sections" &&
      row.color_mode !== "disabled"
    ) {
      row.color_mode = "default";
    }

    const rowToUpdate = { ...row };
    if (
      "color_sections" in rowToUpdate &&
      rowToUpdate.color_sections === null
    ) {
      delete rowToUpdate.color_sections;
    }

    const { data, error } = await supabase
      .from("products")
      .update(rowToUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.message?.includes("color_sections")) {
        const rowWithoutColorSections = { ...rowToUpdate };
        delete rowWithoutColorSections.color_sections;
        const { data: retryData, error: retryError } = await supabase
          .from("products")
          .update(rowWithoutColorSections)
          .eq("id", id)
          .select()
          .single();
        if (retryError) {
          handleSupabaseError(retryError);
        }
        if (!retryData) {
          throw new Error("No se encontró el producto para actualizar");
        }
        dispatchProductsChanged();
        return mapRowToProduct(
          retryData as ProductRow & Record<string, unknown>
        );
      }
      if (error.message?.includes("color_mode")) {
        throw new Error(
          `Error en el modo de color: ${error.message}. Asegúrate de que el constraint en Supabase permita los valores: 'default', 'sections', 'disabled'. Valor enviado: ${rowToUpdate.color_mode ?? "undefined"}`
        );
      }
      handleSupabaseError(error);
    }

    if (!data) {
      throw new Error("No se encontró el producto para actualizar");
    }

    dispatchProductsChanged();
    return mapRowToProduct(data as ProductRow & Record<string, unknown>);
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
          return (
            urlObj.hostname.includes("supabase.co") ||
            urlObj.hostname.includes("supabase")
          );
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
