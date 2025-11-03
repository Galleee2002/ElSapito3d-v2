import type { Model } from "@/types/model.types";
import type { Product } from "@/types/product.types";

export const modelToProduct = (model: Model): Product => {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    fullDescription: model.description,
    price: model.price,
    image: model.image_url,
    images: model.image_url ? [model.image_url] : [],
    material: model.material,
    category: model.category,
    productionTime: `${model.print_time} minutos`,
  };
};

export const modelsToProducts = (models: Model[]): Product[] => {
  return models.map(modelToProduct);
};

