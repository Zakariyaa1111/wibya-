'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { TrendingUp, Eye, ShoppingBag, Star, Package } from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: products }, { data: orders }, { data: ratings }] = await Promise.all([
        supabase.from('products').select('id, name, status, views_count, price, clicks_count').eq('seller_id', user.id),
        supabase.from('orders').select('total, status, created_at').eq('seller_id', user.id),
        supabase.from('seller_ratings').select('rating').eq('seller_id', user.id),
      ])

      const totalViews = products?.reduce((s, p) => s + (p.views_count || 0), 0) ?? 0
      const totalRevenue = orders?.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0) ?? 0
      const avgRating = ratings?.length ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : '—'
      const topProducts = [...(products ?? [])].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5)

      setData({ products, orders, totalViews, totalRevenue, avgRating, topProducts })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="p-8 pt-20 lg:pt-8 flex justify-center"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">الإحصائيات</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'إجمالي المشاهدات', value: data?.totalViews?.toLocaleString(), icon: Eye, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
          { label: 'إجمالي الإيرادات', value: `${data?.totalRevenue?.toLocaleString()} د.م.`, icon: TrendingUp, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
          { label: 'عدد الطلبات', value: data?.orders?.length ?? 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { label: 'متوسط التقييم', value: `${data?.avgRating} ⭐`, icon: Star, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}><Icon size={16} /></div>
            <p className="text-xl font-bold text-neutral-900 dark:text-white">{value}</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Top products */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">أكثر المنتجات مشاهدة</h2>
        </div>
        {data?.topProducts?.length === 0
          ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد بيانات بعد</p>
          : data?.topProducts?.map((p: any, i: number) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
              <span className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500">{i + 1}</span>
              <Package size={14} className="text-neutral-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{p.name}</p>
                <p className="text-xs text-neutral-400">{p.price?.toLocaleString()} د.م.</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Eye size={12} />
                {p.views_count || 0}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}