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

  const allColorIds = useMemo(
    () => colorOptions.map((color) => color.id),
    [colorOptions]
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

  const handleLoadAllColors = (): void => {
    const commonSections = [
      { label: "Parte Principal", key: "parte-principal" },
      { label: "Detalles", key: "detalles" },
      { label: "Base", key: "base" },
      { label: "Techo", key: "techo" },
      { label: "Accesorios", key: "accesorios" },
    ];

    const newSections: InternalColorSection[] = commonSections.map(
      (section) => ({
        id: createSectionId(),
        key: section.key,
        label: section.label,
        availableColorIds: allColorIds,
        isNew: false,
      })
    );

    emitChange(newSections);
  };

  const handleAddSection = (): void => {
    const next: InternalColorSection[] = [
      ...sections,
      {
        id: createSectionId(),
        key: "",
        label: "",
        availableColorIds: allColorIds,
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
            return (
              <div
                key={section.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start border-2 border-[var(--color-border-base)] rounded-xl p-3 md:p-4 bg-white/70"
              >
                <div className="md:col-span-10">
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
                  <p className="mt-1 text-xs text-[var(--color-border-base)]/60">
                    Los usuarios podrán elegir UN color de todos los disponibles
                    para esta parte
                  </p>
                </div>

                <div className="md:col-span-2 flex md:justify-end items-start">
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(section.id)}
                    className="mt-7 md:mt-0 inline-flex items-center justify-center rounded-xl border-2 border-[var(--color-border-base)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-border-base)] hover:bg-[var(--color-toad-eyes)] hover:border-[var(--color-toad-eyes)] hover:text-white transition-colors"
                    aria-label={`Eliminar sección ${
                      section.label || section.key
                    }`}
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
          variant="primary"
          onClick={handleLoadAllColors}
          className="w-full sm:w-auto"
        >
          Cargar secciones comunes
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddSection}
          className="w-full sm:w-auto"
        >
          Agregar sección personalizada
        </Button>
        {error && (
          <p className="text-sm text-[var(--color-toad-eyes)]">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ColorSectionsField;
