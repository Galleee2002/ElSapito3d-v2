import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Heading,
  Button,
  ProductImageSlider,
  ColorSelector,
  ProductSpecs,
  ProductPrice,
} from "@/components";
import { ALL_PRODUCTS, FEATURED_PRODUCTS } from "@/constants";
import { useNavigateBack, useDbProducts, useScrollToTop } from "@/hooks";
import {
  findProductById,
  getProductImages,
  createColorVariants,
} from "@/utils/productHelpers";

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const handleBack = useNavigateBack("/productos");
  const { dbProducts } = useDbProducts();
  useScrollToTop();

  const product = useMemo(
    () =>
      findProductById(productId, [
        ...ALL_PRODUCTS,
        ...FEATURED_PRODUCTS,
        ...dbProducts,
      ]),
    [productId, dbProducts]
  );

  const colorVariants = useMemo(() => {
    if (!product) return [];
    return createColorVariants(getProductImages(product));
  }, [product]);

  const initialColor = useMemo(() => {
    if (!product || colorVariants.length === 0) return "#4F8A3F";
    const defaultColor = product.color || "#4F8A3F";
    return (
      colorVariants.find((v) => v.color === defaultColor)?.color ||
      colorVariants[0]?.color ||
      "#4F8A3F"
    );
  }, [product, colorVariants]);

  const [selectedColor, setSelectedColor] = useState<string>(initialColor);

  const selectedVariant = useMemo(
    () =>
      colorVariants.find((v) => v.color === selectedColor) || colorVariants[0],
    [colorVariants, selectedColor]
  );

  const currentImages = selectedVariant?.images || getProductImages(product);

  if (!product) {
    return (
      <section className="w-full min-h-screen bg-[var(--color-surface)] pt-24 sm:pt-28 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-24 flex items-center justify-center">
        <div className="text-center">
          <Heading level={2} className="mb-4">
            Producto no encontrado
          </Heading>
          <Button variant="accent" onClick={handleBack}>
            Volver a Productos
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen bg-[var(--color-surface)] pt-24 sm:pt-28 pb-8 sm:pb-12 md:pb-16 px-4 sm:px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="accent"
          size="sm"
          onClick={handleBack}
          className="mb-6 !px-3 !py-2"
        >
          <ArrowLeft size={18} />
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div className="w-full">
            <ProductImageSlider
              images={currentImages}
              videos={product.videos}
              productName={product.name}
            />
          </div>

          <div className="flex flex-col justify-center gap-4">
            <Heading level={2} className="text-2xl sm:text-3xl md:text-4xl">
              {product.name}
            </Heading>

            <p className="text-base sm:text-lg text-[var(--color-text)] opacity-80">
              {product.fullDescription || product.description}
            </p>

            <ProductSpecs
              material={product.material}
              dimensions={product.dimensions}
              productionTime={product.productionTime}
            />

            <ColorSelector
              colors={colorVariants}
              selectedColor={selectedColor}
              onColorChange={(color) => setSelectedColor(color)}
            />

            <ProductPrice
              price={product.price}
              promotionPrice={product.promotionPrice}
            />

            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto mt-2"
            >
              Pedir cotización
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailPage;
