export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: "Nuevo" | "Top";
  alt?: string;
}

