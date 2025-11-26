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

const getUnitPriceForQuantity = (item: CartItem): number => {
  const { product, quantity } = item;

  if (!product || quantity <= 0) {
    return 0;
  }

  const rules = Array.isArray(product.bulkPricingRules)
    ? product.bulkPricingRules
        .map((rule) => {
          const minQuantity = Number(rule.minQuantity);
          const unitPrice = Number(rule.unitPrice);

          if (!Number.isInteger(minQuantity) || minQuantity <= 1) {
            return null;
          }

          if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
            return null;
          }

          return { minQuantity, unitPrice };
        })
        .filter(
          (rule): rule is { minQuantity: number; unitPrice: number } =>
            rule !== null && rule.minQuantity > 1 && rule.unitPrice > 0
        )
        .sort((a, b) => a.minQuantity - b.minQuantity)
    : [];

  if (!rules.length) {
    return product.price;
  }

  let applicableUnitPrice: number | null = null;

  for (const rule of rules) {
    if (quantity >= rule.minQuantity) {
      applicableUnitPrice = rule.unitPrice;
    } else {
      break;
    }
  }

  return applicableUnitPrice ?? product.price;
};

export const getProductUnitPriceForQuantity = (
  product: { price: number; bulkPricingRules?: Array<{ minQuantity: number; unitPrice: number }> },
  quantity: number
): number => {
  if (!product || quantity <= 0) {
    return 0;
  }

  const rules = Array.isArray(product.bulkPricingRules)
    ? product.bulkPricingRules
        .map((rule) => {
          const minQuantity = Number(rule.minQuantity);
          const unitPrice = Number(rule.unitPrice);

          if (!Number.isInteger(minQuantity) || minQuantity <= 1) {
            return null;
          }

          if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
            return null;
          }

          return { minQuantity, unitPrice };
        })
        .filter(
          (rule): rule is { minQuantity: number; unitPrice: number } =>
            rule !== null && rule.minQuantity > 1 && rule.unitPrice > 0
        )
        .sort((a, b) => a.minQuantity - b.minQuantity)
    : [];

  if (!rules.length) {
    return product.price;
  }

  let applicableUnitPrice: number | null = null;

  for (const rule of rules) {
    if (quantity >= rule.minQuantity) {
      applicableUnitPrice = rule.unitPrice;
    } else {
      break;
    }
  }

  return applicableUnitPrice ?? product.price;
};

export const getCartItemLineTotal = (item: CartItem): number => {
  const unitPrice = getUnitPriceForQuantity(item);
  const baseTotal = unitPrice * item.quantity;
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
    unit_price: getCartItemUnitPriceWithAccessories(item),
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


