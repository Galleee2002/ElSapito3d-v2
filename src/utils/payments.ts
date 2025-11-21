import type { CartItem } from "@/types";

interface PaymentItemPayloadColor {
  name: string;
  code: string;
}

export interface PaymentItemPayload {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  selectedColors: PaymentItemPayloadColor[];
}

interface AddressFormShape {
  customer_address: string;
  street: string;
  city: string;
  postalCode: string;
  province: string;
}

export const mapCartItemsToPaymentItems = (items: CartItem[]): PaymentItemPayload[] => {
  return items.map((item) => ({
    id: item.product.id,
    title: item.product.name,
    quantity: item.quantity,
    unit_price: item.product.price,
    selectedColors: (item.selectedColors || []).map((color) => ({
      name: color.name,
      code: color.code,
    })),
  }));
};

export const buildCustomerAddress = (
  formData: AddressFormShape,
  deliveryMethod: string | null | undefined
): string => {
  if (deliveryMethod === "shipping") {
    return `${formData.street.trim()}, ${formData.city.trim()}, ${formData.postalCode.trim()}, ${formData.province.trim()}`;
  }

  return formData.customer_address.trim();
};


