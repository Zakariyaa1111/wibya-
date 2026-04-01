'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { ShoppingBag, Bell, ChevronDown, ChevronUp, MapPin, Phone, Package, Check, X, Truck, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_STEPS = [
  { key: 'pending', label: 'معلق', icon: ShoppingBag, color: 'bg-amber-500' },
  { key: 'confirmed', label: 'مؤكد', icon: Check, color: 'bg-blue-500' },
  { key: 'shipped', label: 'في الطريق', icon: Truck, color: 'bg-purple-500' },
  { key: 'delivered', label: 'مُسلَّم', icon: CheckCircle, color: 'bg-green-500' },
  { key: 'cancelled', label: 'ملغى', icon: X, color: 'bg-red-500' },
]

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'notifications' | 'orders'>('orders')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: notifs }, { data: sellerOrders }] = await Promise.all([
        supabase.from('notifications').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(30),
        supabase.from('orders').select('*').eq('seller_id', user.id)
          .order('created_at', { ascending: false }).limit(20),
      ])

      // جلب بيانات المشترين
      const buyerIds = [...new Set((sellerOrders ?? []).map((o: any) => o.buyer_id))]
      let buyers: Record<string, any> = {}
      if (buyerIds.length > 0) {
        const { data: buyerProfiles } = await supabase
          .from('profiles').select('id, full_name, phone, city').in('id', buyerIds)
        buyerProfiles?.forEach(b => { buyers[b.id] = b })
      }

      const ordersWithBuyers = (sellerOrders ?? []).map((o: any) => ({
        ...o, buyer: buyers[o.buyer_id] || null
      }))

      setNotifications(notifs ?? [])
      setOrders(ordersWithBuyers)

      // تحديد كل الإشعارات كمقروءة
      await supabase.from('notifications').update({ is_read: true })
        .eq('user_id', user.id).eq('is_read', false)

      setLoading(false)
    }
    load()
  }, [])

  async function updateOrderStatus(orderId: string, status: string) {
    setUpdating(orderId)
    const supabase = createClient()
    const order = orders.find(o => o.id === orderId)

    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) { toast.error('خطأ في التحديث'); setUpdating(null); return }

    // إشعار للمشتري
    const statusLabels: Record<string, string> = {
      confirmed: 'تم تأكيد طلبك ✅',
      shipped: 'طلبك في الطريق 🚚',
      delivered: 'تم تسليم طلبك 📦',
      cancelled: 'تم إلغاء طلبك ❌',
    }
    if (order?.buyer_id && statusLabels[status]) {
      await supabase.from('notifications').insert({
        user_id: order.buyer_id,
        title: statusLabels[status],
        body: `طلبك رقم #${orderId.slice(-6).toUpperCase()} — ${statusLabels[status]}`,
        type: 'order', is_read: false,
      })
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    toast.success('تم تحديث حالة الطلب ✅')
    setUpdating(null)
  }

  if (loading) return (
    <div className="p-8 pt-20 lg:pt-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  const unreadCount = notifications.filter(n => !n.is_read).length
  const pendingOrders = orders.filter(o => o.status === 'pending').length

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 max-w-2xl">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">الطلبات والإشعارات</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'orders' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-white dark:bg-neutral-900 text-neutral-500 border border-neutral-200 dark:border-neutral-700'}`}>
          <ShoppingBag size={15} /> الطلبات
          {pendingOrders > 0 && <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingOrders}</span>}
        </button>
        <button onClick={() => setActiveTab('notifications')}
          className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'notifications' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-white dark:bg-neutral-900 text-neutral-500 border border-neutral-200 dark:border-neutral-700'}`}>
          <Bell size={15} /> الإشعارات
          {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-8 text-center">
              <ShoppingBag size={36} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">لا توجد طلبات بعد</p>
            </div>
          ) : orders.map(order => {
            const isExpanded = expanded === order.id
            const items = Array.isArray(order.items) ? order.items : []
            const currentStep = STATUS_STEPS.findIndex(s => s.key === order.status)

            return (
              <div key={order.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                {/* Order header */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-neutral-900 dark:text-white">#{order.id.slice(-6).toUpperCase()}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${STATUS_STEPS.find(s => s.key === order.status)?.color || 'bg-neutral-400'}`}>
                        {STATUS_STEPS.find(s => s.key === order.status)?.label || order.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('ar-MA')} · {order.total?.toLocaleString()} د.م.
                    </p>
                  </div>
                  <button onClick={() => setExpanded(isExpanded ? null : order.id)} className="text-neutral-400 p-1">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-neutral-50 dark:border-neutral-800 px-4 py-4 space-y-4">

                    {/* Status progress */}
                    <div>
                      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">تتبع الطلب</p>
                      <div className="flex items-center gap-1">
                        {STATUS_STEPS.filter(s => s.key !== 'cancelled').map((step, i) => {
                          const stepIdx = STATUS_STEPS.findIndex(s => s.key === step.key)
                          const isActive = order.status !== 'cancelled' && stepIdx <= currentStep
                          const isCurrent = step.key === order.status
                          return (
                            <div key={step.key} className="flex items-center flex-1">
                              <div className={`flex flex-col items-center gap-1 ${i < 4 ? 'flex-1' : ''}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isCurrent ? step.color : isActive ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                                  <step.icon size={13} className="text-white" />
                                </div>
                                <span className={`text-[9px] text-center ${isCurrent ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>{step.label}</span>
                              </div>
                              {i < 3 && <div className={`h-0.5 flex-1 mb-4 mx-1 ${isActive && stepIdx < currentStep ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'}`} />}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Buyer info */}
                    {order.buyer && (
                      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 space-y-1.5">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">معلومات المشتري</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                          <Package size={11} /> {order.buyer.full_name || '—'}
                        </p>
                        {order.buyer.phone && (
                          <a href={`tel:${order.buyer.phone}`} className="text-xs text-blue-500 flex items-center gap-1">
                            <Phone size={11} /> {order.buyer.phone}
                          </a>
                        )}
                        {order.shipping_address && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            <MapPin size={11} /> {order.shipping_address}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Items */}
                    {items.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">المنتجات</p>
                        {items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2">
                            <span className="text-neutral-700 dark:text-neutral-300">{item.name} × {item.quantity}</span>
                            <span className="font-medium text-neutral-900 dark:text-white">{item.total?.toLocaleString()} د.م.</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Commission */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">المجموع</span>
                        <span className="text-neutral-900 dark:text-white">{order.total?.toLocaleString()} د.م.</span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">عمولة Wibya (6%)</span>
                        <span className="text-red-500">-{Math.round(order.total * 0.06).toLocaleString()} د.م.</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold pt-1 border-t border-neutral-200 dark:border-neutral-700 mt-1">
                        <span className="text-neutral-900 dark:text-white">صافي الربح</span>
                        <span className="text-green-600 dark:text-green-400">{Math.round(order.total * 0.94).toLocaleString()} د.م.</span>
                      </div>
                    </div>

                    {/* Status actions */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="grid grid-cols-2 gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              disabled={updating === order.id}
                              className="py-2.5 bg-blue-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5">
                              <Check size={13} /> تأكيد الطلب
                            </button>
                            <button onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              disabled={updating === order.id}
                              className="py-2.5 bg-red-50 text-red-600 text-xs font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5">
                              <X size={13} /> إلغاء
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button onClick={() => updateOrderStatus(order.id, 'shipped')}
                            disabled={updating === order.id}
                            className="col-span-2 py-2.5 bg-purple-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5">
                            <Truck size={13} /> تم الشحن
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button onClick={() => updateOrderStatus(order.id, 'delivered')}
                            disabled={updating === order.id}
                            className="col-span-2 py-2.5 bg-green-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5">
                            <CheckCircle size={13} /> تم التسليم
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-8 text-center">
              <Bell size={36} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">لا توجد إشعارات</p>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} className={`bg-white dark:bg-neutral-900 rounded-2xl border p-4 ${!n.is_read ? 'border-neutral-900 dark:border-white' : 'border-neutral-100 dark:border-neutral-800'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-300'}`} />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white">{n.title}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-1">
                    {new Date(n.created_at).toLocaleDateString('ar-MA', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}