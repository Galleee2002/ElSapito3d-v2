import { useCallback } from "react";
import type { Product } from "@/types";
import { useCart } from "./useCart";
import { useToast } from "./useToast";

interface UseAddToCartResult {
  addProductToCart: (product: Product) => boolean;
}

export const useAddToCart = (): UseAddToCartResult => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const addProductToCart = useCallback(
    (product: Product) => {
      const wasAdded = addItem(product);
      if (wasAdded) {
        toast.success("Producto añadido al carrito.");
        return true;
      }
      toast.error(`No queda más stock de ${product.name}.`);
      return false;
    },
    [addItem, toast]
  );

  return { addProductToCart };
};


