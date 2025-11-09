export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  badge?: "Nuevo" | "Top";
  alt?: string;
  plasticType?: string;
  printTime?: string;
  availableColors?: string[];
  stock: number;
}

