import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  const [
    { count: usersCount },
    { count: productsCount },
    { count: ordersCount },
    { count: pendingCount },
    { count: flagsCount },
    { data: pendingProducts },
    { data: recentOrders },
    { data: flags },
    { data: pendingSellers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('moderation_flags').select('*', { count: 'exact', head: true }).eq('resolved', false),
    supabase.from('products').select('id,name,price,seller_id,created_at,profiles(store_name)')
      .eq('status', 'pending').order('created_at', { ascending: false }).limit(10),
    supabase.from('orders').select('id,total,status,created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('moderation_flags').select('*,products(name)').eq('resolved', false).limit(10),
    supabase.from('profiles').select('*').eq('role', 'seller').eq('approved', false).limit(10),
  ] as any[])

  return (
    <AdminDashboard
      stats={{ usersCount, productsCount, ordersCount, pendingCount, flagsCount }}
      pendingProducts={(pendingProducts as any[]) ?? []}
      recentOrders={(recentOrders as any[]) ?? []}
      flags={(flags as any[]) ?? []}
      pendingSellers={(pendingSellers as any[]) ?? []}
    />
  )
}
