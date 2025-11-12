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
import { adminCredentialService, supabase } from "@/services";
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
const ADMIN_CACHE_KEY = "elsa_admin_cache";

// Caché del estado de admin para evitar consultas repetidas
const adminCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

const persistUser = (nextUser: AuthUser | null) => {
  if (!nextUser) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
};

const getAdminStatusFromCache = (email: string): boolean | null => {
  // Intentar obtener del caché en memoria
  const cached = adminCache.get(email);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.isAdmin;
  }

  // Intentar obtener del localStorage
  try {
    const stored = localStorage.getItem(ADMIN_CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.email === email && Date.now() - parsed.timestamp < CACHE_DURATION) {
        adminCache.set(email, { isAdmin: parsed.isAdmin, timestamp: parsed.timestamp });
        return parsed.isAdmin;
      }
    }
  } catch {
    // Si hay error al parsear, ignorar
  }

  return null;
};

const setAdminStatusCache = (email: string, isAdmin: boolean) => {
  const cacheEntry = { isAdmin, timestamp: Date.now() };
  adminCache.set(email, cacheEntry);
  
  try {
    localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({ email, ...cacheEntry }));
  } catch {
    // Si hay error al guardar, ignorar
  }
};

const clearAdminCache = () => {
  adminCache.clear();
  try {
    localStorage.removeItem(ADMIN_CACHE_KEY);
  } catch {
    // Si hay error, ignorar
  }
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
  session: Session | null,
  isAdminOverride?: boolean
): Promise<AuthUser | null> => {
  const email = session?.user.email;

  if (!session || !email) {
    return null;
  }

  let isAdmin = false;

  if (typeof isAdminOverride === "boolean") {
    isAdmin = isAdminOverride;
    // Guardar en caché el estado de admin verificado
    setAdminStatusCache(email, isAdmin);
  } else {
    // Intentar obtener del caché primero
    const cachedStatus = getAdminStatusFromCache(email);
    
    if (cachedStatus !== null) {
      isAdmin = cachedStatus;
    } else {
      // Si no hay caché, consultar la base de datos
      try {
        const timeoutPromise = new Promise<boolean>((_, reject) => {
          setTimeout(() => reject(new Error('Admin check timeout')), 15000);
        });

        const adminCheckPromise = adminCredentialService.hasAdminAccess(email);

        isAdmin = await Promise.race([adminCheckPromise, timeoutPromise]);
        
        // Guardar en caché el resultado
        setAdminStatusCache(email, isAdmin);
      } catch (error) {
        if (error instanceof Error && error.message === 'Admin check timeout') {
          console.warn('Admin access check timed out, assuming non-admin for now');
        } else {
          console.error('Error checking admin access:', error);
        }
        isAdmin = false;
      }
    }
  }

  return {
    email,
    isAdmin,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    isInitializedRef.current = true;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Auth timeout')), 10000);
        });

        const authPromise = supabase.auth.getSession();

        const { data, error } = await Promise.race([
          authPromise,
          timeoutPromise,
        ]);

        if (error) {
          throw error;
        }

        if (data.session) {
          const nextUser = await mapSessionToUser(data.session);

          if (isMountedRef.current) {
            setUser(nextUser);
            persistUser(nextUser);
          }
        } else {
          if (isMountedRef.current) {
            setUser(null);
            persistUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMountedRef.current) {
          setUser(null);
          persistUser(null);
          clearAdminCache();
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    void initializeAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          // Ignorar errores de refresh token inválido
          if (event === 'SIGNED_OUT' || !session) {
            if (isMountedRef.current) {
              setUser(null);
              persistUser(null);
              clearAdminCache();
            }
            return;
          }

          const nextUser = await mapSessionToUser(session);

          if (isMountedRef.current) {
            setUser(nextUser);
            persistUser(nextUser);
          }
        } catch (error) {
          // Manejar errores de refresh token silenciosamente
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isRefreshTokenError = 
            errorMessage.includes('Refresh Token') ||
            errorMessage.includes('Invalid Refresh Token') ||
            errorMessage.includes('refresh_token');

          if (!isRefreshTokenError) {
            console.error('Auth state change error:', error);
          }

          if (isMountedRef.current) {
            setUser(null);
            persistUser(null);
            clearAdminCache();
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

        const isAdminAccount = await adminCredentialService.hasAdminAccess(
          email
        );

        if (isAdminAccount) {
          const { data: verificationResult, error: verificationError } =
            await supabase.rpc("verify_admin", {
              email_input: email,
              password_input: password,
            });

          const isValid = Boolean(verificationResult);

          if (verificationError || !isValid) {
            await supabase.auth.signOut();

            return {
              success: false,
              message:
                "Las credenciales no son válidas. Verifica tu email y contraseña.",
            };
          }
        }

        const nextUser = await mapSessionToUser(data.session, isAdminAccount);
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
    try {
      setUser(null);
      persistUser(null);
      clearAdminCache();
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Logout timeout')), 3000);
      });

      const logoutPromise = supabase.auth.signOut();

      await Promise.race([logoutPromise, timeoutPromise]);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setUser(null);
      persistUser(null);
      clearAdminCache();
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
