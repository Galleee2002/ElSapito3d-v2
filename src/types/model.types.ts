export interface Model {
  id: string;
  name: string;
  description: string;
  category: string;
  material: string;
  price: number;
  print_time: number;
  image_url?: string;
  image_urls?: string[];
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface ModelFormData {
  name: string;
  description: string;
  category: string;
  material: string;
  price: string;
  print_time: string;
  image_urls: string[];
  is_public: boolean;
}
