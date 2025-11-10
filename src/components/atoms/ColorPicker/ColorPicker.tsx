import { ChangeEvent, useState, useEffect, useRef } from "react";
import { cn } from "@/utils";
import { FOCUS_RING_WHITE } from "@/constants";
import { isValidColor, normalizeColor, getDisplayColor } from "@/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onBlur?: () => void;
  error?: string;
  className?: string;
  id?: string;
}

const ColorPicker = ({
  value,
  onChange,
  onBlur,
  error,
  className,
  id,
}: ColorPickerProps) => {
  const [textValue, setTextValue] = useState(value);
  const [pickerValue, setPickerValue] = useState("#000000");
  const lastValueRef = useRef(value);

  useEffect(() => {
    const trimmedValue = value.trim();
    const trimmedLastValue = lastValueRef.current.trim();
    
    const valueNormalized = isValidColor(trimmedValue) 
      ? normalizeColor(trimmedValue) 
      : trimmedValue;
    const lastValueNormalized = isValidColor(trimmedLastValue) 
      ? normalizeColor(trimmedLastValue) 
      : trimmedLastValue;

    if (valueNormalized === lastValueNormalized) {
      return;
    }

    lastValueRef.current = value;

    if (trimmedValue && isValidColor(trimmedValue)) {
      const displayColor = getDisplayColor(trimmedValue);
      if (displayColor.startsWith("#")) {
        setPickerValue(displayColor);
      }
      setTextValue(trimmedValue);
    } else {
      setTextValue(trimmedValue);
    }
  }, [value]);

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setTextValue(newValue);
    
    const currentNormalized = isValidColor(value) ? normalizeColor(value) : value.trim();
    const newNormalized = isValidColor(newValue) ? normalizeColor(newValue) : newValue.trim();
    
    if (currentNormalized !== newNormalized) {
      lastValueRef.current = newValue;
      onChange(newValue);
    }
  };

  const handlePickerChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    const currentNormalized = isValidColor(value) ? normalizeColor(value) : value.trim();
    const newNormalized = normalizeColor(newColor);
    
    if (currentNormalized !== newNormalized) {
      setPickerValue(newColor);
      setTextValue(newColor);
      lastValueRef.current = newColor;
      onChange(newColor);
    }
  };

  const handleTextBlur = () => {
    const trimmedValue = textValue.trim();
    if (trimmedValue && isValidColor(trimmedValue)) {
      const normalized = normalizeColor(trimmedValue);
      const currentNormalized = isValidColor(value) ? normalizeColor(value) : value.trim();
      
      if (normalized !== currentNormalized) {
        setTextValue(normalized);
        lastValueRef.current = normalized;
        onChange(normalized);

        const displayColor = getDisplayColor(normalized);
        if (displayColor.startsWith("#")) {
          setPickerValue(displayColor);
        }
      } else if (trimmedValue !== value.trim()) {
        setTextValue(normalized);
      }
    } else if (!trimmedValue && value.trim()) {
      setTextValue(value);
      lastValueRef.current = value;
    }
    onBlur?.();
  };

  return (
    <div className={cn("flex gap-2 items-start", className)}>
      <div className="flex-shrink-0">
        <input
          type="color"
          value={pickerValue}
          onChange={handlePickerChange}
          className={cn(
            "w-12 h-12 rounded-lg border-2 cursor-pointer",
            "bg-white",
            error
              ? "border-[var(--color-toad-eyes)]"
              : "border-[var(--color-border-blue)]",
            FOCUS_RING_WHITE
          )}
          aria-label="Selector de color"
        />
      </div>
      <div className="flex-1">
        <input
          id={id}
          type="text"
          value={textValue}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          placeholder="HEX, RGB, HSL o nombre de color"
          className={cn(
            "w-full px-4 py-3 rounded-xl",
            "bg-white border-2",
            "text-[var(--color-contrast-base)]",
            "placeholder:text-gray-400",
            FOCUS_RING_WHITE,
            "focus:border-transparent",
            "transition-all duration-200",
            error
              ? "border-[var(--color-toad-eyes)] focus:border-[var(--color-toad-eyes)]"
              : "border-[var(--color-border-blue)]",
            className
          )}
          style={{ fontFamily: "var(--font-nunito)" }}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--color-toad-eyes)]">{error}</p>
        )}
        {textValue && !error && isValidColor(textValue) && (
          <p className="mt-1 text-xs text-gray-500">
            Formato válido: {normalizeColor(textValue)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;

