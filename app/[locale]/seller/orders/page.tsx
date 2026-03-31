'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, FileText, ChevronDown, ChevronUp, Package, MapPin, CreditCard } from 'lucide-react'
import { useRouter } from '@/lib/i18n/navigation'
import { generateInvoicePDF } from '@/lib/pdf/invoice'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { label: string; color: string; walletLabel?: string; walletColor?: string }> = {
  pending:   { label: 'معلق', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
  confirmed: { label: 'مؤكد', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
  shipped:   { label: 'في الطريق', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
  delivered: {
    label: 'مُسلَّم',
    color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    walletLabel: '⏳ ضمان المشتري نشط',
    walletColor: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  },
  collected: {
    label: 'محصّل',
    color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
    walletLabel: '🏦 تحويل للمنصة',
    walletColor: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  },
  available: {
    label: 'متاح للسحب',
    color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    walletLabel: '✅ متاح في المحفظة',
    walletColor: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  },
  cancelled: { label: 'ملغى', color: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' },
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const [{ data: o }, { data: p }] = await Promise.all([
        supabase.from('orders').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('full_name, store_name, email, city, phone, commission_rate').eq('id', user.id).single(),
      ])
      setOrders(o ?? [])
      setProfile(p)
      setLoading(false)
    }
    load()
  }, [])

  async function handleGeneratePDF(order: any) {
    setGeneratingPdf(order.id)
    try {
      const supabase = createClient()
      // جلب بيانات المشتري
      const { data: buyer } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', order.buyer_id)
        .single()

      const items = Array.isArray(order.items) ? order.items : []
      const commissionRate = profile?.commission_rate ?? 6
      const subtotal = order.subtotal || order.total
      const commission = Math.round(subtotal * commissionRate / 100)

      generateInvoicePDF({
        orderId: order.id,
        orderDate: new Date(order.created_at).toLocaleDateString('fr-MA'),
        status: order.status,
        sellerName: profile?.full_name || '—',
        sellerStoreName: profile?.store_name || profile?.full_name || '—',
        sellerEmail: profile?.email || '—',
        sellerCity: profile?.city || '—',
        sellerPhone: profile?.phone,
        buyerName: buyer?.full_name || '—',
        buyerEmail: buyer?.email || '—',
        shippingAddress: order.shipping_address,
        items: items.length > 0 ? items : [{ name: 'منتج', quantity: 1, price: order.total, total: order.total }],
        subtotal,
        commission,
        commissionRate,
        total: order.total - commission,
        paymentMethod: order.payment_method,
        trackingNumber: order.tracking_number,
      })
      toast.success('تم توليد الفاتورة ✅')
    } catch (err) {
      toast.error('خطأ في توليد الفاتورة')
    }
    setGeneratingPdf(null)
  }

  if (loading) return (
    <div className="p-8 pt-20 lg:pt-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">الطلبات</h1>

      {/* دليل حالات المحفظة */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 mb-6">
        <h2 className="font-semibold text-sm text-neutral-900 dark:text-white mb-3">حالات الدفع</h2>
        <div className="space-y-2">
          {[
            { icon: '📦', label: 'مُسلَّم (Delivered)', desc: 'المشتري استلم المنتج · عداد ضمان الاسترجاع نشط' },
            { icon: '🏦', label: 'محصّل (Collected)', desc: 'شركة الشحن حولت المبلغ للمنصة' },
            { icon: '✅', label: 'متاح للسحب (Available)', desc: 'الرصيد متاح في محفظتك' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="text-lg">{icon}</span>
              <div>
                <p className="text-xs font-medium text-neutral-900 dark:text-white">{label}</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag size={40} className="text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const s = STATUS_CONFIG[o.status] ?? { label: o.status, color: 'bg-neutral-100 text-neutral-500' }
            const isExpanded = expanded === o.id
            const items = Array.isArray(o.items) ? o.items : []

            return (
              <div key={o.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                      #{o.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {new Date(o.created_at).toLocaleDateString('ar-MA')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-xl ${s.color}`}>{s.label}</span>
                    {s.walletLabel && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${s.walletColor}`}>{s.walletLabel}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ms-2">
                    <p className="font-bold text-sm text-neutral-900 dark:text-white">{o.total?.toLocaleString()} د.م.</p>
                    <button onClick={() => setExpanded(isExpanded ? null : o.id)} className="text-neutral-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-neutral-50 dark:border-neutral-800 px-4 py-3 space-y-3">
                    {/* Items */}
                    {items.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">المنتجات</p>
                        <div className="space-y-1.5">
                          {items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2">
                              <div className="flex items-center gap-2">
                                <Package size={13} className="text-neutral-400" />
                                <span className="text-xs text-neutral-700 dark:text-neutral-300">{item.name}</span>
                                <span className="text-xs text-neutral-400">×{item.quantity}</span>
                              </div>
                              <span className="text-xs font-medium text-neutral-900 dark:text-white">{item.total?.toLocaleString()} د.م.</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shipping */}
                    {o.shipping_address && (
                      <div className="flex items-start gap-2">
                        <MapPin size={13} className="text-neutral-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{o.shipping_address}</p>
                      </div>
                    )}

                    {/* Tracking */}
                    {o.tracking_number && (
                      <div className="flex items-center gap-2">
                        <CreditCard size={13} className="text-neutral-400 shrink-0" />
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">رقم التتبع: <span className="font-mono">{o.tracking_number}</span></p>
                      </div>
                    )}

                    {/* Commission info */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">المجموع</span>
                        <span className="text-neutral-700 dark:text-neutral-300">{(o.subtotal || o.total)?.toLocaleString()} د.م.</span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">عمولة Wibya ({profile?.commission_rate ?? 6}%)</span>
                        <span className="text-red-500">-{Math.round((o.subtotal || o.total) * (profile?.commission_rate ?? 6) / 100).toLocaleString()} د.م.</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold border-t border-neutral-200 dark:border-neutral-700 pt-1 mt-1">
                        <span className="text-neutral-700 dark:text-neutral-300">صافي الربح</span>
                        <span className="text-green-600 dark:text-green-400">
                          {Math.round((o.subtotal || o.total) * (1 - (profile?.commission_rate ?? 6) / 100)).toLocaleString()} د.م.
                        </span>
                      </div>
                    </div>

                    {/* PDF Button */}
                    <button
                      onClick={() => handleGeneratePDF(o)}
                      disabled={generatingPdf === o.id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl text-sm disabled:opacity-50"
                    >
                      <FileText size={15} />
                      {generatingPdf === o.id ? 'جاري التوليد...' : 'تحميل الفاتورة PDF'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}