import { useMemo, useState, useEffect } from "react";
import { ALL_PRODUCTS, FEATURED_PRODUCTS } from "@/constants";
import { modelsService } from "@/services";
import { modelsToProducts } from "@/utils";
import type { Product } from "@/types";

type ProductWithCategory = Product & { category?: string };

export const useProductSearch = (query: string, maxResults: number = 5) => {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const models = await modelsService.getPublic();
        const convertedProducts = modelsToProducts(models);
        setDbProducts(convertedProducts);
      } catch (error) {
        console.error("Error al cargar productos para búsqueda:", error);
      }
    };
    loadProducts();
  }, []);

  const allProducts = useMemo(
    () => [...ALL_PRODUCTS, ...FEATURED_PRODUCTS, ...dbProducts] as ProductWithCategory[],
    [dbProducts]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchQuery = query.toLowerCase().trim();
    const filtered = allProducts.filter((product) => {
      const matchesName = product.name.toLowerCase().includes(searchQuery);
      const matchesDescription = product.description.toLowerCase().includes(searchQuery);
      const matchesCategory = product.category?.toLowerCase().includes(searchQuery) ?? false;
      
      return matchesName || matchesDescription || matchesCategory;
    });

    return filtered.slice(0, maxResults);
  }, [query, maxResults, allProducts]);

  return results;
};

