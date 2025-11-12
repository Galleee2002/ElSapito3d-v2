import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage, ProductsPage, AdminPage, CartPage } from "@/pages";
import {
  AuthModalProvider,
  AuthProvider,
  CartProvider,
  ToastProvider,
} from "@/hooks";
import { ProtectedRoute, PaymentsPanelWrapper } from "@/components";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <AuthModalProvider>
            <BrowserRouter>
              <Suspense
                fallback={
                  <div className="flex h-screen w-full items-center justify-center bg-[var(--color-frog-green)] text-lg font-semibold text-[var(--color-contrast-base)]">
                    Cargando contenido...
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/productos" element={<ProductsPage />} />
                  <Route path="/carrito" element={<CartPage />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                <PaymentsPanelWrapper />
              </Suspense>
            </BrowserRouter>
          </AuthModalProvider>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
