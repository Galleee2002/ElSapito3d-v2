import { useState, useEffect } from "react";
import { modelsService } from "@/services";
import { modelsToProducts } from "@/utils";
import type { Product } from "@/types";

interface UseDbProductsOptions {
  limit?: number;
  onError?: (error: unknown) => void;
}

export const useDbProducts = (options: UseDbProductsOptions = {}) => {
  const { limit, onError } = options;
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const models = await modelsService.getPublic();
        const convertedProducts = modelsToProducts(models);
        setDbProducts(limit ? convertedProducts.slice(0, limit) : convertedProducts);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Error desconocido");
        setError(error);
        onError?.(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [limit, onError]);

  return { dbProducts, isLoading, error };
};

