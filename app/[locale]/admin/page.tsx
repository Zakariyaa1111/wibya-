import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/ar/auth/login?redirect=/ar/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/ar')

  // جلب الإحصائيات
  const [
    { count: usersCount },
    { count: productsCount },
    { count: ordersCount },
    { count: pendingCount },
    { count: flagsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('moderation_flags').select('*', { count: 'exact', head: true }).eq('resolved', false),
  ])

  // جلب المنتجات المعلقة
  const { data: pendingProducts } = await supabase
    .from('products')
    .select('*, profiles(store_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10)
    .returns<any[]>()

  // جلب آخر الطلبات
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
    .returns<any[]>()

  // جلب البلاغات
  const { data: flags } = await supabase
    .from('moderation_flags')
    .select('*, products(name)')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(10)
    .returns<any[]>()

  // جلب البائعين المعلقين
  const { data: pendingSellers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'seller')
    .eq('approved', false)
    .limit(10)
    .returns<any[]>()

  const stats = {
    usersCount: usersCount ?? 0,
    productsCount: productsCount ?? 0,
    ordersCount: ordersCount ?? 0,
    pendingCount: pendingCount ?? 0,
    flagsCount: flagsCount ?? 0,
  }

  return (
    <AdminDashboard
      stats={stats}
      pendingProducts={pendingProducts ?? []}
      recentOrders={recentOrders ?? []}
      flags={flags ?? []}
      pendingSellers={pendingSellers ?? []}
    />
  )
}