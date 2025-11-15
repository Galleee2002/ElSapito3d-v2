import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Navbar, Button, AuthModal, CheckoutModal } from "@/components";
import { useCart } from "@/hooks";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/utils";

const emptyStateShadow = "0 12px 32px rgba(71,84,103,0.12)";
const cardShadow = "0 10px 24px rgba(71,84,103,0.1)";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    items,
    totalAmount,
    totalItems,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { showError } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);

  const isEmpty = items.length === 0;

  const quantityButtonBase = [
    "w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-border-base)] text-[var(--color-border-base)] transition-colors",
    "focus:outline-none",
    "hover:bg-[var(--color-bouncy-lemon)] hover:border-[var(--color-bouncy-lemon)] hover:text-[var(--color-contrast-base)] disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" ");

  return (
    <div className="min-h-screen bg-[#F5FAFF]">
      <Navbar />
      <div className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-5 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 text-sm sm:text-base text-[var(--color-border-base)] hover:text-[var(--color-border-base)]/80 mb-6 transition-colors"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            <span>←</span>
            <span>Seguir explorando productos</span>
          </Link>

          {isEmpty ? (
            <div
              className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center border-2 border-[var(--color-border-base)]"
              style={{ boxShadow: emptyStateShadow }}
            >
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="p-4 sm:p-5 rounded-full bg-[var(--color-frog-green)]/20 border-2 border-[var(--color-border-base)]">
                  <ShoppingCart
                    size={40}
                    className="text-[var(--color-border-base)]"
                  />
                </div>
              </div>

              <h1
                className="text-3xl sm:text-4xl font-bold text-[var(--color-border-base)] mb-4"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Tu carrito está vacío
              </h1>
              <p
                className="text-base sm:text-lg text-[var(--color-border-base)]/80 mb-8"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Agrega tus diseños favoritos para verlos aquí y completar tu
                pedido cuando estés listo.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Button
                  onClick={() => {
                    navigate("/productos");
                  }}
                >
                  Explorar productos
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    navigate("/#productos-destacados");
                  }}
                >
                  Ver destacados
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 sm:gap-8">
              <section
                className="bg-white border-2 border-[var(--color-border-base)] rounded-3xl p-6 sm:p-7 md:p-8 space-y-6"
                style={{ boxShadow: cardShadow }}
              >
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1
                      className="text-3xl sm:text-4xl font-bold text-[var(--color-border-base)]"
                      style={{ fontFamily: "var(--font-baloo)" }}
                    >
                      Tu carrito ({totalItems})
                    </h1>
                    <p
                      className="text-sm sm:text-base text-[var(--color-border-base)]/70"
                      style={{ fontFamily: "var(--font-nunito)" }}
                    >
                      Revisa tus productos y ajusta las cantidades antes de
                      finalizar.
                    </p>
                  </div>
                  <button
                    onClick={clearCart}
                    className="text-sm sm:text-base font-semibold text-[var(--color-toad-eyes)] hover:text-[var(--color-toad-eyes)]/80 transition-colors"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Vaciar carrito
                  </button>
                </header>

                <div className="space-y-4 sm:space-y-5">
                  {items.map(({ product, quantity }) => (
                    <article
                      key={product.id}
                      className="flex flex-col sm:flex-row gap-4 sm:gap-6 border-2 border-[var(--color-border-base)] rounded-2xl p-4 sm:p-5"
                    >
                      <div className="relative w-full sm:w-36 h-36 rounded-2xl overflow-hidden border-2 border-[var(--color-border-base)] bg-white">
                        <img
                          src={product.image[0] || ""}
                          alt={product.alt || product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between gap-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-2">
                            <h2
                              className="text-xl sm:text-2xl font-semibold text-[var(--color-border-base)]"
                              style={{ fontFamily: "var(--font-baloo)" }}
                            >
                              {product.name}
                            </h2>
                            <p
                              className="text-sm sm:text-base text-[var(--color-border-base)]/70"
                              style={{ fontFamily: "var(--font-nunito)" }}
                            >
                              Precio unitario: {formatCurrency(product.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 self-start">
                            <button
                              type="button"
                              onClick={() => {
                                updateQuantity(product.id, quantity - 1);
                              }}
                              className={quantityButtonBase}
                              aria-label={`Reducir cantidad de ${product.name}`}
                              disabled={quantity === 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span
                              className="min-w-[2.5rem] text-center text-lg font-semibold text-[var(--color-border-base)]"
                              style={{ fontFamily: "var(--font-baloo)" }}
                              aria-live="polite"
                            >
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const wasUpdated = updateQuantity(
                                  product.id,
                                  quantity + 1
                                );
                                if (!wasUpdated) {
                                  showError(
                                    `No queda más stock de ${product.name}.`
                                  );
                                }
                              }}
                              className={quantityButtonBase}
                              aria-label={`Aumentar cantidad de ${product.name}`}
                              disabled={quantity >= product.stock}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div
                            className="text-lg sm:text-xl font-semibold text-[var(--color-border-base)]"
                            style={{ fontFamily: "var(--font-baloo)" }}
                          >
                            Subtotal: {formatCurrency(product.price * quantity)}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(product.id)}
                            className="inline-flex items-center gap-2 text-sm sm:text-base text-[var(--color-toad-eyes)] hover:text-[var(--color-toad-eyes)]/80 transition-colors font-semibold"
                            style={{ fontFamily: "var(--font-nunito)" }}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigate("/productos");
                    }}
                    className="w-full sm:w-auto"
                  >
                    Seguir comprando
                  </Button>
                  <Button
                    onClick={() => setShowCheckout(true)}
                    className="w-full sm:w-auto"
                  >
                    Finalizar compra
                  </Button>
                </div>
              </section>

              <aside
                className="bg-white border-2 border-[var(--color-border-base)] rounded-3xl p-6 sm:p-7 md:p-8 h-max"
                style={{ boxShadow: cardShadow }}
              >
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[var(--color-border-base)] mb-4"
                  style={{ fontFamily: "var(--font-baloo)" }}
                >
                  Resumen del pedido
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between text-sm sm:text-base text-[var(--color-border-base)]/80">
                    <span style={{ fontFamily: "var(--font-nunito)" }}>
                      Productos
                    </span>
                    <span
                      className="font-semibold text-[var(--color-border-base)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {totalItems}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base sm:text-lg text-[var(--color-border-base)]/80">
                    <span style={{ fontFamily: "var(--font-nunito)" }}>
                      Total
                    </span>
                    <span
                      className="text-2xl font-bold text-[var(--color-border-base)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                <p
                  className="text-xs sm:text-sm text-[var(--color-border-base)]/70 mt-4"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Los precios incluyen IVA. La confirmación de envío se
                  coordinará después de finalizar la compra.
                </p>
              </aside>
            </div>
          )}
        </div>
      </div>
      <AuthModal />
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </div>
  );
};

export default CartPage;
