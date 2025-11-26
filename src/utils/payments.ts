import type { CartItem, SelectedColorSection, PaymentMetadata } from "@/types";

interface PaymentItemPayloadColor {
  name: string;
  code: string;
}

export interface PaymentItemPayloadAccessory {
  name: string;
  color: PaymentItemPayloadColor;
  quantity: number;
  price?: number;
}

export interface PaymentItemPayload {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  selectedColors: PaymentItemPayloadColor[];
  selectedSections?: SelectedColorSection[];
  /** @deprecated Usar selectedAccessories en su lugar */
  accessoryColor?: PaymentItemPayloadColor;
  /** @deprecated Usar selectedAccessories en su lugar */
  accessoryQuantity?: number;
  selectedAccessories?: PaymentItemPayloadAccessory[];
}

interface AddressFormShape {
  customer_address: string;
  street: string;
  city: string;
  postalCode: string;
  province: string;
}

export const getCartItemAccessoriesTotal = (item: CartItem): number => {
  return (
    item.selectedAccessories?.reduce((sum, accessory) => {
      const unitPrice = accessory.price ?? 0;
      return sum + unitPrice * accessory.quantity;
    }, 0) ?? 0
  );
};

export const getCartItemLineTotal = (item: CartItem): number => {
  const baseTotal = item.product.price * item.quantity;
  const accessoriesTotal = getCartItemAccessoriesTotal(item);
  return baseTotal + accessoriesTotal;
};

export const getCartItemUnitPriceWithAccessories = (item: CartItem): number => {
  if (item.quantity <= 0) {
    return 0;
  }

  const lineTotal = getCartItemLineTotal(item);
  return lineTotal / item.quantity;
};

export const mapCartItemsToPaymentItems = (
  items: CartItem[]
): PaymentItemPayload[] => {
  return items.map((item) => ({
    id: item.product.id,
    title: item.product.name,
    quantity: item.quantity,
    unit_price: item.product.price,
    selectedColors: (item.selectedColors || []).map((color) => ({
      name: color.name,
      code: color.code,
    })),
    selectedSections: item.selectedSections && item.selectedSections.length > 0
      ? item.selectedSections.map((section) => ({
          sectionId: section.sectionId,
          sectionLabel: section.sectionLabel,
          colorId: section.colorId,
          colorName: section.colorName,
          colorCode: section.colorCode,
        }))
      : undefined,
    selectedAccessories:
      item.selectedAccessories && item.selectedAccessories.length > 0
        ? item.selectedAccessories.map((acc) => ({
            name: acc.name,
            color: {
              name: acc.color.name,
              code: acc.color.code,
            },
            quantity: acc.quantity,
            price: acc.price,
          }))
        : item.accessoryColor &&
          item.accessoryQuantity &&
          item.accessoryQuantity > 0
        ? [
            {
              name:
                item.product.accessory?.name ||
                item.product.accessories?.[0]?.name ||
                "Accesorio",
              color: {
                name: item.accessoryColor.name,
                code: item.accessoryColor.code,
              },
              quantity: item.accessoryQuantity,
              price:
                item.product.accessory?.price ||
                item.product.accessories?.[0]?.price,
            },
          ]
        : undefined,
    accessoryColor: item.accessoryColor
      ? {
          name: item.accessoryColor.name,
          code: item.accessoryColor.code,
        }
      : undefined,
    accessoryQuantity: item.accessoryQuantity && item.accessoryQuantity > 0
      ? item.accessoryQuantity
      : undefined,
  }));
};

export const buildCustomerAddress = (
  formData: AddressFormShape,
  deliveryMethod: string | null | undefined
): string => {
  if (deliveryMethod === "shipping") {
    return `${formData.street.trim()}, ${formData.city.trim()}, ${formData.postalCode.trim()}, ${formData.province.trim()}`;
  }

  return "Retiro en showroom";
};

export const getDeliveryMethodDisplay = (
  metadata: PaymentMetadata | null | undefined
): string => {
  const rawMethod = metadata?.delivery_method;

  if (!rawMethod) {
    return "N/A";
  }

  if (rawMethod === "pickup") {
    return "Retiro en Showroom";
  }

  if (rawMethod === "shipping") {
    return "Envío a Domicilio";
  }

  return String(rawMethod);
};


