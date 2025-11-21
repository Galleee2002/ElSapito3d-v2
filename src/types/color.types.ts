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
  colorId: string;
}

export type ColorSectionKey = ColorSection["key"];

