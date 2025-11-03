import { useMemo } from "react";
import type { Product } from "@/types";
import { ALL_PRODUCTS, FEATURED_PRODUCTS } from "@/constants";

export const useProductSearch = (query: string, maxResults: number = 5) => {
  const allProducts = useMemo(() => [...ALL_PRODUCTS, ...FEATURED_PRODUCTS], []);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchQuery = query.toLowerCase().trim();
    const filtered = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        ("category" in product && product.category.toLowerCase().includes(searchQuery))
    );

    return filtered.slice(0, maxResults);
  }, [query, maxResults, allProducts]);

  return results;
};

