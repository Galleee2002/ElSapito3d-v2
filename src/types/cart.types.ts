import { Product } from "./product.types";
import { ColorWithName, SelectedColorSection } from "./color.types";

export interface SelectedAccessory {
  name: string;
  color: ColorWithName;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColors: ColorWithName[];
  selectedSections?: SelectedColorSection[];
  /** @deprecated Usar selectedAccessories en su lugar */
  accessoryColor?: ColorWithName;
  /** @deprecated Usar selectedAccessories en su lugar */
  accessoryQuantity?: number;
  selectedAccessories?: SelectedAccessory[];
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    selectedColors?: ColorWithName[],
    selectedSections?: SelectedColorSection[],
    selectedAccessories?: SelectedAccessory[]
  ) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  totalAmount: number;
}
