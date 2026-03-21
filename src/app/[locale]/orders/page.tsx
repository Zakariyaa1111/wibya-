'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ArrowRight, Package } from 'lucide-react'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  pending: 'انتظار', confirmed: 'مؤكد',
  shipped: 'في الشحن', delivered: 'تم التسليم', cancelled: 'ملغى'
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const supabase = createClient()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase
        .from('orders')
        .select('id,total,status,created_at,quantity,shipping_address,products(name,images)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false }) as any
      setOrders(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function rateOrder(orderId: string, productId: string) {
    const stars = prompt('تقييمك من 1 إلى 5:')
    if (!stars || isNaN(Number(stars)) || Number(stars) < 1 || Number(stars) > 5) return
    const comment = prompt('تعليق (اختياري):') || ''
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('product_reviews').insert({
      product_id: productId, buyer_id: user!.id,
      order_id: orderId, stars: parseInt(stars), comment
    }) as any
    alert('شكراً على تقييمك!')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />
      <main className="pb-24 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 mb-4">
          <button onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-neutral-100 hover:bg-neutral-50 transition-colors">
            <ArrowRight size={18} className="text-neutral-700 rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-neutral-900">طلباتي</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="text-4xl mb-4">🛒</div>
            <h2 className="font-semibold text-neutral-900 mb-2">لا توجد طلبات بعد</h2>
            <p className="text-neutral-400 text-sm mb-6">ابدأ بتصفح المنتجات</p>
            <Link href="/"
              className="px-6 py-3 bg-neutral-900 text-white rounded-2xl font-semibold text-sm">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="px-4 space-y-3">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-2xl border border-neutral-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                      <Package size={18} className="text-neutral-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 text-sm">
                        طلب #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {(order.products as any)?.name ?? 'منتج'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div className="text-xs text-neutral-400">
                    الكمية: {order.quantity ?? 1} · دفع عند الاستلام
                  </div>
                  <p className="font-bold text-neutral-900">
                    {(order.total ?? 0).toLocaleString()} د.م.
                  </p>
                </div>

                {order.status === 'delivered' && (order.products as any)?.id && (
                  <button
                    onClick={() => rateOrder(order.id, (order.products as any).id)}
                    className="mt-3 w-full py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
                    ⭐ تقييم المنتج
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
