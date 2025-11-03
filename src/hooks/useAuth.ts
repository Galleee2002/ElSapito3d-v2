import { useState, useEffect } from "react";
import { supabase } from "@/services";
import type { User } from "@supabase/supabase-js";
import type { AuthState, AuthMessage } from "@/types";

interface UseAuthReturn extends AuthState {
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  message: AuthMessage;
  clearMessage: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AuthMessage>({ text: "", type: "" });

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    setMessage({ text: "", type: "" });
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw error;
    }

    setMessage({
      text: "Cuenta creada! Revisa tu email para confirmar (o inicia sesión si desactivaste la confirmación)",
      type: "success",
    });
  };

  const signIn = async (email: string, password: string) => {
    setMessage({ text: "", type: "" });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    setMessage({ text: "Sesión iniciada correctamente", type: "success" });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Sesión cerrada", type: "error" });
    }
  };

  const clearMessage = () => {
    setMessage({ text: "", type: "" });
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    message,
    clearMessage,
  };
};

