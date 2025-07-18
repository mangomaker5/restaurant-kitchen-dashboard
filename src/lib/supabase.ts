import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type OrderItem = {
  id: number
  order_uuid: string
  table_number: number
  menu_item_id: string
  item_name: string
  quantity: number
  item_price: number
  subtotal: number
  created_at: string
}

export type CompletedOrder = OrderItem & {
  completed_at: string
}

export type GroupedOrder = {
  order_uuid: string
  table_number: number
  items: OrderItem[]
  total: number
  created_at: string
  item_count: number
}