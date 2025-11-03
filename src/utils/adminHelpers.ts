import type { User } from "@supabase/supabase-js";
import { ADMIN_EMAILS } from "@/constants/admin";

export const isAdmin = (user: User | null): boolean => {
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
};
