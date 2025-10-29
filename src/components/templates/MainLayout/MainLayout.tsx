import Navbar from "../../organisms/Navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100]">
        <Navbar />
      </header>
      <main>{children}</main>
    </>
  );
};

export default MainLayout;

