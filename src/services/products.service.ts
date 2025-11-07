import { Product } from "@/types";
import { allProducts } from "@/constants/products";

const STORAGE_KEY = "elsa_products";

const saveProducts = (products: Product[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

const getStoredProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Si hay error, usar productos por defecto
  }
  // Si no hay productos guardados, guardar los por defecto
  saveProducts(allProducts);
  return allProducts;
};

export const productsService = {
  getAll: (): Product[] => {
    return getStoredProducts();
  },

  add: (product: Omit<Product, "id">): Product => {
    const products = getStoredProducts();
    const newId = String(Date.now());
    const newProduct: Product = {
      ...product,
      id: newId,
    };
    products.push(newProduct);
    saveProducts(products);
    return newProduct;
  },

  update: (id: string, updates: Partial<Product>): Product | null => {
    const products = getStoredProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    
    products[index] = { ...products[index], ...updates };
    saveProducts(products);
    return products[index];
  },

  delete: (id: string): boolean => {
    const products = getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    
    saveProducts(filtered);
    return true;
  },
};

