'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ShoppingBag, Star, ChevronDown, ChevronUp, MapPin, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'معلق', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
  confirmed: { label: 'مؤكد', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
  shipped:   { label: 'في الطريق', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
  delivered: { label: 'مُسلَّم', color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
  collected: { label: 'محصّل', color: 'bg-teal-50 text-teal-600' },
  available: { label: 'متاح للسحب', color: 'bg-green-50 text-green-600' },
  cancelled: { label: 'ملغى', color: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [ratingOrder, setRatingOrder] = useState<string | null>(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingHover, setRatingHover] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingDone, setRatingDone] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      // تحقق من التقييمات الموجودة
      const { data: ratings } = await supabase
        .from('seller_ratings')
        .select('order_id')
        .eq('buyer_id', user.id)

      setOrders(data ?? [])
      setRatingDone(ratings?.map(r => r.order_id) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function submitRating(order: any) {
    if (ratingValue === 0) { toast.error('اختر تقييماً'); return }
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('seller_ratings').insert({
      seller_id: order.seller_id,
      buyer_id: user.id,
      order_id: order.id,
      rating: ratingValue,
      comment: ratingComment.trim() || null,
    })

    if (error) { toast.error('خطأ: ' + error.message) }
    else {
      toast.success('تم إرسال تقييمك ✅')
      setRatingDone(prev => [...prev, order.id])
      setRatingOrder(null)
      setRatingValue(0)
      setRatingComment('')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-4 px-4 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">طلباتي</h1>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-8 text-center">
            <ShoppingBag size={40} className="text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">لا توجد طلبات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => {
              const s = STATUS_LABELS[o.status] ?? { label: o.status, color: 'bg-neutral-100 text-neutral-500' }
              const isExpanded = expanded === o.id
              const items = Array.isArray(o.items) ? o.items : []
              const canRate = o.status === 'delivered' && !ratingDone.includes(o.id)
              const isRating = ratingOrder === o.id

              return (
                <div key={o.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-neutral-900 dark:text-white">#{o.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{new Date(o.created_at).toLocaleDateString('ar-MA')}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-xl ${s.color}`}>{s.label}</span>
                    <p className="font-bold text-sm text-neutral-900 dark:text-white">{o.total?.toLocaleString()} د.م.</p>
                    <button onClick={() => setExpanded(isExpanded ? null : o.id)} className="text-neutral-400 p-1">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-neutral-50 dark:border-neutral-800 px-4 py-3 space-y-3">
                      {items.length > 0 && (
                        <div className="space-y-1.5">
                          {items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2">
                              <span className="text-neutral-700 dark:text-neutral-300">{item.name} × {item.quantity}</span>
                              <span className="font-medium text-neutral-900 dark:text-white">{item.total?.toLocaleString()} د.م.</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {o.shipping_address && (
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <MapPin size={12} />{o.shipping_address}
                        </div>
                      )}

                      {/* زر تقييم البائع */}
                      {canRate && !isRating && (
                        <button onClick={() => setRatingOrder(o.id)}
                          className="w-full py-2.5 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-sm font-medium rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center justify-center gap-2">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          قيّم البائع
                        </button>
                      )}

                      {ratingDone.includes(o.id) && (
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
                          <Star size={12} className="fill-green-500 text-green-500" />
                          تم تقييم البائع ✅
                        </div>
                      )}

                      {/* نموذج التقييم */}
                      {isRating && (
                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4 space-y-3">
                          <p className="font-semibold text-sm text-neutral-900 dark:text-white">قيّم البائع</p>
                          <div className="flex justify-center gap-2">
                            {[1,2,3,4,5].map(star => (
                              <button key={star} type="button"
                                onClick={() => setRatingValue(star)}
                                onMouseEnter={() => setRatingHover(star)}
                                onMouseLeave={() => setRatingHover(0)}>
                                <Star size={32}
                                  className={`transition-colors ${star <= (ratingHover || ratingValue) ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`} />
                              </button>
                            ))}
                          </div>
                          <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 outline-none resize-none"
                            rows={2} placeholder="تعليقك (اختياري)..." />
                          <div className="flex gap-2">
                            <button onClick={() => submitRating(o)} disabled={submitting || ratingValue === 0}
                              className="flex-1 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-xl disabled:opacity-40">
                              {submitting ? '...' : 'إرسال التقييم'}
                            </button>
                            <button onClick={() => setRatingOrder(null)}
                              className="px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm rounded-xl">
                              إلغاء
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}