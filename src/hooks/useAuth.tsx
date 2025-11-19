import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/services";
import { AuthResponse, AuthUser } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<AuthResponse>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "elsa_admin_user";

const persistUser = (nextUser: AuthUser | null) => {
  if (!nextUser) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
};

const mapSupabaseErrorMessage = (message?: string): string => {
  if (!message) {
    return "Ocurrió un error inesperado. Intenta nuevamente.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Las credenciales no son válidas. Verifica tu email y contraseña.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Debes confirmar tu correo electrónico antes de continuar.";
  }

  if (normalized.includes("user already registered")) {
    return "Ya existe una cuenta con ese correo electrónico.";
  }

  if (normalized.includes("password")) {
    return "La contraseña no cumple con los requisitos mínimos.";
  }

  return "No pudimos completar la acción. Intenta nuevamente.";
};

const mapSessionToUser = (session: Session | null): AuthUser | null => {
  const email = session?.user.email;

  if (!session || !email) {
    return null;
  }

  // Fuente única de verdad: user_metadata
  const isAdmin = Boolean(session.user.user_metadata?.is_admin);

  return {
    email,
    isAdmin,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          const nextUser = mapSessionToUser(data.session);

          if (isActive) {
            setUser(nextUser);
            persistUser(nextUser);
          }
        } else if (isActive) {
          setUser(null);
          persistUser(null);
        }
      } catch {
        if (isActive) {
          setUser(null);
          persistUser(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void initializeAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          if (isActive) {
            setUser(null);
            persistUser(null);
          }
          return;
        }

        const nextUser = mapSessionToUser(session);

        if (isActive) {
          setUser(nextUser);
          persistUser(nextUser);
        }
      }
    );

    return () => {
      isActive = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const nextUser = mapSessionToUser(data.session);
    setUser(nextUser);
    persistUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return {
            success: false,
            message: mapSupabaseErrorMessage(error.message),
          };
        }

        const nextUser = mapSessionToUser(data.session);
        setUser(nextUser);
        persistUser(nextUser);

        return {
          success: true,
          user: nextUser,
        };
      } catch {
        return {
          success: false,
          message: "No pudimos iniciar sesión. Intenta nuevamente.",
        };
      }
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          return {
            success: false,
            message: mapSupabaseErrorMessage(error.message),
          };
        }

        const requiresEmailVerification = !data.session;

        const nextUser = mapSessionToUser(data.session);
        setUser(nextUser);
        persistUser(nextUser);

        return {
          success: true,
          user: nextUser,
          requiresEmailVerification,
          message: requiresEmailVerification
            ? "Revisa tu correo electrónico para confirmar la cuenta."
            : undefined,
        };
      } catch {
        return {
          success: false,
          message: "No pudimos crear la cuenta. Intenta nuevamente.",
        };
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      setUser(null);
      persistUser(null);
      
      await supabase.auth.signOut();
    } catch {
      // Error silenciado - no crítico
    } finally {
      setUser(null);
      persistUser(null);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      register,
      refreshSession,
    }),
    [user, isLoading, login, logout, register, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
