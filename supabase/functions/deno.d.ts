/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export interface SupabaseClientOptions {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
    };
  }

  export function createClient(
    url: string,
    key: string,
    options?: SupabaseClientOptions
  ): {
    auth: {
      admin: {
        createUser(params: {
          email: string;
          password: string;
          email_confirm?: boolean;
          user_metadata?: Record<string, unknown>;
        }): Promise<{
          data: {
            user: {
              id?: string;
              email?: string;
              user_metadata?: Record<string, unknown>;
            } | null;
          };
          error: { message: string } | null;
        }>;
        listUsers(): Promise<{
          data: {
            users: Array<{
              id: string;
              email?: string;
              user_metadata?: Record<string, unknown>;
            }>;
          };
          error: { message: string } | null;
        }>;
        updateUserById(
          userId: string,
          params: {
            email?: string;
            password?: string;
            email_confirm?: boolean;
            user_metadata?: Record<string, unknown>;
          }
        ): Promise<{
          data: {
            user: {
              id?: string;
              email?: string;
              user_metadata?: Record<string, unknown>;
            } | null;
          };
          error: { message: string } | null;
        }>;
      };
      getUser(token: string): Promise<{
        data: {
          user: {
            id?: string;
            email?: string;
            user_metadata?: Record<string, unknown>;
          } | null;
        };
        error: { message: string } | null;
      }>;
    };
  };
}