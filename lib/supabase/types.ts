export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type UserRole = 'buyer' | 'seller' | 'advertiser' | 'admin'
export type ProductStatus = 'pending' | 'active' | 'rejected' | 'sold'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type AdStatus = 'pending' | 'active' | 'rejected' | 'expired'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          store_name: string | null
          store_desc: string | null
          store_image: string | null
          phone: string | null
          whatsapp: string | null
          city: string | null
          approved: boolean
          verified: boolean
          is_premium: boolean
          premium_until: string | null
          product_limit: number
          commission_rate: number
          wallet_balance: number
          total_sales: number
          referral_code: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      products: {
        Row: {
          id: string
          seller_id: string
          name: string
          description: string | null
          price: number
          original_price: number | null
          quantity: number
          category: string | null
          condition: 'new' | 'used' | 'refurbished'
          images: string[]
          city: string | null
          status: ProductStatus
          views_count: number
          is_featured: boolean
          embedding: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at' | 'views_count'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      ads: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          price: number | null
          price_negotiable: boolean
          city: string | null
          phone: string | null
          whatsapp: string | null
          images: string[]
          status: AdStatus
          is_vip: boolean
          views_count: number
          embedding: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ads']['Row'], 'id' | 'created_at' | 'views_count'>
        Update: Partial<Database['public']['Tables']['ads']['Insert']>
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          product_id: string
          quantity: number
          total: number
          status: OrderStatus
          shipping_address: Json
          tracking_number: string | null
          carrier: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          product_id: string | null
          content: string
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Views: {}
    Functions: {
      search_products: {
        Args: { query_embedding: string; match_count: number; filter_city?: string }
        Returns: { id: string; similarity: number }[]
      }
      search_ads: {
        Args: { query_embedding: string; match_count: number }
        Returns: { id: string; similarity: number }[]
      }
    }
    Enums: {}
  }
}
