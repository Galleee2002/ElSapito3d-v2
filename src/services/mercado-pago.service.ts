import { supabase } from "./supabase";

interface CreatePreferenceRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  amount: number;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    selectedColors?: Array<{
      name: string;
      code: string;
    }>;
  }>;
  product_id?: string;
  order_id?: string;
}

interface CreatePreferenceResponse {
  success: boolean;
  preference: {
    id: string;
    init_point: string;
    sandbox_init_point?: string;
  };
  payment: {
    id: string;
    mp_preference_id: string;
    mp_external_reference: string;
  };
}

class MercadoPagoService {
  async createPaymentPreference(
    request: CreatePreferenceRequest
  ): Promise<CreatePreferenceResponse> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configurados");
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || supabaseAnonKey;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/create-payment-preference`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
      throw new Error(
        errorData.error || `Error al crear la preferencia de pago: ${response.statusText}`
      );
    }

    return await response.json();
  }

  redirectToCheckout(initPoint: string): void {
    window.location.href = initPoint;
  }
}

export const mercadoPagoService = new MercadoPagoService();

