import MainLayout from "./components/templates/MainLayout";

const App = () => {
  return (
    <MainLayout>
      <section id="inicio" className="min-h-screen">
        {/* Contenido de inicio */}
      </section>
      <section id="productos" className="min-h-screen">
        {/* Contenido de productos */}
      </section>
      <section id="contacto" className="min-h-screen">
        {/* Contenido de contacto */}
      </section>
      <section id="nosotros" className="min-h-screen">
        {/* Contenido de nosotros */}
      </section>
    </MainLayout>
  );
};

export default App;
