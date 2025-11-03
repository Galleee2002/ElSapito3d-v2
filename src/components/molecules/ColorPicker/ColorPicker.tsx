import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button, Label } from "@/components/atoms";
import { cn } from "@/utils";
import type { ColorValue } from "@/types";

interface ColorPickerProps {
  colors: ColorValue[];
  onChange: (colors: ColorValue[]) => void;
  label?: string;
}

const ColorPicker = ({ colors, onChange, label = "Colores del producto" }: ColorPickerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [colorValue, setColorValue] = useState("");
  const [pickerColor, setPickerColor] = useState("#4F8A3F");
  const [format, setFormat] = useState<"hex" | "rgb">("hex");
  const [error, setError] = useState("");

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "";
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const rgbToHex = (rgb: string): string => {
    const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
    if (!result) return "";
    const r = parseInt(result[1], 10).toString(16).padStart(2, "0");
    const g = parseInt(result[2], 10).toString(16).padStart(2, "0");
    const b = parseInt(result[3], 10).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexColor = e.target.value;
    setPickerColor(hexColor);
    
    if (format === "hex") {
      setColorValue(hexColor);
    } else {
      setColorValue(hexToRgb(hexColor));
    }
    setError("");
  };

  const validateColor = (value: string, format: "hex" | "rgb"): boolean => {
    if (format === "hex") {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      return hexRegex.test(value);
    } else {
      const rgbRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
      if (!rgbRegex.test(value)) return false;
      const matches = value.match(rgbRegex);
      if (!matches) return false;
      const [, r, g, b] = matches.map(Number);
      return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
    }
  };

  const handleAddColor = () => {
    setError("");
    const trimmedValue = colorValue.trim();

    if (!trimmedValue) {
      setError("El valor del color es requerido");
      return;
    }

    if (!validateColor(trimmedValue, format)) {
      setError(
        format === "hex"
          ? "Formato HEX inválido. Use #RRGGBB o #RGB"
          : "Formato RGB inválido. Use rgb(r, g, b) con valores 0-255"
      );
      return;
    }

    const newColor: ColorValue = {
      value: trimmedValue,
      format,
    };

    if (colors.some((c) => c.value.toLowerCase() === trimmedValue.toLowerCase())) {
      setError("Este color ya está agregado");
      return;
    }

    onChange([...colors, newColor]);
    setColorValue("");
    setIsAdding(false);
    setError("");
  };

  const handleRemoveColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  const getColorPreview = (color: ColorValue): string => {
    if (color.format === "hex") {
      return color.value;
    }
    return color.value;
  };

  return (
    <div className="md:col-span-2">
      <Label>{label}</Label>
      <div className="space-y-3">
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {colors.map((color, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-black/10 bg-white"
              >
                <div
                  className="w-8 h-8 rounded border border-black/20"
                  style={{ backgroundColor: getColorPreview(color) }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{color.value}</span>
                  <span className="text-xs text-[var(--color-text)]/60 uppercase">
                    {color.format}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveColor(index)}
                  className="ml-2 p-1 hover:bg-red-50 rounded transition-colors"
                  aria-label="Eliminar color"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!isAdding ? (
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-fit"
          >
            <span className="flex items-center gap-2">
              <Plus size={16} />
              Agregar color
            </span>
          </Button>
        ) : (
          <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-black/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nuevo color</span>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setColorValue("");
                  setError("");
                }}
                className="p-1 hover:bg-black/5 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-2 block">Seleccionar color de la paleta</Label>
                <input
                  type="color"
                  value={pickerColor}
                  onChange={handleColorPickerChange}
                  className={cn(
                    "w-16 h-16 rounded-lg border-2 border-black/20 cursor-pointer",
                    "hover:border-[var(--color-primary)] transition-colors"
                  )}
                />
              </div>

              <div>
                <Label htmlFor="color-format" className="text-xs mb-1">
                  Formato
                </Label>
                <select
                  id="color-format"
                  value={format}
                  onChange={(e) => {
                    const newFormat = e.target.value as "hex" | "rgb";
                    setFormat(newFormat);
                    
                    if (colorValue) {
                      if (newFormat === "hex") {
                        const rgbMatch = colorValue.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                        if (rgbMatch) {
                          setColorValue(rgbToHex(colorValue));
                        }
                      } else {
                        const hexMatch = colorValue.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
                        if (hexMatch) {
                          setColorValue(hexToRgb(colorValue));
                        }
                      }
                    } else {
                      if (newFormat === "hex") {
                        setColorValue(pickerColor);
                      } else {
                        setColorValue(hexToRgb(pickerColor));
                      }
                    }
                    setError("");
                  }}
                  className={cn(
                    "w-full px-3 py-2 rounded-md",
                    "bg-white border border-black/10",
                    "text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  )}
                >
                  <option value="hex">HEX (#RRGGBB)</option>
                  <option value="rgb">RGB (r, g, b)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="color-value" className="text-xs mb-1">
                  Valor {format === "hex" ? "HEX" : "RGB"}
                </Label>
                <input
                  id="color-value"
                  type="text"
                  value={colorValue}
                  onChange={(e) => {
                    setColorValue(e.target.value);
                    setError("");
                    
                    if (format === "hex" && /^#?[a-f\d]{6}$/i.test(e.target.value)) {
                      setPickerColor(e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`);
                    } else if (format === "rgb") {
                      const rgbMatch = e.target.value.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                      if (rgbMatch) {
                        setPickerColor(rgbToHex(e.target.value));
                      }
                    }
                  }}
                  placeholder={format === "hex" ? "#4F8A3F" : "rgb(79, 138, 63)"}
                  className={cn(
                    "w-full px-3 py-2 rounded-md",
                    "bg-white border border-black/10",
                    "text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  )}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddColor}
              className="w-full"
              disabled={!colorValue.trim() || !validateColor(colorValue.trim(), format)}
            >
              Agregar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;

