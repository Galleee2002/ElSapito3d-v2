import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage, ProductsPage, AdminPage } from "@/pages";
import { AuthModalProvider, AuthProvider } from "@/hooks";
import { ProtectedRoute } from "@/components";

const App = () => {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductsPage />} />
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
    </AuthProvider>
  );
};

export default App;
