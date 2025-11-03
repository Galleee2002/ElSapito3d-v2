import { User } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export interface AuthMessage {
  text: string;
  type: "success" | "error" | "";
}

export type AuthMode = "login" | "signup";
