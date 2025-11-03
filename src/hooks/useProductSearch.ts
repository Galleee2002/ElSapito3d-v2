import { useMemo } from "react";
import { ALL_PRODUCTS, FEATURED_PRODUCTS } from "@/constants";
import { useDbProducts } from "./useDbProducts";
import type { Product } from "@/types";

export const useProductSearch = (query: string, maxResults: number = 5) => {
  const { dbProducts } = useDbProducts();

  const allProducts = useMemo(
    () => [...ALL_PRODUCTS, ...FEATURED_PRODUCTS, ...dbProducts],
    [dbProducts]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchQuery = query.toLowerCase().trim();
    const filtered = allProducts.filter((product: Product) => {
      const matchesName = product.name.toLowerCase().includes(searchQuery);
      const matchesDescription = product.description.toLowerCase().includes(searchQuery);
      const matchesCategory = product.category
        ? product.category.toLowerCase().includes(searchQuery)
        : false;
      
      return matchesName || matchesDescription || matchesCategory;
    });

    return filtered.slice(0, maxResults);
  }, [query, maxResults, allProducts]);

  return results;
};

