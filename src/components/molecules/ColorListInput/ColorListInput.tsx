import { useState, useEffect, useRef } from "react";
import { Button } from "@/components";
import { cn } from "@/utils";
import { ColorWithName } from "@/types";
import { PREDEFINED_COLORS } from "@/constants";
import { X, ChevronDown } from "lucide-react";

export interface ColorListInputProps {
  value: ColorWithName[];
  onChange: (colors: ColorWithName[]) => void;
  error?: string;
  label?: string;
  id?: string;
  productImages?: string[];
}

interface ColorDropdownProps {
  value: string;
  options: typeof PREDEFINED_COLORS;
  onChange: (colorName: string) => void;
  error?: boolean;
  id?: string;
}

const ColorDropdown = ({
  value,
  options,
  onChange,
  error,
  id,
}: ColorDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedColor = options.find((c) => c.name === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (colorName: string) => {
    onChange(colorName);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-3 pr-10 rounded-xl text-left",
          "bg-white border-2",
          "text-[var(--color-contrast-base)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-blue)] focus:ring-offset-2",
          "focus:border-[var(--color-border-blue)]",
          "transition-all duration-200",
          "cursor-pointer flex items-center justify-between",
          error
            ? "border-[var(--color-toad-eyes)] focus:border-[var(--color-toad-eyes)] focus:ring-[var(--color-toad-eyes)]"
            : "border-[var(--color-border-blue)]"
        )}
        style={{ fontFamily: "var(--font-nunito)" }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedColor ? (
            <>
              <span
                className="w-5 h-5 rounded-full border-2 border-[var(--color-border-blue)]/30 flex-shrink-0"
                style={{ backgroundColor: selectedColor.code }}
                aria-hidden="true"
              />
              <span className="truncate">{selectedColor.displayName}</span>
            </>
          ) : (
            <span className="text-gray-400">Selecciona un color</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[var(--color-border-blue)] flex-shrink-0 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-[var(--color-border-blue)] rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => handleSelect(option.name)}
                className={cn(
                  "w-full px-4 py-3 text-left flex items-center gap-3",
                  "hover:bg-[var(--color-border-blue)]/10",
                  "transition-colors duration-150",
                  value === option.name && "bg-[var(--color-border-blue)]/5"
                )}
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                <span
                  className="w-5 h-5 rounded-full border-2 border-[var(--color-border-blue)]/30 flex-shrink-0"
                  style={{ backgroundColor: option.code }}
                  aria-hidden="true"
                />
                <span className="text-[var(--color-contrast-base)]">
                  {option.displayName}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ColorListInput = ({
  value,
  onChange,
  error,
  label,
  id,
  productImages = [],
}: ColorListInputProps) => {
  const [colors, setColors] = useState<ColorWithName[]>(value);

  const handleAddColor = () => {
    const firstColor = PREDEFINED_COLORS[0];
    const newColors = [
      ...colors,
      { code: firstColor.code, name: firstColor.name },
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

  const handleColorChange = (index: number, colorName: string) => {
    const selectedColor = PREDEFINED_COLORS.find((c) => c.name === colorName);
    if (!selectedColor) return;

    updateColor(index, {
      code: selectedColor.code,
      name: selectedColor.name,
    });
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

  const getAvailableColors = (currentIndex: number) => {
    const currentColor = colors[currentIndex]?.name;
    const usedColors = colors
      .map((c, i) => (i !== currentIndex && c.name ? c.name : null))
      .filter(Boolean) as string[];
    return PREDEFINED_COLORS.filter(
      (color) => !usedColors.includes(color.name) || color.name === currentColor
    );
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
          const availableColors = getAvailableColors(index);
          const selectedColor = PREDEFINED_COLORS.find((c) => c.name === color.name);
          const hasError = error && index === 0 && colors.length === 1 && !color.name;

          return (
            <div
              key={index}
              className="space-y-3 p-4 border-2 border-[var(--color-border-blue)] rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div>
                    <label
                      htmlFor={id ? `${id}-color-${index}` : undefined}
                      className="block text-sm font-semibold text-[var(--color-contrast-base)] mb-2"
                    >
                      Color *
                    </label>
                    <ColorDropdown
                      id={id ? `${id}-color-${index}` : undefined}
                      value={color.name || ""}
                      options={availableColors}
                      onChange={(colorName) => handleColorChange(index, colorName)}
                      error={!!hasError}
                    />
                    {hasError && (
                      <p className="mt-1 text-sm text-[var(--color-toad-eyes)]">
                        {error}
                      </p>
                    )}
                    {!color.name && !hasError && (
                      <p className="mt-1 text-sm text-[var(--color-toad-eyes)]">
                        El color es requerido
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
                      "rounded-xl border-2 border-[var(--color-border-blue)]",
                      "bg-white text-[var(--color-border-blue)]",
                      "hover:bg-[var(--color-toad-eyes)] hover:border-[var(--color-toad-eyes)] hover:text-white",
                      "transition-colors duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-blue)] focus:ring-offset-2"
                    )}
                    aria-label={`Eliminar color ${index + 1}`}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              {selectedColor && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full border-2 border-[var(--color-border-blue)]/30"
                      style={{ backgroundColor: selectedColor.code }}
                      aria-label={`Color ${selectedColor.displayName}`}
                    />
                    <span
                      className="text-sm text-[var(--color-contrast-base)]"
                      style={{ fontFamily: "var(--font-nunito)" }}
                    >
                      {selectedColor.displayName}
                    </span>
                  </div>
                  {productImages.length > 0 && (
                    <div className="pt-3 border-t border-[var(--color-border-blue)]/20">
                      <p
                        className="text-xs font-semibold text-[var(--color-border-blue)]/80 mb-2"
                        style={{ fontFamily: "var(--font-nunito)" }}
                      >
                        Selecciona una imagen para este color:
                      </p>
                      {color.image ? (
                        <div className="relative inline-block">
                          <div className="w-24 h-24 border-2 border-[var(--color-border-blue)] rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                            <img
                              src={color.image}
                              alt={`Imagen para ${selectedColor.displayName}`}
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
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--color-border-blue)]/30 scrollbar-track-transparent">
                          {productImages.map((image, imgIndex) => (
                            <button
                              key={imgIndex}
                              type="button"
                              onClick={() => handleImageSelect(index, image)}
                              className={cn(
                                "flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden bg-gray-100 shadow-sm",
                                "hover:border-[var(--color-border-blue)] hover:shadow-md",
                                "transition-all duration-200",
                                "border-[var(--color-border-blue)]/30"
                              )}
                            >
                              <img
                                src={image}
                                alt={`Seleccionar imagen ${imgIndex + 1} para ${selectedColor.displayName}`}
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
              )}
            </div>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddColor}
          className="w-full sm:w-auto"
        >
          Agregar Color
        </Button>
      </div>
      {error && colors.length === 0 && (
        <p className="mt-1 text-sm text-[var(--color-toad-eyes)]">{error}</p>
      )}
    </div>
  );
};

export default ColorListInput;
