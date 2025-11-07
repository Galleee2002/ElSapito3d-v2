import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "elsa_admin_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Implementar autenticación real con backend/Supabase
      // Por ahora, cualquier usuario puede iniciar sesión
      // En producción, esto debería validar contra una base de datos
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const newUser: User = {
        email,
        isAdmin: true,
      };
      
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      return true;
    } catch {
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Implementar registro real con backend/Supabase
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const newUser: User = {
        email,
        isAdmin: true,
      };
      
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

