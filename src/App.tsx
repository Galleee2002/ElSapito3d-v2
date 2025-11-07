import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage, ProductsPage } from "@/pages";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
