export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category?: string
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
  updated_at?: string
  order_items?: OrderItem[]
  shipping_address?: UserAddress
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  products?: Product
}

export interface UserProfile {
  id: string
  full_name?: string
  phone?: string
  created_at?: string
  updated_at?: string
}

export interface UserAddress {
  id: string
  user_id: string
  is_default: boolean
  label?: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  created_at?: string
  updated_at?: string
}

export interface WishlistItem {
  id: string
  user_id: string
  item_id: string
  item_name: string
  created_at?: string
  products?: Product
}

export interface WishlistItemWithProduct extends WishlistItem {
  products: Product
}
