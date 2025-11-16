export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at?: string
  products?: Product
}

export interface CartItemWithProduct extends CartItem {
  products: Product
}

export interface Order {
  id: string
  user_id: string
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  stripe_payment_intent_id?: string
  created_at?: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  products?: Product
}

