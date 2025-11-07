import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Plus, Package, Trash2 } from "lucide-react";
import { Navbar, ProductForm, ProductCard, Button } from "@/components";
import { useAuth } from "@/hooks";
import { productsService } from "@/services";
import { Product } from "@/types";
import { cn } from "@/utils";

const AdminPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    loadProducts();
  }, [isAuthenticated, navigate]);

  const loadProducts = () => {
    setIsLoading(true);
    try {
      const allProducts = productsService.getAll();
      setProducts(allProducts);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProductAdded = (product: Product) => {
    loadProducts();
    setShowForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      const success = productsService.delete(id);
      if (success) {
        loadProducts();
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

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
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-border-blue)] mb-2"
                  style={{ fontFamily: "var(--font-baloo)" }}
                >
                  Panel de Administración
                </h1>
                <p
                  className="text-base sm:text-lg text-[var(--color-border-blue)]/80"
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
                  <span>{showForm ? "Ocultar formulario" : "Agregar producto"}</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  <span>Cerrar sesión</span>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Formulario de producto */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 sm:mb-10"
            >
              <div
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8"
                style={{
                  boxShadow: "0 8px 24px rgba(39,76,154,0.15)",
                  border: "2px solid var(--color-border-blue)",
                }}
              >
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[var(--color-border-blue)] mb-6"
                  style={{ fontFamily: "var(--font-baloo)" }}
                >
                  Agregar Nuevo Producto
                </h2>
                <ProductForm
                  onSuccess={handleProductAdded}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </motion.div>
          )}

          {/* Lista de productos */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Package
                size={28}
                className="text-[var(--color-border-blue)]"
              />
              <h2
                className="text-2xl sm:text-3xl font-bold text-[var(--color-border-blue)]"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Productos ({products.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-[var(--color-border-blue)]">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div
                className="bg-white rounded-2xl p-8 sm:p-12 text-center"
                style={{
                  boxShadow: "0 4px 12px rgba(39,76,154,0.1)",
                  border: "2px dashed var(--color-border-blue)",
                }}
              >
                <Package size={64} className="mx-auto mb-4 text-[var(--color-border-blue)]/50" />
                <p className="text-lg text-[var(--color-border-blue)]/80 mb-4">
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
                    className="relative group"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={() => {}}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteProduct(product.id)}
                      className={cn(
                        "absolute top-2 right-2 z-10",
                        "bg-[var(--color-toad-eyes)] text-white",
                        "p-2 rounded-full",
                        "opacity-0 group-hover:opacity-100",
                        "transition-opacity duration-200",
                        "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-bouncy-lemon)]"
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
    </div>
  );
};

export default AdminPage;

