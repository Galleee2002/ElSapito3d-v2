import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
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

const mapSessionToUser = async (
  session: Session | null
): Promise<AuthUser | null> => {
  const email = session?.user.email;

  if (!session || !email) {
    return null;
  }

  try {
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), 3000);
    });

    const rpcPromise = supabase.rpc("is_admin").then(({ data, error }) => {
      return !error && Boolean(data);
    });

    const isAdmin = await Promise.race([rpcPromise, timeoutPromise]);

    return {
      email,
      isAdmin,
    };
  } catch {
    return {
      email,
      isAdmin: false,
    };
  }
};

const loadStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem(STORAGE_KEY);
  if (!storedUser) {
    return null;
  }

  try {
    const parsed: AuthUser = JSON.parse(storedUser) as AuthUser;
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const storedUser = loadStoredUser();
  const [user, setUser] = useState<AuthUser | null>(storedUser);
  const [isLoading] = useState(false);
  const isMountedRef = useRef(true);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    isInitializedRef.current = true;

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        const nextUser = await mapSessionToUser(data.session);

        if (isMountedRef.current) {
          setUser(nextUser);
          persistUser(nextUser);
        }
      } catch {
        if (isMountedRef.current) {
          setUser(null);
          persistUser(null);
        }
      }
    };

    void initializeAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          const nextUser = await mapSessionToUser(session);

          if (isMountedRef.current) {
            setUser(nextUser);
            persistUser(nextUser);
          }
        } catch {
          if (isMountedRef.current) {
            setUser(null);
            persistUser(null);
          }
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const nextUser = await mapSessionToUser(data.session);
    setUser(nextUser);
    persistUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const { data: verificationResult, error: verificationError } =
          await supabase.rpc("verify_admin", {
            email_input: email,
            password_input: password,
          });

        const isValid = Boolean(verificationResult);

        if (verificationError || !isValid) {
          return {
            success: false,
            message:
              "Las credenciales no son válidas. Verifica tu email y contraseña.",
          };
        }

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

        const nextUser = await mapSessionToUser(data.session);
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

        const nextUser = await mapSessionToUser(data.session);
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
    await supabase.auth.signOut();
    setUser(null);
    persistUser(null);
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
    [user, isLoading]
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
