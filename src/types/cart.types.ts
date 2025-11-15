import { Product } from "./product.types";
import { ColorWithName } from "./color.types";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: ColorWithName;
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedColor?: ColorWithName) => boolean;
  removeItem: (productId: string, selectedColor?: ColorWithName) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: ColorWithName) => boolean;
  clearCart: () => void;
  getItemQuantity: (productId: string, selectedColor?: ColorWithName) => number;
  totalItems: number;
  totalAmount: number;
}
