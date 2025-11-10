import { useState, useEffect } from "react";
import { Button, Input } from "@/components";
import ColorPicker from "@/components/atoms/ColorPicker";
import { isValidColor, normalizeColor, cn } from "@/utils";
import { ColorWithName } from "@/types";
import { X } from "lucide-react";

interface ColorListInputProps {
  value: ColorWithName[];
  onChange: (colors: ColorWithName[]) => void;
  error?: string;
  label?: string;
  id?: string;
}

const ColorListInput = ({
  value,
  onChange,
  error,
  label,
  id,
}: ColorListInputProps) => {
  const [colors, setColors] = useState<ColorWithName[]>(() =>
    value.length > 0 ? value : [{ code: "#000000", name: "" }]
  );

  useEffect(() => {
    setColors(value.length > 0 ? value : [{ code: "#000000", name: "" }]);
  }, [value]);

  const handleAddColor = () => {
    const newColors = [...colors, { code: "#000000", name: "" }];
    setColors(newColors);
    onChange(newColors);
  };

  const handleRemoveColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
    onChange(newColors);
  };

  const handleColorCodeChange = (index: number, code: string) => {
    const newColors = [...colors];
    newColors[index] = {
      ...newColors[index],
      code: isValidColor(code) ? normalizeColor(code) : code,
    };
    setColors(newColors);
    onChange(newColors);
  };

  const handleColorNameChange = (index: number, name: string) => {
    const newColors = [...colors];
    newColors[index] = {
      ...newColors[index],
      name: name.trim(),
    };
    setColors(newColors);
    onChange(newColors);
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
        {colors.map((color, index) => (
          <div key={index} className="space-y-2 p-4 border-2 border-[var(--color-border-blue)] rounded-xl">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  id={id ? `${id}-name-${index}` : undefined}
                  label="Nombre del color *"
                  placeholder="Ej: Morado Intenso, Rojo Fuego, Verde Lima"
                  value={color.name}
                  onChange={(e) => handleColorNameChange(index, e.target.value)}
                  error={
                    error && index === 0 && colors.length === 1 && !color.name.trim()
                      ? error
                      : !color.name.trim()
                      ? "El nombre del color es requerido"
                      : undefined
                  }
                />
                <ColorPicker
                  value={color.code}
                  onChange={(newColor) => handleColorCodeChange(index, newColor)}
                  error={
                    !isValidColor(color.code) && color.code.trim() !== ""
                      ? "Código de color inválido"
                      : undefined
                  }
                  id={id ? `${id}-code-${index}` : undefined}
                />
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
          </div>
        ))}
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

