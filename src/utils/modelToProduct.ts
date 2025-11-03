import type { Model } from "@/types/model.types";
import type { Product } from "@/types/product.types";

export const modelToProduct = (model: Model): Product => {
  const imageUrls = model.image_urls || [];
  const videoUrls = model.video_urls || [];
  
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    fullDescription: model.description,
    price: model.price,
    image: imageUrls[0] || "",
    images: imageUrls,
    videos: videoUrls,
    material: model.material,
    category: model.category,
    productionTime: `${model.print_time} minutos`,
  };
};

export const modelsToProducts = (models: Model[]): Product[] => {
  return models.map(modelToProduct);
};

