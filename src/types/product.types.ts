export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  price: number;
  image: string;
  images?: string[];
  featured?: boolean;
  colors?: string[];
  purchaseMethods?: string[];
  shipping?: {
    available: boolean;
    cost?: number;
    estimatedDays?: number;
  };
}

