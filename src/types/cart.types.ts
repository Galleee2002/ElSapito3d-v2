import { Product } from "./product.types";
import { ColorWithName, SelectedColorSection } from "./color.types";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColors: ColorWithName[];
  selectedSections?: SelectedColorSection[];
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    selectedColors?: ColorWithName[],
    selectedSections?: SelectedColorSection[]
  ) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  totalAmount: number;
}
