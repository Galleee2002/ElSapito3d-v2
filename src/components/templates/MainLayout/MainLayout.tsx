import Navbar from "../../organisms/Navbar";

interface MainLayoutProps {
  children: React.ReactNode;
  navbarSolid?: boolean;
}

const MainLayout = ({ children, navbarSolid = false }: MainLayoutProps) => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100]">
        <Navbar solid={navbarSolid} />
      </header>
      <main>{children}</main>
    </>
  );
};

export default MainLayout;

