import { Product } from "./product.types";
import { ColorWithName, SelectedColorSection } from "./color.types";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColors: ColorWithName[];
  selectedSections?: SelectedColorSection[];
  accessoryColor?: ColorWithName;
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    selectedColors?: ColorWithName[],
    selectedSections?: SelectedColorSection[],
    accessoryColor?: ColorWithName
  ) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  totalAmount: number;
}
