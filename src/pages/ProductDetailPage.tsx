import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Heading, Button, ColorBadge, ProductImageSlider } from "@/components";
import { ALL_PRODUCTS, FEATURED_PRODUCTS } from "@/constants";

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const product = [...ALL_PRODUCTS, ...FEATURED_PRODUCTS].find((p) => p.id === productId);

  if (!product) {
    return (
      <section className="w-full min-h-screen bg-[var(--color-surface)] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-24 flex items-center justify-center">
        <div className="text-center">
          <Heading level={2} className="mb-4">Producto no encontrado</Heading>
          <Button variant="accent" onClick={() => navigate("/productos")}>
            Volver a Productos
          </Button>
        </div>
      </section>
    );
  }

  const images = product.images || [product.image];

  return (
    <section className="w-full min-h-screen bg-[var(--color-surface)] py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="accent"
          size="sm"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/productos");
            }
          }}
          className="mb-6 !px-3 !py-2"
        >
          <ArrowLeft size={18} />
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="w-full">
            <ProductImageSlider images={images} productName={product.name} />
          </div>

          <div className="flex flex-col justify-center">
            <Heading level={1} className="mb-4 sm:mb-6">
              {product.name}
            </Heading>

            <p className="text-lg sm:text-xl text-[var(--color-text)] opacity-90 mb-4 sm:mb-6">
              {product.fullDescription || product.description}
            </p>

            {product.color && <ColorBadge color={product.color} className="mb-6 sm:mb-8" />}

            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <span className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)]">
                ${product.price.toLocaleString()}
              </span>
            </div>

            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Agregar al carrito
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailPage;

