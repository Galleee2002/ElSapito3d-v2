import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components";
import { cn, toTitleCase } from "@/utils";
import { ColorWithName } from "@/types";
import {
  PREDEFINED_COLORS,
  getColorByName,
  normalizeColorName,
} from "@/constants";
import { X } from "lucide-react";

export interface ColorListInputProps {
  value: ColorWithName[];
  onChange: (colors: ColorWithName[]) => void;
  error?: string;
  label?: string;
  id?: string;
  productImages?: string[];
}

const getDefaultColors = (): ColorWithName[] =>
  PREDEFINED_COLORS.map(({ name, code }) => ({ name, code }));

const ColorListInput = ({
  value,
  onChange,
  error,
  label,
  id,
  productImages = [],
}: ColorListInputProps) => {
  const fallbackColors = useMemo(
    () => (value.length > 0 ? value : getDefaultColors()),
    [value]
  );
  const [colors, setColors] = useState<ColorWithName[]>(fallbackColors);

  useEffect(() => {
    setColors(fallbackColors);
  }, [fallbackColors]);

  const handleAddColor = () => {
    const used = new Set(
      colors.map((color) => normalizeColorName(color.name || color.code))
    );
    const nextColor = PREDEFINED_COLORS.find(
      (color) => !used.has(normalizeColorName(color.name))
    );

    if (!nextColor) {
      return;
    }

    const newColors = [
      ...colors,
      { code: nextColor.code, name: nextColor.name },
    ];
    setColors(newColors);
    onChange(newColors);
  };

  const handleRemoveColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
    onChange(newColors);
  };

  const updateColor = (index: number, updates: Partial<ColorWithName>) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], ...updates };
    setColors(newColors);
    onChange(newColors);
  };

  const handleImageSelect = (colorIndex: number, imageUrl: string) => {
    const imageIndex = productImages.indexOf(imageUrl);
    updateColor(colorIndex, {
      image: imageUrl,
      imageIndex: imageIndex >= 0 ? imageIndex : undefined,
    });
  };

  const handleImageRemove = (index: number) => {
    updateColor(index, { image: undefined, imageIndex: undefined });
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-[var(--color-contrast-base)] mb-2"
        >
          {label}
        </label>
      )}
      <div className="space-y-4">
        {colors.map((color, index) => {
          const selectedColor = color.name
            ? getColorByName(color.name)
            : undefined;
          const colorLabel =
            selectedColor?.name ?? toTitleCase(color.name || color.code);
          const colorCode = selectedColor?.code ?? color.code;

          return (
            <div
              key={index}
              className="space-y-3 p-4 border-2 border-[var(--color-border-base)] rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--color-contrast-base)]">
                      {colorLabel}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-contrast-base)]/70">
                      <span
                        className="w-4 h-4 rounded-full border border-[var(--color-border-base)]/30"
                        style={{
                          backgroundColor: selectedColor?.code ?? color.code,
                        }}
                        aria-hidden="true"
                      />
                      <span>{selectedColor?.code ?? color.code}</span>
                    </div>
                    {error && colors.length === 0 && (
                      <p className="mt-1 text-sm text-[var(--color-toad-eyes)]">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
                {colors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className={cn(
                      "flex-shrink-0 w-10 h-10 flex items-center justify-center mt-8",
                      "rounded-xl border-2 border-[var(--color-border-base)]",
                      "bg-white text-[var(--color-border-base)]",
                      "hover:bg-[var(--color-toad-eyes)] hover:border-[var(--color-toad-eyes)] hover:text-white",
                      "transition-colors duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-base)] focus:ring-offset-2"
                    )}
                        aria-label={`Eliminar color ${index + 1}`}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full border-2 border-[var(--color-border-base)]/30"
                    style={{ backgroundColor: colorCode }}
                    aria-label={`Color ${colorLabel}`}
                  />
                  <span
                    className="text-sm text-[var(--color-contrast-base)]"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {colorLabel}
                  </span>
                </div>
                {productImages.length > 0 && (
                  <div className="pt-3 border-t border-[var(--color-border-base)]/20">
                    <p
                      className="text-xs font-semibold text-[var(--color-border-base)]/80 mb-2"
                      style={{ fontFamily: "var(--font-nunito)" }}
                    >
                      Selecciona una imagen para este color:
                    </p>
                    {color.image ? (
                      <div className="relative inline-block">
                        <div className="w-24 h-24 border-2 border-[var(--color-border-base)] rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                          <img
                            src={color.image}
                            alt={`Imagen para ${colorLabel}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-[var(--color-toad-eyes)] text-white rounded-full hover:bg-[var(--color-toad-eyes)]/90 transition-colors text-xs font-bold shadow-md"
                          aria-label="Eliminar imagen"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--color-border-base)]/30 scrollbar-track-transparent">
                        {productImages.map((image, imgIndex) => (
                          <button
                            key={imgIndex}
                            type="button"
                            onClick={() => handleImageSelect(index, image)}
                            className={cn(
                              "flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden bg-gray-100 shadow-sm",
                              "hover:border-[var(--color-border-base)] hover:shadow-md",
                                "transition-all duration-200",
                              "border-[var(--color-border-base)]/30"
                            )}
                          >
                            <img
                              src={image}
                              alt={`Seleccionar imagen ${imgIndex + 1} para ${colorLabel}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddColor}
          className="w-full sm:w-auto"
          disabled={colors.length >= PREDEFINED_COLORS.length}
        >
          Restaurar color
        </Button>
      </div>
      {error && colors.length === 0 && (
        <p className="mt-1 text-sm text-[var(--color-toad-eyes)]">{error}</p>
      )}
    </div>
  );
};

export default ColorListInput;
