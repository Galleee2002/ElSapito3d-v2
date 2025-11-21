import { useEffect, useMemo, useState } from "react";
import { Input, Button } from "@/components";
import type { ColorSection } from "@/types";
import { PREDEFINED_COLORS } from "@/constants";
import { toSlug } from "@/utils";

interface ColorSectionsFieldProps {
  value: ColorSection[];
  onChange: (sections: ColorSection[]) => void;
  error?: string;
}

interface InternalColorSection extends ColorSection {
  isNew?: boolean;
}

const createSectionId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `color-section-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const ColorSectionsField = ({
  value,
  onChange,
  error,
}: ColorSectionsFieldProps) => {
  const [sections, setSections] = useState<InternalColorSection[]>(value);

  const colorOptions = useMemo(
    () =>
      PREDEFINED_COLORS.map((color) => ({
        id: toSlug(color.name),
        label: color.name,
        hex: color.code,
      })),
    []
  );

  useEffect(() => {
    setSections(value);
  }, [value]);

  const emitChange = (next: InternalColorSection[]): void => {
    setSections(next);
    onChange(
      next.map(({ isNew, ...rest }) => ({
        ...rest,
      }))
    );
  };

  const handleAddSection = (): void => {
    const next: InternalColorSection[] = [
      ...sections,
      {
        id: createSectionId(),
        key: "",
        label: "",
        colorId: "",
        isNew: true,
      },
    ];
    emitChange(next);
  };

  const handleRemoveSection = (id: string): void => {
    const next = sections.filter((section) => section.id !== id);
    emitChange(next);
  };

  const handleSectionChange = (
    id: string,
    updates: Partial<InternalColorSection>
  ): void => {
    const next = sections.map((section) => {
      if (section.id !== id) {
        return section;
      }

      const merged: InternalColorSection = {
        ...section,
        ...updates,
      };

      if ("label" in updates && updates.label !== undefined) {
        const trimmedLabel = updates.label.trim();
        merged.key = toSlug(trimmedLabel || "seccion");
        merged.isNew = false;
      }

      return merged;
    });

    emitChange(next);
  };

  const hasSections = sections.length > 0;

  return (
    <div className="space-y-4">
      {hasSections && (
        <div className="space-y-3">
          {sections.map((section) => {
            const selectedColor = colorOptions.find(
              (option) => option.id === section.colorId
            );

            return (
              <div
                key={section.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start border-2 border-[var(--color-border-base)] rounded-xl p-3 md:p-4 bg-white/70"
              >
                <div className="md:col-span-5">
                  <Input
                    id={`color-section-label-${section.id}`}
                    label="Parte del producto"
                    placeholder="Ej: Techo, Base, Detalles"
                    value={section.label}
                    onChange={(event) =>
                      handleSectionChange(section.id, {
                        label: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-5">
                  <label className="block text-sm font-semibold text-[var(--color-contrast-base)] mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      className="flex-1 rounded-xl border-2 border-[var(--color-border-base)] bg-white px-3 py-2 text-sm text-[var(--color-contrast-base)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-base)]"
                      value={section.colorId}
                      onChange={(event) =>
                        handleSectionChange(section.id, {
                          colorId: event.target.value,
                          isNew: false,
                        })
                      }
                    >
                      <option value="">Selecciona un color</option>
                      {colorOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {selectedColor && (
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-[var(--color-border-base)] shadow-sm"
                        style={{ backgroundColor: selectedColor.hex }}
                        aria-label={`Color ${selectedColor.label}`}
                      />
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 flex md:justify-end items-start">
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(section.id)}
                    className="mt-7 md:mt-0 inline-flex items-center justify-center rounded-xl border-2 border-[var(--color-border-base)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-border-base)] hover:bg-[var(--color-toad-eyes)] hover:border-[var(--color-toad-eyes)] hover:text-white transition-colors"
                    aria-label={`Eliminar sección de color ${section.label || section.key}`}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddSection}
          className="w-full sm:w-auto"
        >
          Agregar sección de color
        </Button>
        {error && (
          <p className="text-sm text-[var(--color-toad-eyes)]">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ColorSectionsField;


