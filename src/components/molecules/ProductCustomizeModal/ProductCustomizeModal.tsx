import { useMemo, useState, useEffect, useCallback } from "react";
import { Modal, Button, FilterSelect } from "@/components";
import ColorChipsRowHorizontal from "@/components/molecules/ColorChipsRowHorizontal";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useColorStore } from "@/hooks";
import type { Product, ColorWithName, ProductColor } from "@/types";
import {
  formatCurrency,
  getProductUnitPriceForQuantity,
} from "@/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  PREDEFINED_COLORS,
  normalizeColorName,
} from "@/constants";
import { toSlug } from "@/utils";

interface ProductCustomizeModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductCustomizeModal = ({
  product,
  isOpen,
  onClose,
}: ProductCustomizeModalProps) => {
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const { colors } = useColorStore();
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(
    null
  );
  const [selectedSections, setSelectedSections] = useState<Map<string, string>>(
    new Map()
  );
  const [accessorySelections, setAccessorySelections] = useState<
    Map<string, { quantity: number; colorId: string | null }>
  >(new Map());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [quantity, setQuantity] = useState<number>(1);

  const colorMode = product.colorMode ?? "default";
  const useColorSections =
    colorMode === "sections" &&
    product.colorSections &&
    product.colorSections.length > 0;

  const quantityInCart = useMemo(() => {
    return items.reduce((total, item) => {
      if (item.product.id === product.id) {
        return total + item.quantity;
      }
      return total;
    }, 0);
  }, [items, product.id]);

  const remainingStock = useMemo(
    () => Math.max(product.stock - quantityInCart, 0),
    [product.stock, quantityInCart]
  );
  const isOutOfStock = remainingStock === 0;

  const normalizedColors = useMemo<(ColorWithName & { inStock: boolean })[]>(() => {
    if (!product.availableColors || product.availableColors.length === 0) {
      return [];
    }

    if (colors.length > 0) {
      return product.availableColors
        .map((productColor) => {
          // Buscamos el color en el store (master list)
          // Prioridad: Coincidencia por Hex (más estable) -> Coincidencia por Nombre
          const matchedStoreColor = colors.find(
            (storeColor) =>
              storeColor.hex.toLowerCase() ===
                productColor.code.toLowerCase() ||
              normalizeColorName(storeColor.name) ===
                normalizeColorName(productColor.name || productColor.code)
          );

          // Si el color no existe en el store (fue eliminado), lo filtramos.
          // Pero si existe y no tiene stock, lo mantenemos para mostrarlo deshabilitado.
          if (!matchedStoreColor) {
            return null;
          }

          // Retornamos los datos actualizados del store (nombre correcto)
          // pero mantenemos la imagen específica del producto si existe
          return {
            name: matchedStoreColor.name,
            code: matchedStoreColor.hex,
            image: productColor.image,
            imageIndex: productColor.imageIndex,
            inStock: matchedStoreColor.inStock,
          };
        })
        .filter((c): c is ColorWithName & { inStock: boolean } => c !== null);
    }

    return [];
  }, [product.availableColors, colors]);

  const accessories =
    product.accessories && product.accessories.length > 0
      ? product.accessories
      : product.accessory
      ? [product.accessory]
      : [];
  const hasAccessories = accessories.length > 0;

  useEffect(() => {
    setSelectedColorIndex(null);
    setSelectedSections(new Map());
    setAccessorySelections(new Map());
    setQuantity(1);
    if (useColorSections && product.colorSections) {
      setExpandedSections(
        new Set([product.colorSections[0]?.id].filter(Boolean))
      );
    }
  }, [product.id, isOpen, useColorSections, product.colorSections]);

  const productColors: ProductColor[] = useMemo(
    () =>
      normalizedColors.map((color, index) => ({
        id: `${product.id}-color-${index}`,
        name: color.name,
        hex: color.code,
        available: color.inStock,
      })),
    [normalizedColors, product.id]
  );

  const accessoryColors: ProductColor[] = useMemo(() => {
    if (colors.length > 0) {
      return colors.map((color) => ({
        id: `accessory-${toSlug(color.name)}`,
        name: color.name,
        hex: color.hex,
        available: color.inStock,
      }));
    }

    return PREDEFINED_COLORS.map((color) => ({
      id: `accessory-${toSlug(color.name)}`,
      name: color.name,
      hex: color.code,
      available: true,
    }));
  }, [colors]);

  const getColorFromId = useCallback(
    (colorId: string): ColorWithName | null => {
      const normalizedId = colorId.startsWith("accessory-")
        ? colorId.replace("accessory-", "")
        : colorId;

      const color = colors.find(
        (storeColor) => toSlug(storeColor.name) === normalizedId
      );

      if (color) {
        return { name: color.name, code: color.hex };
      }

      const predefinedColor = PREDEFINED_COLORS.find(
        (c) => toSlug(c.name) === normalizedId
      );

      return predefinedColor
        ? { name: predefinedColor.name, code: predefinedColor.code }
        : null;
    },
    [colors]
  );

  const handleSectionColorSelect = useCallback(
    (sectionId: string, colorId: string) => {
      setSelectedSections((prev) => {
        const next = new Map(prev);
        if (next.get(sectionId) === colorId) {
          next.delete(sectionId);
        } else {
          next.set(sectionId, colorId);
        }
        return next;
      });
    },
    []
  );

  const handleAccessoryColorChange = useCallback(
    (accessoryName: string, colorId: string) => {
      setAccessorySelections((prev) => {
        const next = new Map(prev);
        const current = next.get(accessoryName) || {
          quantity: 0,
          colorId: null,
        };
        next.set(accessoryName, { ...current, colorId });
        return next;
      });
    },
    []
  );

  const handleAccessoryQuantityChange = useCallback(
    (accessoryName: string, value: string) => {
      const quantity = parseInt(value, 10);
      if (isNaN(quantity) || quantity < 0) {
        setAccessorySelections((prev) => {
          const next = new Map(prev);
          next.set(accessoryName, { quantity: 0, colorId: null });
          return next;
        });
        return;
      }
      setAccessorySelections((prev) => {
        const next = new Map(prev);
        const current = next.get(accessoryName) || {
          quantity: 0,
          colorId: null,
        };
        next.set(accessoryName, {
          quantity,
          colorId: quantity === 0 ? null : current.colorId,
        });
        return next;
      });
    },
    []
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const canAddToCart = useMemo(() => {
    let isValid = true;

    if (quantity <= 0 || quantity > remainingStock) {
      isValid = false;
    }

    if (colorMode === "disabled") {
      isValid = isValid && true;
    } else if (useColorSections) {
      if (product.colorSections && product.colorSections.length > 0) {
        const allSectionsSelected = product.colorSections.every((section) =>
          selectedSections.has(section.id)
        );
        if (!allSectionsSelected) isValid = false;
      } else {
        if (selectedSections.size === 0) isValid = false;
      }
    } else {
      if (productColors.length > 0 && selectedColorIndex === null) {
        isValid = false;
      }
    }

    accessories.forEach((accessory) => {
      const selection = accessorySelections.get(accessory.name);
      if (selection && selection.quantity > 0 && !selection.colorId) {
        isValid = false;
      }
    });

    return isValid;
  }, [
    quantity,
    remainingStock,
    useColorSections,
    selectedSections,
    product.colorSections,
    productColors.length,
    selectedColorIndex,
    accessories,
    accessorySelections,
  ]);

  const priceBreakdown = useMemo(() => {
    const productUnitPrice = getProductUnitPriceForQuantity(product, quantity);
    const basePrice = productUnitPrice;
    const accessoryItems: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      originalPrice?: number;
      total: number;
      colorName?: string;
    }> = [];

    accessories.forEach((accessory) => {
      const selection = accessorySelections.get(accessory.name);
      if (
        selection &&
        selection.quantity > 0 &&
        selection.colorId &&
        accessory.price
      ) {
        const accessoryColor = getColorFromId(selection.colorId);
        const hasDiscount = accessory.originalPrice !== undefined && 
                           accessory.originalPrice > accessory.price;
        accessoryItems.push({
          name: accessory.name,
          quantity: selection.quantity * quantity,
          unitPrice: accessory.price,
          originalPrice: hasDiscount ? accessory.originalPrice : undefined,
          total: accessory.price * selection.quantity * quantity,
          colorName: accessoryColor?.name,
        });
      }
    });

    const accessoriesTotal = accessoryItems.reduce(
      (sum, item) => sum + item.total,
      0
    );
    const baseTotal = basePrice * quantity;
    const total = baseTotal + accessoriesTotal;

    return {
      basePrice: productUnitPrice,
      baseTotal,
      accessoryItems,
      accessoriesTotal,
      total,
      hasDiscount: productUnitPrice < product.price,
    };
  }, [product, quantity, accessories, accessorySelections, getColorFromId]);

  const bulkPricingInfo = useMemo(() => {
    if (!product.bulkPricingRules || product.bulkPricingRules.length === 0) {
      return null;
    }

    const validRules = product.bulkPricingRules
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
      .sort((a, b) => a.minQuantity - b.minQuantity);

    if (validRules.length === 0) {
      return null;
    }

    return {
      rules: validRules,
      nextRule: validRules.find((rule) => quantity < rule.minQuantity) || null,
    };
  }, [product.bulkPricingRules, quantity]);

  const handleAddToCart = () => {
    if (colorMode === "disabled") {
      const selectedAccessoriesToAdd: import("@/types").SelectedAccessory[] =
        [];
      accessories.forEach((accessory) => {
        const selection = accessorySelections.get(accessory.name);
        if (selection && selection.quantity > 0 && selection.colorId) {
          const accessoryColor = getColorFromId(selection.colorId);
          if (accessoryColor) {
            selectedAccessoriesToAdd.push({
              name: accessory.name,
              color: accessoryColor,
              quantity: selection.quantity,
              price: accessory.price,
            });
          }
        }
      });

      const wasAdded = addItem(
        product,
        quantity,
        [],
        undefined,
        selectedAccessoriesToAdd.length > 0
          ? selectedAccessoriesToAdd
          : undefined
      );

      if (wasAdded) {
        const accessoryText =
          selectedAccessoriesToAdd.length > 0
            ? ` con ${selectedAccessoriesToAdd
                .map(
                  (acc) =>
                    `${acc.quantity} ${acc.name}${
                      acc.quantity > 1 ? "s" : ""
                    } (${acc.color.name})`
                )
                .join(", ")}`
            : "";
        const quantityText = quantity > 1 ? ` (${quantity} unidades)` : "";
        toast.success(
          `${product.name}${accessoryText}${quantityText} añadido al carrito.`
        );
        onClose();
      } else {
        toast.error(`No queda más stock de ${product.name}.`);
      }
      return;
    }

    if (useColorSections) {
      if (selectedSections.size === 0) {
        toast.error(
          "Por favor selecciona un color para cada parte del producto."
        );
        return;
      }

      const selectedSectionsData: import("@/types").SelectedColorSection[] = [];
      product.colorSections?.forEach((section) => {
        const selectedColorId = selectedSections.get(section.id);
        if (selectedColorId) {
          const color = getColorFromId(selectedColorId);
          if (color) {
            selectedSectionsData.push({
              sectionId: section.id,
              sectionLabel: section.label,
              colorId: selectedColorId,
              colorName: color.name,
              colorCode: color.code,
            });
          }
        }
      });

      if (selectedSectionsData.length === 0) {
        toast.error("No se pudo agregar el producto. Intenta nuevamente.");
        return;
      }

      const colorsToAdd: ColorWithName[] = selectedSectionsData.map((s) => ({
        name: s.colorName,
        code: s.colorCode,
      }));

      const selectedAccessoriesToAdd: import("@/types").SelectedAccessory[] =
        [];
      accessories.forEach((accessory) => {
        const selection = accessorySelections.get(accessory.name);
        if (selection && selection.quantity > 0 && selection.colorId) {
          const accessoryColor = getColorFromId(selection.colorId);
          if (accessoryColor) {
            selectedAccessoriesToAdd.push({
              name: accessory.name,
              color: accessoryColor,
              quantity: selection.quantity,
              price: accessory.price,
            });
          }
        }
      });

      const wasAdded = addItem(
        product,
        quantity,
        colorsToAdd,
        selectedSectionsData,
        selectedAccessoriesToAdd.length > 0
          ? selectedAccessoriesToAdd
          : undefined
      );

      if (wasAdded) {
        const sectionLabels = selectedSectionsData
          .map((s) => `${s.sectionLabel} (${s.colorName})`)
          .join(", ");
        const accessoryText =
          selectedAccessoriesToAdd.length > 0
            ? ` con ${selectedAccessoriesToAdd
                .map(
                  (acc) =>
                    `${acc.quantity} ${acc.name}${
                      acc.quantity > 1 ? "s" : ""
                    } (${acc.color.name})`
                )
                .join(", ")}`
            : "";
        const quantityText = quantity > 1 ? ` (${quantity} unidades)` : "";
        toast.success(
          `${product.name} - ${sectionLabels}${accessoryText}${quantityText} añadido al carrito.`
        );
        onClose();
      } else {
        toast.error(`No queda más stock de ${product.name}.`);
      }
    } else {
      if (productColors.length === 0) {
        const selectedAccessoriesToAdd: import("@/types").SelectedAccessory[] =
          [];
        accessories.forEach((accessory) => {
          const selection = accessorySelections.get(accessory.name);
          if (selection && selection.quantity > 0 && selection.colorId) {
            const accessoryColor = getColorFromId(selection.colorId);
            if (accessoryColor) {
              selectedAccessoriesToAdd.push({
                name: accessory.name,
                color: accessoryColor,
                quantity: selection.quantity,
                price: accessory.price,
              });
            }
          }
        });

        const wasAdded = addItem(
          product,
          quantity,
          [],
          undefined,
          selectedAccessoriesToAdd.length > 0
            ? selectedAccessoriesToAdd
            : undefined
        );

        if (wasAdded) {
          const accessoryText =
            selectedAccessoriesToAdd.length > 0
              ? ` con ${selectedAccessoriesToAdd
                  .map(
                    (acc) =>
                      `${acc.quantity} ${acc.name}${
                        acc.quantity > 1 ? "s" : ""
                      } (${acc.color.name})`
                  )
                  .join(", ")}`
              : "";
          const quantityText = quantity > 1 ? ` (${quantity} unidades)` : "";
          toast.success(
            `${product.name}${accessoryText}${quantityText} añadido al carrito.`
          );
          onClose();
        } else {
          toast.error(`No queda más stock de ${product.name}.`);
        }
        return;
      }

      if (selectedColorIndex === null) {
        toast.error("Por favor selecciona un color.");
        return;
      }

      const selectedColor = normalizedColors[selectedColorIndex];

      if (!selectedColor) {
        toast.error("No se pudo agregar el producto. Intenta nuevamente.");
        return;
      }

      if (!selectedColor.inStock) {
        toast.error("El color seleccionado no tiene stock.");
        return;
      }

      const selectedAccessoriesToAdd: import("@/types").SelectedAccessory[] =
        [];
      accessories.forEach((accessory) => {
        const selection = accessorySelections.get(accessory.name);
        if (selection && selection.quantity > 0 && selection.colorId) {
          const accessoryColor = getColorFromId(selection.colorId);
          if (accessoryColor) {
            selectedAccessoriesToAdd.push({
              name: accessory.name,
              color: accessoryColor,
              quantity: selection.quantity,
              price: accessory.price,
            });
          }
        }
      });

      const wasAdded = addItem(
        product,
        quantity,
        [selectedColor],
        undefined,
        selectedAccessoriesToAdd.length > 0
          ? selectedAccessoriesToAdd
          : undefined
      );

      if (wasAdded) {
        const accessoryText =
          selectedAccessoriesToAdd.length > 0
            ? ` con ${selectedAccessoriesToAdd
                .map(
                  (acc) =>
                    `${acc.quantity} ${acc.name}${
                      acc.quantity > 1 ? "s" : ""
                    } (${acc.color.name})`
                )
                .join(", ")}`
            : "";
        const quantityText = quantity > 1 ? ` (${quantity} unidades)` : "";
        toast.success(
          `${product.name} (${selectedColor.name})${accessoryText}${quantityText} añadido al carrito.`
        );
        onClose();
      } else {
        toast.error(`No queda más stock de ${product.name}.`);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="customize-title"
      maxWidth="xl"
    >
      <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6">
        <div className="flex justify-between items-center shrink-0 mb-2">
          <h2
            id="customize-title"
            className="text-xl sm:text-2xl font-bold text-border-base"
            style={{ fontFamily: "var(--font-baloo)" }}
          >
            Personalizar: {product.name}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-toad-eyes bg-white text-toad-eyes transition-all cursor-pointer hover:bg-toad-eyes hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-toad-eyes"
            aria-label="Cerrar modal"
          >
            <span className="text-xl font-bold leading-none">×</span>
          </button>
        </div>

        <div className="flex flex-col space-y-4">
          {colorMode !== "disabled" && !useColorSections && productColors.length > 0 && (
            <div className="space-y-3 p-4 bg-white rounded-xl border border-border-base/20">
              <h3
                className="text-base font-semibold text-border-base"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Color del producto
              </h3>
              <ColorChipsRowHorizontal
                colors={productColors}
                selectedColorId={
                  selectedColorIndex !== null
                    ? productColors[selectedColorIndex]?.id
                    : undefined
                }
                onChange={(colorId) => {
                  const colorIndex = productColors.findIndex(
                    (c) => c.id === colorId
                  );
                  if (colorIndex === -1) return;

                  setSelectedColorIndex(
                    selectedColorIndex === colorIndex ? null : colorIndex
                  );
                }}
                multiple={false}
              />
            </div>
          )}

          {useColorSections && product.colorSections && (
            <div className="space-y-2">
              {product.colorSections.map((section) => {
                const isExpanded = expandedSections.has(section.id);
                const sectionColors: ProductColor[] = section.availableColorIds
                  .map((colorId) => {
                    const color = getColorFromId(colorId);
                    if (!color) return null;

                    // Verificar disponibilidad
                    let isAvailable = true;
                    if (colors.length > 0) {
                      const storeColor = colors.find(
                        (store) =>
                          normalizeColorName(store.name) ===
                          normalizeColorName(color.name)
                      );
                      if (storeColor) {
                        isAvailable = storeColor.inStock;
                      }
                    }

                    return {
                      id: colorId,
                      name: color.name,
                      hex: color.code,
                      available: isAvailable,
                    } as ProductColor;
                  })
                  .filter((c) => c !== null) as ProductColor[];

                const selectedColorId = selectedSections.get(section.id);

                return (
                  <div
                    key={section.id}
                    className="bg-white rounded-xl border border-border-base/20 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-border-base/5 transition-colors"
                  >
                    <h3
                      className="text-base font-semibold text-border-base text-left"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {section.label}
                        {selectedColorId && (
                          <span className="ml-2 text-sm font-normal text-border-base/70">
                            (
                            {
                              sectionColors.find(
                                (c) => c.id === selectedColorId
                              )?.name
                            }
                            )
                          </span>
                        )}
                      </h3>
                      {isExpanded ? (
                        <ChevronUp
                          size={20}
                          className="text-border-base"
                        />
                      ) : (
                        <ChevronDown
                          size={20}
                          className="text-border-base"
                        />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <ColorChipsRowHorizontal
                          colors={sectionColors}
                          selectedColorId={selectedColorId}
                          onChange={(colorId) =>
                            handleSectionColorSelect(section.id, colorId)
                          }
                          multiple={false}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {remainingStock > 0 && (
            <div className="space-y-3 p-4 bg-white rounded-xl border border-border-base/20">
              <h3
                className="text-base font-semibold text-border-base"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Cantidad del producto
              </h3>
              <FilterSelect
                label="Cantidad"
                value={quantity.toString()}
                options={Array.from(
                  { length: Math.min(remainingStock, 20) },
                  (_, i) => ({
                    value: (i + 1).toString(),
                    label: (i + 1).toString(),
                  })
                )}
                onChange={(value) => {
                  const newQuantity = parseInt(value, 10);
                  if (
                    !isNaN(newQuantity) &&
                    newQuantity > 0 &&
                    newQuantity <= remainingStock
                  ) {
                    setQuantity(newQuantity);
                  }
                }}
                placeholder="Selecciona cantidad"
              />
              {quantity > 1 && (
                <p
                  className="text-xs text-border-base/70"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Agregarás {quantity} unidades al carrito
                </p>
              )}
            </div>
          )}

          {hasAccessories && (
            <div className="space-y-4">
              {accessories.map((accessory) => {
                const selection = accessorySelections.get(accessory.name) || {
                  quantity: 0,
                  colorId: null,
                };
                return (
                  <div
                    key={accessory.name}
                    className="space-y-3 p-4 bg-white rounded-xl border border-border-base/20"
                  >
                    <h3
                      className="text-base font-semibold text-border-base"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      Accesorio: {accessory.name}
                    </h3>
                    <FilterSelect
                      label="Cantidad"
                      value={selection.quantity.toString()}
                      options={[
                        { value: "0", label: "Ninguno" },
                        ...Array.from({ length: 10 }, (_, i) => ({
                          value: (i + 1).toString(),
                          label: (i + 1).toString(),
                        })),
                      ]}
                      onChange={(value) =>
                        handleAccessoryQuantityChange(accessory.name, value)
                      }
                      placeholder="Selecciona cantidad"
                    />
                    {selection.quantity > 0 && (
                      <div className="space-y-2">
                        <h4
                          className="text-sm font-semibold text-border-base"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          Color del accesorio
                        </h4>
                        <ColorChipsRowHorizontal
                          colors={accessoryColors}
                          selectedColorId={selection.colorId || undefined}
                          onChange={(colorId) =>
                            handleAccessoryColorChange(accessory.name, colorId)
                          }
                          multiple={false}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-bouncy-lemon/10 to-frog-green/10 rounded-xl border-2 border-frog-green/30 p-4 sm:p-5 space-y-3">
          <h3
            className="text-base sm:text-lg font-semibold text-border-base"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Resumen de precio
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm sm:text-base">
              <div className="flex flex-col">
                <span
                  className="text-border-base/80 font-medium"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {product.name} {quantity > 1 && `(${quantity} unidades)`}
                </span>
                <span
                  className="text-xs text-border-base/60"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {formatCurrency(priceBreakdown.basePrice)} c/u
                  {priceBreakdown.hasDiscount && (
                    <span className="ml-2 line-through">
                      {formatCurrency(product.price)} c/u
                    </span>
                  )}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className="font-semibold text-border-base"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {formatCurrency(priceBreakdown.baseTotal)}
                </span>
                {priceBreakdown.hasDiscount && (
                  <span className="text-xs text-green-600 font-medium">
                    Ahorro:{" "}
                    {formatCurrency(
                      (product.price - priceBreakdown.basePrice) * quantity
                    )}
                  </span>
                )}
              </div>
            </div>
            {priceBreakdown.accessoryItems.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex justify-between items-center text-sm sm:text-base pl-4 border-l-2 border-frog-green/40"
              >
                <div className="flex flex-col">
                  <span
                    className="text-border-base/80 font-medium"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {item.quantity}x {item.name}
                    {item.colorName && (
                      <span className="text-border-base/60 ml-1">
                        ({item.colorName})
                      </span>
                    )}
                  </span>
                  <span
                    className="text-xs text-border-base/60"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {formatCurrency(item.unitPrice)} c/u
                    {item.originalPrice && item.originalPrice > item.unitPrice && (
                      <span className="ml-2 line-through">
                        {formatCurrency(item.originalPrice)} c/u
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className="font-semibold text-frog-green"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    +{formatCurrency(item.total)}
                  </span>
                  {item.originalPrice && item.originalPrice > item.unitPrice && (
                    <span className="text-xs text-green-600 font-medium">
                      Ahorro:{" "}
                      {formatCurrency(
                        (item.originalPrice - item.unitPrice) * item.quantity
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {priceBreakdown.accessoryItems.length === 0 && hasAccessories && (
              <div
                className="text-sm text-border-base/60 italic pl-4"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Selecciona cantidad y color para ver el precio
              </div>
            )}
            {bulkPricingInfo?.nextRule && quantity < bulkPricingInfo.nextRule.minQuantity && (
              <div
                className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                <p className="text-xs text-green-800 font-medium">
                  💡 Descuento por cantidad: Llevando{" "}
                  {bulkPricingInfo.nextRule.minQuantity} o más unidades, cada una sale{" "}
                  <span className="font-bold">
                    {formatCurrency(bulkPricingInfo.nextRule.unitPrice)}
                  </span>{" "}
                  (en lugar de {formatCurrency(product.price)})
                </p>
              </div>
            )}
            {priceBreakdown.hasDiscount && (
              <div
                className="mt-2 p-2 bg-green-100 border border-green-300 rounded-lg"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                <p className="text-xs text-green-900 font-semibold">
                  ✓ Descuento por cantidad aplicado
                </p>
              </div>
            )}
          </div>
          <div className="pt-2 border-t-2 border-border-base/20">
            <div className="flex justify-between items-center">
              <span
                className="text-base sm:text-lg font-bold text-border-base"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Total
              </span>
              <span
                className="text-xl sm:text-2xl font-bold text-toad-eyes"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {formatCurrency(priceBreakdown.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-border-base/20">
          <Button
            onClick={handleAddToCart}
            variant="primary"
            className="flex-1 !px-4 !py-2 !text-base hover:bg-frog-green hover:border-frog-green hover:text-contrast-base"
            disabled={!canAddToCart || isOutOfStock}
          >
            {canAddToCart
              ? `Agregar ${quantity} unidad${
                  quantity === 1 ? "" : "es"
                } al Carrito`
              : "Selecciona un color"}
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1 !px-4 !py-2 !text-base hover:bg-toad-eyes hover:border-toad-eyes hover:text-white"
          >
            Cancelar
          </Button>
        </div>

        <p
          className="text-xs text-border-base/70 text-center"
          style={{ fontFamily: "var(--font-nunito)" }}
          aria-live="polite"
        >
          {isOutOfStock
            ? "Este producto no tiene stock disponible actualmente."
            : `Stock disponible: ${remainingStock} unidad${
                remainingStock === 1 ? "" : "es"
              }`}
        </p>
      </div>
    </Modal>
  );
};

export default ProductCustomizeModal;
