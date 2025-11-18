import { ColorWithName } from "./color.types";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string[];
  description: string;
  alt?: string;
  plasticType?: string;
  printTime?: string;
  availableColors: ColorWithName[];
  stock: number;
  isFeatured?: boolean;
  categoryId?: string;
  model3DUrl?: string;
  model3DGridPosition?: number;
  model3DPath?: string;
  videoUrl?: string;
  videoPath?: string;
}
