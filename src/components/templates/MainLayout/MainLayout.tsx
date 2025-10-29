import Navbar from "../../organisms/Navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="pt-28">{children}</main>
    </>
  );
};

export default MainLayout;

