import { Navbar, Footer } from "@/components";

interface MainLayoutProps {
  children: React.ReactNode;
  navbarSolid?: boolean;
  showFooter?: boolean;
}

const MainLayout = ({ children, navbarSolid = false, showFooter = true }: MainLayoutProps) => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100]">
        <Navbar solid={navbarSolid} />
      </header>
      <main>{children}</main>
      {showFooter && <Footer />}
    </>
  );
};

export default MainLayout;

