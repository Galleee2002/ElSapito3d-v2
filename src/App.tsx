import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage, ProductsPage, AdminPage } from "@/pages";
import { AuthModalProvider, AuthProvider } from "@/hooks";

const App = () => {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </AuthModalProvider>
    </AuthProvider>
  );
};

export default App;
