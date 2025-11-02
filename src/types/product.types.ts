export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  price: number;
  image: string;
  images?: string[];
  featured?: boolean;
  color?: string;
}

