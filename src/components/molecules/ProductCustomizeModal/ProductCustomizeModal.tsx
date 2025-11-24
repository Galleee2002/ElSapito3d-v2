import { useMemo, useState, useEffect, useCallback } from "react";
import { Modal, Button, FilterSelect } from "@/components";
import ColorChipsRowHorizontal from "@/components/molecules/ColorChipsRowHorizontal";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import type {
  Product,
  ColorWithName,
  ProductColor,
} from "@/types";
import { toTitleCase } from "@/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  PREDEFINED_COLORS,
  getColorByCode,
  getColorByName,
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
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [selectedSections, setSelectedSections] = useState<Map<string, string>>(new Map());
  const [selectedAccessoryColor, setSelectedAccessoryColor] = useState<string | null>(null);
  const [accessoryQuantity, setAccessoryQuantity] = useState<number>(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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

  const normalizedColors = useMemo<ColorWithName[]>(() => {
    const mapped =
      product.availableColors?.map((color) => {
        const matchedColor =
          getColorByName(color.name) ?? getColorByCode(color.code);

        return {
          ...color,
          code: matchedColor?.code ?? color.code,
          name: matchedColor?.name ?? toTitleCase(color.name || color.code),
        };
      }) ?? [];

    const existingNames = new Set(
      mapped.map((color) => normalizeColorName(color.name))
    );

    PREDEFINED_COLORS.forEach((predefined) => {
      const normalizedName = normalizeColorName(predefined.name);
      if (!existingNames.has(normalizedName)) {
        mapped.push({
          name: predefined.name,
          code: predefined.code,
        });
        existingNames.add(normalizedName);
      }
    });

    return mapped;
  }, [product.availableColors]);

  const hasAccessory = !!product.accessory;

  useEffect(() => {
    setSelectedColorIndex(null);
    setSelectedSections(new Map());
    setSelectedAccessoryColor(null);
    setAccessoryQuantity(0);
    if (useColorSections && product.colorSections) {
      setExpandedSections(new Set([product.colorSections[0]?.id].filter(Boolean)));
    }
  }, [product.id, isOpen, useColorSections, product.colorSections]);

  const productColors: ProductColor[] = useMemo(
    () =>
      normalizedColors.map((color, index) => ({
        id: `${product.id}-color-${index}`,
        name: color.name,
        hex: color.code,
        available: true,
      })),
    [normalizedColors, product.id]
  );

  const accessoryColors: ProductColor[] = useMemo(
    () =>
      PREDEFINED_COLORS.map((color) => ({
        id: `accessory-${toSlug(color.name)}`,
        name: color.name,
        hex: color.code,
        available: true,
      })),
    []
  );

  const getColorFromId = useCallback(
    (colorId: string): ColorWithName | null => {
      const normalizedId = colorId.startsWith("accessory-")
        ? colorId.replace("accessory-", "")
        : colorId;
      const colorName = PREDEFINED_COLORS.find(
        (c) => toSlug(c.name) === normalizedId
      )?.name;
      if (!colorName) return null;
      const color = getColorByName(colorName);
      return color ? { name: color.name, code: color.code } : null;
    },
    []
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


  const handleAccessoryColorChange = useCallback((colorId: string) => {
    setSelectedAccessoryColor(colorId);
  }, []);

  const handleAccessoryQuantityChange = useCallback((value: string) => {
    const quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity < 0) {
      setAccessoryQuantity(0);
      setSelectedAccessoryColor(null);
      return;
    }
    setAccessoryQuantity(quantity);
    if (quantity === 0) {
      setSelectedAccessoryColor(null);
    }
  }, []);

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

    if (useColorSections) {
      if (product.colorSections && product.colorSections.length > 0) {
        const allSectionsSelected = product.colorSections.every(
          (section) => selectedSections.has(section.id)
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

    if (hasAccessory && accessoryQuantity > 0 && !selectedAccessoryColor) {
      isValid = false;
    }

    return isValid;
  }, [
    useColorSections,
    selectedSections,
    product.colorSections,
    productColors.length,
    selectedColorIndex,
    hasAccessory,
    selectedAccessoryColor,
  ]);

  const handleAddToCart = () => {
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

      let accessoryColorToAdd: ColorWithName | undefined;
      let accessoryQuantityToAdd: number | undefined;
      if (product.accessory && accessoryQuantity > 0 && selectedAccessoryColor) {
        const accessoryColor = getColorFromId(selectedAccessoryColor);
        if (accessoryColor) {
          accessoryColorToAdd = accessoryColor;
          accessoryQuantityToAdd = accessoryQuantity;
        }
      }

      const wasAdded = addItem(
        product,
        1,
        colorsToAdd,
        selectedSectionsData,
        accessoryColorToAdd,
        accessoryQuantityToAdd
      );

      if (wasAdded) {
        const sectionLabels = selectedSectionsData
          .map((s) => `${s.sectionLabel} (${s.colorName})`)
          .join(", ");
        const accessoryText = accessoryColorToAdd && product.accessory && accessoryQuantityToAdd
          ? ` con ${accessoryQuantityToAdd} ${product.accessory.name}${accessoryQuantityToAdd > 1 ? 's' : ''} (${accessoryColorToAdd.name})`
          : "";
        toast.success(
          `${product.name} - ${sectionLabels}${accessoryText} añadido al carrito.`
        );
        onClose();
      } else {
        toast.error(`No queda más stock de ${product.name}.`);
      }
    } else {
      if (selectedColorIndex === null) {
        toast.error("Por favor selecciona un color.");
        return;
      }

      const selectedColor = normalizedColors[selectedColorIndex];

      if (!selectedColor) {
        toast.error("No se pudo agregar el producto. Intenta nuevamente.");
        return;
      }

      let accessoryColorToAdd: ColorWithName | undefined;
      let accessoryQuantityToAdd: number | undefined;
      if (product.accessory && accessoryQuantity > 0 && selectedAccessoryColor) {
        const accessoryColor = getColorFromId(selectedAccessoryColor);
        if (accessoryColor) {
          accessoryColorToAdd = accessoryColor;
          accessoryQuantityToAdd = accessoryQuantity;
        }
      }

      const wasAdded = addItem(
        product,
        1,
        [selectedColor],
        undefined,
        accessoryColorToAdd,
        accessoryQuantityToAdd
      );

      if (wasAdded) {
        const accessoryText = accessoryColorToAdd && product.accessory && accessoryQuantityToAdd
          ? ` con ${accessoryQuantityToAdd} ${product.accessory.name}${accessoryQuantityToAdd > 1 ? 's' : ''} (${accessoryColorToAdd.name})`
          : "";
        toast.success(
          `${product.name} (${selectedColor.name})${accessoryText} añadido al carrito.`
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
        <div className="flex justify-between items-center flex-shrink-0 mb-2">
          <h2
            id="customize-title"
            className="text-xl sm:text-2xl font-bold text-[var(--color-border-base)]"
            style={{ fontFamily: "var(--font-baloo)" }}
          >
            Personalizar: {product.name}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-toad-eyes)] bg-white text-[var(--color-toad-eyes)] transition-all cursor-pointer hover:bg-[var(--color-toad-eyes)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toad-eyes)]"
            aria-label="Cerrar modal"
          >
            <span className="text-xl font-bold leading-none">×</span>
          </button>
        </div>

        <div className="flex flex-col space-y-4">
          {!useColorSections && productColors.length > 0 && (
            <div className="space-y-3 p-4 bg-white rounded-xl border border-[var(--color-border-base)]/20">
              <h3
                className="text-base font-semibold text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Color del producto
              </h3>
              <ColorChipsRowHorizontal
                colors={productColors}
                selectedColorId={selectedColorIndex !== null ? productColors[selectedColorIndex]?.id : undefined}
                onChange={(colorId) => {
                  const colorIndex = productColors.findIndex((c) => c.id === colorId);
                  if (colorIndex === -1) return;
                  
                  setSelectedColorIndex(selectedColorIndex === colorIndex ? null : colorIndex);
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
                    return {
                      id: colorId,
                      name: color.name,
                      hex: color.code,
                      available: true,
                    } as ProductColor;
                  })
                  .filter((c) => c !== null) as ProductColor[];

                const selectedColorId = selectedSections.get(section.id);

                return (
                  <div
                    key={section.id}
                    className="bg-white rounded-xl border border-[var(--color-border-base)]/20 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-border-base)]/5 transition-colors"
                    >
                      <h3
                        className="text-base font-semibold text-[var(--color-border-base)] text-left"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {section.label}
                        {selectedColorId && (
                          <span className="ml-2 text-sm font-normal text-[var(--color-border-base)]/70">
                            ({sectionColors.find((c) => c.id === selectedColorId)?.name})
                          </span>
                        )}
                      </h3>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-[var(--color-border-base)]" />
                      ) : (
                        <ChevronDown size={20} className="text-[var(--color-border-base)]" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <ColorChipsRowHorizontal
                          colors={sectionColors}
                          selectedColorId={selectedColorId}
                          onChange={(colorId) => handleSectionColorSelect(section.id, colorId)}
                          multiple={false}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {hasAccessory && (
            <div className="space-y-3 p-4 bg-white rounded-xl border border-[var(--color-border-base)]/20">
              <h3
                className="text-base font-semibold text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Accesorio: {product.accessory?.name}
              </h3>
              <FilterSelect
                label="Cantidad de accesorios"
                value={accessoryQuantity.toString()}
                options={[
                  { value: "0", label: "Ninguno" },
                  ...Array.from({ length: 10 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: (i + 1).toString(),
                  })),
                ]}
                onChange={handleAccessoryQuantityChange}
                placeholder="Selecciona cantidad"
              />
              {accessoryQuantity > 0 && (
                <div className="space-y-2">
                  <h4
                    className="text-sm font-semibold text-[var(--color-border-base)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    Color del accesorio
                  </h4>
                  <ColorChipsRowHorizontal
                    colors={accessoryColors}
                    selectedColorId={selectedAccessoryColor || undefined}
                    onChange={handleAccessoryColorChange}
                    multiple={false}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-[var(--color-border-base)]/20">
          <Button
            onClick={handleAddToCart}
            variant="primary"
            className="flex-1 !px-4 !py-2 !text-base hover:bg-[var(--color-frog-green)] hover:border-[var(--color-frog-green)] hover:text-[var(--color-contrast-base)]"
            disabled={!canAddToCart || isOutOfStock}
          >
            {canAddToCart
              ? useColorSections
                ? `Agregar ${selectedSections.size} parte${
                    selectedSections.size === 1 ? "" : "s"
                  } al Carrito`
                : "Agregar al Carrito"
              : "Selecciona un color"}
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1 !px-4 !py-2 !text-base hover:bg-[var(--color-toad-eyes)] hover:border-[var(--color-toad-eyes)] hover:text-white"
          >
            Cancelar
          </Button>
        </div>

        <p
          className="text-xs text-[var(--color-border-base)]/70 text-center"
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

