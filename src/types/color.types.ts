export interface ColorWithName {
  code: string;
  name: string;
  image?: string;
  imageIndex?: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  available?: boolean;
}

export interface ColorSection {
  id: string;
  key: string;
  label: string;
  availableColorIds: string[];
}

export interface SelectedColorSection {
  sectionId: string;
  sectionLabel: string;
  colorId: string;
  colorName: string;
  colorCode: string;
}

export type ColorSectionKey = ColorSection["key"];
