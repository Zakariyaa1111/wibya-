import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Package, ShoppingBag, Wallet, Eye, TrendingUp, Star, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'لوحة البائع | Wibya' }

export default async function SellerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { data: products },
    { data: orders },
    { data: profile },
    { data: ratings },
  ] = await Promise.all([
    supabase.from('products').select('id,status,views_count,price').eq('seller_id', user.id),
    supabase.from('orders').select('id,status,total,created_at').eq('seller_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('full_name,store_name,wallet_balance,total_sales,commission_rate').eq('id', user.id).single(),
    supabase.from('seller_ratings').select('rating').eq('seller_id', user.id),
  ])

  const activeProducts = products?.filter(p => p.status === 'active').length ?? 0
  const totalViews = products?.reduce((s, p) => s + (p.views_count || 0), 0) ?? 0
  const pendingOrders = orders?.filter(o => o.status === 'pending').length ?? 0
  const avgRating = ratings?.length
    ? (ratings.reduce((s, r) => s + (r.rating || 0), 0) / ratings.length).toFixed(1)
    : '—'

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: 'معلق', color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-700' },
    shipped: { label: 'في الطريق', color: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'مُسلَّم', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'ملغى', color: 'bg-red-100 text-red-700' },
  }

  const stats = [
    { label: 'منتجات نشطة', value: activeProducts, icon: Package, color: 'bg-blue-50 text-blue-600', href: '/seller/products' },
    { label: 'طلبات معلقة', value: pendingOrders, icon: ShoppingBag, color: 'bg-orange-50 text-orange-600', href: '/seller/orders' },
    { label: 'إجمالي المشاهدات', value: totalViews.toLocaleString(), icon: Eye, color: 'bg-purple-50 text-purple-600', href: '/seller/analytics' },
    { label: 'المحفظة', value: `${(profile?.wallet_balance ?? 0).toLocaleString()} د.م.`, icon: Wallet, color: 'bg-green-50 text-green-600', href: '/seller/wallet' },
    { label: 'إجمالي المبيعات', value: `${(profile?.total_sales ?? 0).toLocaleString()} د.م.`, icon: TrendingUp, color: 'bg-brand-50 text-brand-600', href: '/seller/analytics' },
    { label: 'متوسط التقييم', value: `${avgRating} ⭐`, icon: Star, color: 'bg-yellow-50 text-yellow-600', href: '/seller/ratings' },
  ]

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-neutral-900">
          مرحباً {profile?.store_name || profile?.full_name || 'بائع'} 👋
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          عمولتك: {profile?.commission_rate ?? 10}% · مراجعة Wibya
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <div className="bg-white rounded-2xl p-4 border border-neutral-100 hover:border-neutral-200 transition-all hover:shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={17} />
              </div>
              <p className="text-xl font-bold text-neutral-900">{value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-7">
        <Link href="/seller/new-product" className="btn-primary justify-center py-3.5">
          <Package size={17} />
          إضافة منتج
        </Link>
        <Link href="/seller/orders" className="btn-outline justify-center py-3.5">
          <ShoppingBag size={17} />
          الطلبات
        </Link>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-50">
          <h2 className="font-semibold text-neutral-900 text-sm">آخر الطلبات</h2>
          <Link href="/seller/orders" className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700">
            عرض الكل <ArrowUpRight size={13} />
          </Link>
        </div>
        {!orders || orders.length === 0 ? (
          <div className="px-5 py-10 text-center text-neutral-400 text-sm">لا توجد طلبات بعد</div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {orders.map(order => {
              const s = statusLabel[order.status] ?? { label: order.status, color: 'bg-neutral-100 text-neutral-600' }
              return (
                <div key={order.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {(order.total ?? 0).toLocaleString()} د.م.
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('ar-MA')}
                    </p>
                  </div>
                  <span className={`badge text-xs ${s.color}`}>{s.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
