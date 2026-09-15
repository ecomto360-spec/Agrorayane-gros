export type Role = 'CLIENT' | 'COMMERCIAL' | 'GERANT';
export type OrderStatus = 'PENDING' | 'APPROVED' | 'SHIPPED';

export interface Category {
  id: string;
  name_fr: string;
  name_ar: string;
}

export interface Product {
  id: string;
  category_id: string;
  ref: string;
  title_fr: string;
  title_ar: string;
  description_fr?: string;
  description_ar?: string;
  image_url: string | null;
  youtube_url: string | null;
  is_available: boolean;
  price: number;
  stock_quantity_mock?: number; // Only used internally for the commercial view, not in DB client schema
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  requested_qty: number;
  approved_qty: number | null;
  product?: Product;
}

export interface Order {
  id: string;
  client_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
  client_name?: string;
}
