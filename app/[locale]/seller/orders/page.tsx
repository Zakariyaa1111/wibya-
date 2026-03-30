'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag } from 'lucide-react'
import { useRouter } from '@/lib/i18n/navigation'

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: 'معلق', color: 'bg-amber-50 text-amber-600' },
    confirmed: { label: 'مؤكد', color: 'bg-blue-50 text-blue-600' },
    shipped: { label: 'في الطريق', color: 'bg-purple-50 text-purple-600' },
    delivered: { label: 'مُسلَّم', color: 'bg-green-50 text-green-600' },
    cancelled: { label: 'ملغى', color: 'bg-red-50 text-red-600' },
  }

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <h1 className="text-xl font-bold text-neutral-900 mb-6">الطلبات</h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag size={40} className="text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          {orders.map(o => {
            const s = statusLabel[o.status] ?? { label: o.status, color: 'bg-neutral-100 text-neutral-500' }
            return (
              <div key={o.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-50 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-sm text-neutral-900">#{o.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{new Date(o.created_at).toLocaleDateString('ar-MA')}</p>
                </div>
                <p className="font-bold text-sm text-neutral-900">{o.total?.toLocaleString()} د.م.</p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-xl ${s.color}`}>{s.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}