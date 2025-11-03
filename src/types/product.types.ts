export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  price: number;
  promotionPrice?: number;
  image: string;
  images?: string[];
  featured?: boolean;
  color?: string;
  material?: string;
  category?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  productionTime?: string;
}

