import { useNavigate } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, AuthModal, CheckoutModal, BackLink } from "@/components";
import { useCart } from "@/hooks";
import { useToast } from "@/hooks/useToast";
import { formatCurrency, calculateDiscountPercentage } from "@/utils";
import { MainLayout } from "@/layouts";

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
  const { toast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);

  const isEmpty = items.length === 0;

  const quantityButtonBase = [
    "w-10 h-10 flex items-center justify-center rounded-full border border-border-base/60 text-text-main transition-colors",
    "focus:outline-none",
    "hover:bg-primary hover:border-primary hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" ");

  return (
    <MainLayout>
      <div className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-5 md:px-6">
        <div className="max-w-6xl mx-auto">
          <BackLink to="/productos">Seguir explorando productos</BackLink>

          {isEmpty ? (
            <div
              className="bg-surface rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center border border-border-base shadow-sm"
              style={{ boxShadow: emptyStateShadow }}
            >
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="p-4 sm:p-5 rounded-full bg-primary/20 border border-border-base/60">
                  <ShoppingCart
                    size={40}
                    className="text-[var(--color-border-base)]"
                  />
                </div>
              </div>

              <h1
                className="text-3xl sm:text-4xl font-bold text-text-main mb-4"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Tu carrito está vacío
              </h1>
              <p
                className="text-base sm:text-lg text-text-muted mb-8"
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
                className="bg-surface border border-border-base rounded-3xl p-6 sm:p-7 md:p-8 space-y-6 shadow-sm"
                style={{ boxShadow: cardShadow }}
              >
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1
                      className="text-3xl sm:text-4xl font-bold text-text-main"
                      style={{ fontFamily: "var(--font-baloo)" }}
                    >
                      Tu carrito ({totalItems})
                    </h1>
                    <p
                      className="text-sm sm:text-base text-text-muted"
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
                  {items.map(({ product, quantity, selectedColors }, index) => (
                    <article
                      key={`${product.id}-${index}`}
                      className="flex flex-col sm:flex-row gap-4 sm:gap-6 border border-border-base/60 rounded-2xl p-4 sm:p-5 bg-surface"
                    >
                      <div className="relative w-full sm:w-36 h-36 rounded-2xl overflow-hidden border border-border-base/60 bg-bg">
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
                              className="text-xl sm:text-2xl font-semibold text-text-main"
                              style={{ fontFamily: "var(--font-baloo)" }}
                            >
                              {product.name}
                            </h2>
                            {selectedColors.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2">
                                <p
                                  className="text-sm sm:text-base text-text-muted font-medium"
                                  style={{ fontFamily: "var(--font-nunito)" }}
                                >
                                  Colores:
                                </p>
                                {selectedColors.map((color, colorIndex) => (
                                  <div
                                    key={colorIndex}
                                    className="flex items-center gap-1.5"
                                  >
                                    <div
                                      className="w-5 h-5 rounded-full border border-border-base/60"
                                      style={{ backgroundColor: color.code }}
                                      aria-hidden="true"
                                    />
                                    <span
                                      className="text-sm sm:text-base text-text-muted font-medium"
                                      style={{
                                        fontFamily: "var(--font-nunito)",
                                      }}
                                    >
                                      {color.name}
                                      {colorIndex < selectedColors.length - 1 &&
                                        ","}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
                              {product.originalPrice &&
                              product.originalPrice > product.price ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <p
                                      className="text-sm sm:text-base text-text-muted"
                                      style={{
                                        fontFamily: "var(--font-nunito)",
                                      }}
                                    >
                                      Precio unitario:{" "}
                                      <span className="font-semibold text-[var(--color-toad-eyes)]">
                                        {formatCurrency(product.price)}
                                      </span>
                                    </p>
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                      -
                                      {calculateDiscountPercentage(
                                        product.originalPrice,
                                        product.price
                                      )}
                                      %
                                    </span>
                                  </div>
                                  <p
                                    className="text-xs sm:text-sm text-text-muted/60 line-through"
                                    style={{ fontFamily: "var(--font-nunito)" }}
                                  >
                                    Antes:{" "}
                                    {formatCurrency(product.originalPrice)}
                                  </p>
                                </>
                              ) : (
                                <p
                                  className="text-sm sm:text-base text-text-muted"
                                  style={{ fontFamily: "var(--font-nunito)" }}
                                >
                                  Precio unitario:{" "}
                                  {formatCurrency(product.price)}
                                </p>
                              )}
                            </div>
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
                              className="min-w-[2.5rem] text-center text-lg font-semibold text-text-main"
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
                                  toast.error(
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
                            className="text-lg sm:text-xl font-semibold text-text-main"
                            style={{ fontFamily: "var(--font-baloo)" }}
                          >
                            Subtotal: {formatCurrency(product.price * quantity)}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              removeItem(product.id);
                              toast.error(
                                `Producto eliminado del carrito: ${product.name}`
                              );
                            }}
                            className="inline-flex items-center gap-2 text-sm sm:text-base text-accent hover:text-accent/80 transition-colors font-semibold"
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
                  <button
                    onClick={() => {
                      navigate("/productos");
                    }}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5 rounded-full font-bold text-base sm:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-contrast-base/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-[0_10px_25px_rgba(43,43,43,0.12)] hover:shadow-[0_18px_40px_rgba(43,43,43,0.15)] bg-surface text-primary border-2 border-primary hover:bg-[var(--color-frog-green)] hover:text-slate-900 hover:border-[var(--color-frog-green)] w-full sm:w-auto"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Seguir comprando
                  </button>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5 rounded-full font-bold text-base sm:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-contrast-base/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-[0_10px_25px_rgba(43,43,43,0.12)] hover:shadow-[0_18px_40px_rgba(43,43,43,0.15)] bg-primary border-2 border-primary text-slate-900 hover:bg-[var(--color-toad-eyes)] hover:border-[var(--color-toad-eyes)] focus-visible:outline-primary w-full sm:w-auto"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Finalizar compra
                  </button>
                </div>
              </section>

              <aside
                className="bg-surface border border-border-base rounded-3xl p-6 sm:p-7 md:p-8 h-max shadow-sm"
                style={{ boxShadow: cardShadow }}
              >
                <h2
                  className="text-2xl sm:text-3xl font-bold text-text-main mb-4"
                  style={{ fontFamily: "var(--font-baloo)" }}
                >
                  Resumen del pedido
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between text-sm sm:text-base text-text-muted">
                    <span style={{ fontFamily: "var(--font-nunito)" }}>
                      Productos
                    </span>
                    <span
                      className="font-semibold text-text-main"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {totalItems}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base sm:text-lg text-text-muted">
                    <span style={{ fontFamily: "var(--font-nunito)" }}>
                      Total
                    </span>
                    <span
                      className="text-2xl font-bold text-text-main"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                <p
                  className="text-xs sm:text-sm text-text-muted mt-4"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Una vez finalizada la compra escribir al siguiente mail para
                  cordinar el envio.
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
    </MainLayout>
  );
};

export default CartPage;
