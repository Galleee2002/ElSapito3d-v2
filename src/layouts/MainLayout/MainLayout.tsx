import type { ReactNode } from "react";
import { Navbar } from "@/components";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-bg text-text-main">
      <Navbar />
      {children}
    </div>
  );
};

export default MainLayout;


