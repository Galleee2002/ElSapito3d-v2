import { createContext, useContext, useState, ReactNode } from "react";

type AuthMode = "login" | "register" | null;

interface AuthModalContextType {
  isOpen: boolean;
  mode: AuthMode;
  openModal: (mode: "login" | "register") => void;
  closeModal: () => void;
  switchMode: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>(null);

  const openModal = (newMode: "login" | "register") => {
    setMode(newMode);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setMode(null), 200);
  };

  const switchMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  return (
    <AuthModalContext.Provider
      value={{ isOpen, mode, openModal, closeModal, switchMode }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
};

