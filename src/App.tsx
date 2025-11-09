import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage, ProductsPage, AdminPage, CartPage } from "@/pages";
import {
  AuthModalProvider,
  AuthProvider,
  CartProvider,
  ToastProvider,
} from "@/hooks";
import { ProtectedRoute } from "@/components";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <AuthModalProvider>
            <BrowserRouter>
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
            </BrowserRouter>
          </AuthModalProvider>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
