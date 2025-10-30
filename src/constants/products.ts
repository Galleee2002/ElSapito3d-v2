import type { Product } from "@/types";

// Ejemplo de productos destacados
// Puedes reemplazar estas imágenes con las URLs reales de tus productos
export const FEATURED_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Figura Personalizada",
    description: "Crea tu propia figura única con detalles precisos y acabado profesional",
    price: 2500,
    image: "/path/to/image1.jpg",
    featured: true,
  },
  {
    id: "2",
    name: "Prototipo Industrial",
    description: "Prototipos funcionales para validar tus diseños antes de producción",
    price: 4500,
    image: "/path/to/image2.jpg",
    featured: true,
  },
  {
    id: "3",
    name: "Arte Decorativo",
    description: "Piezas decorativas únicas que transforman cualquier espacio",
    price: 3200,
    image: "/path/to/image3.jpg",
    featured: true,
  },
];

export const PRODUCT_CATEGORIES = {
  FIGURINES: "Figuras",
  PROTOTYPES: "Prototipos",
  DECORATIVE: "Decoración",
  FUNCTIONAL: "Funcional",
  CUSTOM: "Personalizado",
} as const;

