import { createClient } from '@/lib/supabase/server'
import { SellerDashboard } from '@/components/seller/SellerDashboard'

export default async function SellerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: products }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single() as any,
    supabase.from('products').select('id,name,price,status,views_count,created_at')
      .eq('seller_id', user!.id).order('created_at', { ascending: false }).limit(5) as any,
    supabase.from('orders').select('id,total,status,created_at')
      .eq('seller_id', user!.id).order('created_at', { ascending: false }).limit(10) as any,
  ])

  const stats = {
    totalSales: (orders as any[])?.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + (o.total ?? 0), 0) ?? 0,
    pendingOrders: (orders as any[])?.filter((o: any) => o.status === 'pending').length ?? 0,
    activeProducts: (products as any[])?.filter((p: any) => p.status === 'active').length ?? 0,
    totalViews: (products as any[])?.reduce((s: number, p: any) => s + (p.views_count ?? 0), 0) ?? 0,
  }

  return <SellerDashboard profile={profile} products={products ?? []} orders={orders ?? []} stats={stats} />
}
