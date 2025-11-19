import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Plus, Package, Trash2 } from "lucide-react";
import {
  Navbar,
  ProductForm,
  ProductCard,
  Button,
  AdminUserSection,
  CategoryManager,
  ProductEditModal,
} from "@/components";
import { useAuth } from "@/hooks";
import { productsService } from "@/services";
import { cn } from "@/utils";
import { Product } from "@/types";

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    void loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    setLoadError(null);
    try {
      const allProducts = await productsService.getAll();
      setProducts(allProducts);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos cargar los productos. Intenta nuevamente.";
      setLoadError(message);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleProductAdded = () => {
    void loadProducts();
    setShowForm(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await productsService.delete(id);
        await loadProducts();
        setLoadError(null);
        if (editingProduct?.id === id) {
          setEditingProduct(null);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No pudimos eliminar el producto. Intenta nuevamente.";
        setLoadError(message);
      }
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const closeEditProduct = () => {
    setEditingProduct(null);
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((currentProduct) =>
        currentProduct.id === updatedProduct.id
          ? updatedProduct
          : currentProduct
      )
    );
    setLoadError(null);
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updatedProduct = await productsService.update(product.id, {
        isFeatured: !product.isFeatured,
      });
      setProducts((prevProducts) =>
        prevProducts.map((currentProduct) =>
          currentProduct.id === updatedProduct.id
            ? updatedProduct
            : currentProduct
        )
      );
      setLoadError(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos actualizar el producto. Intenta nuevamente.";
      setLoadError(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFF]">
      <Navbar />
      <div className="py-12 sm:py-14 md:py-16 px-4 sm:px-5 md:px-6 pt-24 sm:pt-28 md:pt-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 sm:mb-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-border-base)] mb-2"
                  style={{ fontFamily: "var(--font-baloo)" }}
                >
                  Panel de Administración
                </h1>
                <p
                  className="text-base sm:text-lg text-[var(--color-border-base)]/80"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Bienvenido, {user?.email}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  <span>
                    {showForm ? "Ocultar formulario" : "Agregar producto"}
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 hover:bg-[var(--color-toad-eyes)] hover:text-white border-0"
                >
                  <LogOut size={20} />
                  <span>Cerrar sesión</span>
                </Button>
              </div>
            </div>
          </motion.div>

          <AdminUserSection />

          <CategoryManager />

          {/* Formulario de producto */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 sm:mb-10"
            >
              <div
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden"
                style={{
                  boxShadow: "0 8px 24px rgba(71,84,103,0.15)",
                }}
              >
                <div className="p-5 sm:p-6 md:p-8 pb-4 sm:pb-5 md:pb-6">
                  <h2
                    className="text-2xl sm:text-3xl font-bold text-[var(--color-border-base)] mb-6"
                    style={{ fontFamily: "var(--font-baloo)" }}
                  >
                    Agregar Nuevo Producto
                  </h2>
                </div>
                <div className="max-h-[calc(100vh-20rem)] overflow-y-auto px-5 sm:px-6 md:px-8 pb-5 sm:pb-6 md:pb-8">
                  <ProductForm
                    onSuccess={handleProductAdded}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Lista de productos */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Package size={28} className="text-[var(--color-border-base)]" />
              <h2
                className="text-2xl sm:text-3xl font-bold text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Productos ({products.length})
              </h2>
            </div>

            {isLoadingProducts ? (
              <div className="text-center py-12">
                <p className="text-[var(--color-border-base)]">
                  Cargando productos...
                </p>
              </div>
            ) : loadError ? (
              <div
                className="bg-white rounded-2xl p-8 sm:p-12 border-2 border-[var(--color-toad-eyes)] flex flex-col items-center justify-center min-h-[200px]"
                style={{
                  boxShadow: "0 4px 12px rgba(192, 57, 43, 0.1)",
                }}
                role="alert"
              >
                <p className="text-lg text-[var(--color-toad-eyes)] mb-6 text-center max-w-md">
                  {loadError}
                </p>
                <Button onClick={loadProducts}>Reintentar</Button>
              </div>
            ) : products.length === 0 ? (
              <div
                className="bg-white rounded-2xl p-8 sm:p-12 border-2 border-dashed border-[var(--color-border-base)] flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]"
                style={{
                  boxShadow: "0 4px 12px rgba(71,84,103,0.1)",
                }}
              >
                <Package
                  size={80}
                  className="text-[var(--color-border-base)]/40 mb-6"
                  strokeWidth={1.5}
                />
                <p
                  className="text-lg sm:text-xl text-[var(--color-border-base)]/70 mb-6 text-center max-w-md"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  No hay productos registrados
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus size={20} className="mr-2" />
                  Agregar primer producto
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group h-full"
                  >
                    <ProductCard
                      product={product}
                      onEdit={openEditProduct}
                      onToggleFeatured={handleToggleFeatured}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleDeleteProduct(product.id);
                      }}
                      className={cn(
                        "absolute top-2 right-2 z-10",
                        "bg-[var(--color-toad-eyes)] text-white",
                        "p-2 rounded-full",
                        "opacity-0 group-hover:opacity-100",
                        "transition-opacity duration-200",
                        "focus:opacity-100",
                        "focus:outline-none"
                      )}
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductEditModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onClose={closeEditProduct}
        onSuccess={handleProductUpdated}
      />
    </div>
  );
};

export default AdminPage;
