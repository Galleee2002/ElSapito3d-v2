import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CartContextValue, CartItem, Product } from "@/types";

const CART_STORAGE_KEY = "elsa_cart_items_v1";

const CartContext = createContext<CartContextValue | undefined>(undefined);

const sanitizeStock = (stock: unknown): number => {
  const numericValue = Number(stock);
  if (Number.isNaN(numericValue) || numericValue < 0) {
    return 0;
  }
  return Math.floor(numericValue);
};

const clampQuantity = (quantity: number, stock: number): number => {
  if (stock === 0) {
    return 0;
  }
  return Math.max(0, Math.min(quantity, stock));
};

const sanitizeCartItems = (items: CartItem[]): CartItem[] =>
  items
    .map((item) => {
      const stock = sanitizeStock(item.product?.stock);
      const safeQuantity = clampQuantity(item.quantity, stock);
      return {
        product: { ...item.product, stock },
        quantity: safeQuantity,
      };
    })
    .filter(
      (item) =>
        item.quantity > 0 &&
        item.product &&
        typeof item.product.id === "string" &&
        item.product.stock > 0
    );

const loadInitialItems = (): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue) as CartItem[];
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return sanitizeCartItems(parsedValue);
  } catch {
    return [];
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const isFirstRender = useRef(true);
  const [items, setItems] = useState<CartItem[]>(() => loadInitialItems());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    if (quantity <= 0) {
      return false;
    }

    const normalizedStock = sanitizeStock(product.stock);
    if (normalizedStock === 0) {
      return false;
    }

    let didAdd = false;

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex === -1) {
        if (quantity > normalizedStock) {
          return prevItems;
        }
        didAdd = true;
        return [
          ...prevItems,
          { product: { ...product, stock: normalizedStock }, quantity },
        ];
      }

      const updatedItems = [...prevItems];
      const currentItem = updatedItems[existingItemIndex];
      const nextQuantity = currentItem.quantity + quantity;

      if (nextQuantity > normalizedStock) {
        return prevItems;
      }

      didAdd = true;
      updatedItems[existingItemIndex] = {
        product: { ...product, stock: normalizedStock },
        quantity: nextQuantity,
      };
      return updatedItems;
    });

    return didAdd;
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prevItems) =>
        prevItems.filter((item) => item.product.id !== productId)
      );
      return true;
    }

    let wasUpdated = false;

    setItems((prevItems) => {
      const targetIndex = prevItems.findIndex(
        (item) => item.product.id === productId
      );

      if (targetIndex === -1) {
        return prevItems;
      }

      const targetItem = prevItems[targetIndex];
      const normalizedStock = sanitizeStock(targetItem.product.stock);
      if (normalizedStock === 0) {
        return prevItems;
      }

      const clampedQuantity = clampQuantity(quantity, normalizedStock);
      if (clampedQuantity === targetItem.quantity) {
        return prevItems;
      }

      wasUpdated = true;
      const updatedItems = [...prevItems];
      updatedItems[targetIndex] = {
        product: { ...targetItem.product, stock: normalizedStock },
        quantity: clampedQuantity,
      };
      return updatedItems;
    });

    return wasUpdated;
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = items.find((cartItem) => cartItem.product.id === productId);
      return item?.quantity ?? 0;
    },
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (amount, item) => amount + item.product.price * item.quantity,
        0
      ),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      totalItems,
      totalAmount,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      totalItems,
      totalAmount,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe utilizarse dentro de un CartProvider");
  }
  return context;
};
