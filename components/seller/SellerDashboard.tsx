'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import {
  LayoutDashboard, Package, ShoppingBag, Wallet, BarChart2,
  Bell, Settings, LogOut, Plus, Eye, TrendingUp, Clock,
  CheckCircle2, Truck, XCircle, ChevronRight, Store
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'overview', icon: LayoutDashboard, label: 'نظرة عامة' },
  { key: 'products', icon: Package, label: 'المنتجات' },
  { key: 'orders', icon: ShoppingBag, label: 'الطلبات' },
  { key: 'wallet', icon: Wallet, label: 'المحفظة' },
  { key: 'settings', icon: Settings, label: 'الإعدادات' },
] as const

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'في الانتظار', color: 'text-amber-500 bg-amber-50', icon: Clock },
  confirmed: { label: 'مؤكد', color: 'text-blue-500 bg-blue-50', icon: CheckCircle2 },
  shipped:   { label: 'في الشحن', color: 'text-purple-500 bg-purple-50', icon: Truck },
  delivered: { label: 'تم التسليم', color: 'text-green-500 bg-green-50', icon: CheckCircle2 },
  cancelled: { label: 'ملغى', color: 'text-red-400 bg-red-50', icon: XCircle },
}

export function SellerDashboard({ profile, products, orders, stats }: any) {
  const [tab, setTab] = useState<typeof TABS[number]['key']>('overview')
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-e border-neutral-100 min-h-screen sticky top-0">
        <div className="p-5 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-bold">
              {(profile?.store_name || profile?.full_name || 'W').charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-neutral-900 truncate">
                {profile?.store_name || profile?.full_name}
              </div>
              <div className="text-xs text-neutral-400">بائع</div>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {TABS.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-start ${
                tab === key ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'
              }`}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-neutral-100">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-neutral-100 flex items-center justify-between px-4 h-14">
          <div className="font-bold text-neutral-900">لوحة البائع</div>
          <Link href="/" className="text-sm text-neutral-500">العودة للموقع</Link>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {/* ══ OVERVIEW ══ */}
          {tab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-neutral-900">
                  مرحباً {profile?.full_name?.split(' ')[0] || ''} 👋
                </h1>
                <Link href="/seller/products/new"
                  className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5">
                  <Plus size={15} /> إضافة منتج
                </Link>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'إجمالي المبيعات', value: `${stats.totalSales.toLocaleString()} د.م.`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
                  { label: 'طلبات معلقة', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                  { label: 'منتجات نشطة', value: stats.activeProducts, icon: Package, color: 'text-blue-600 bg-blue-50' },
                  { label: 'إجمالي المشاهدات', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-purple-600 bg-purple-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 border border-neutral-100">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="text-xl font-bold text-neutral-900">{value}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
                  <h2 className="font-semibold text-sm text-neutral-900">آخر الطلبات</h2>
                  <button onClick={() => setTab('orders')} className="text-xs text-neutral-400">عرض الكل</button>
                </div>
                {orders.length === 0
                  ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد طلبات بعد</p>
                  : orders.slice(0,5).map((order: any) => {
                    const cfg = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.pending
                    const Icon = cfg.icon
                    return (
                      <div key={order.id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 last:border-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cfg.color}`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900">#{order.id.slice(-6).toUpperCase()}</div>
                          <div className="text-xs text-neutral-400">{new Date(order.created_at).toLocaleDateString('ar-MA')}</div>
                        </div>
                        <div className="text-sm font-semibold text-neutral-900">{order.total?.toLocaleString()} د.م.</div>
                      </div>
                    )
                  })
                }
              </div>

              {/* Recent products */}
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
                  <h2 className="font-semibold text-sm text-neutral-900">المنتجات الأخيرة</h2>
                  <button onClick={() => setTab('products')} className="text-xs text-neutral-400">عرض الكل</button>
                </div>
                {products.length === 0
                  ? <p className="text-center text-neutral-400 text-sm py-8">لم تضف أي منتج بعد</p>
                  : products.slice(0,5).map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-900 truncate">{p.name}</div>
                        <div className="text-xs text-neutral-400">{p.views_count} مشاهدة</div>
                      </div>
                      <div className="text-sm font-semibold">{p.price.toLocaleString()} د.م.</div>
                      <span className={`badge text-[10px] px-2 py-0.5 rounded-full ${
                        p.status === 'active' ? 'bg-green-50 text-green-600' :
                        p.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-neutral-100 text-neutral-500'
                      }`}>
                        {p.status === 'active' ? 'نشط' : p.status === 'pending' ? 'مراجعة' : p.status}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ══ PRODUCTS ══ */}
          {tab === 'products' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-neutral-900">منتجاتي</h1>
                <Link href="/seller/products/new" className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5">
                  <Plus size={15} /> إضافة
                </Link>
              </div>
              <SellerProductsList sellerId={profile?.id} />
            </div>
          )}

          {/* ══ ORDERS ══ */}
          {tab === 'orders' && (
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-xl font-bold text-neutral-900">الطلبات</h1>
              <SellerOrdersList orders={orders} />
            </div>
          )}

          {/* ══ WALLET ══ */}
          {tab === 'wallet' && (
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-xl font-bold text-neutral-900">المحفظة</h1>
              <div className="bg-neutral-900 rounded-3xl p-6 text-white">
                <div className="text-sm text-neutral-400 mb-1">الرصيد المتاح</div>
                <div className="text-4xl font-bold">{(profile?.wallet_balance ?? 0).toLocaleString()}</div>
                <div className="text-neutral-400 text-sm mt-1">درهم مغربي</div>
              </div>
              <button className="btn-outline w-full py-3">طلب سحب</button>
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {tab === 'settings' && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-bold text-neutral-900 mb-5">الإعدادات</h1>
              <SellerSettingsForm profile={profile} />
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 start-0 end-0 bg-white border-t border-neutral-100 flex z-50">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              tab === key ? 'text-neutral-900' : 'text-neutral-400'
            }`}>
            <Icon size={20} strokeWidth={tab === key ? 2.5 : 1.8} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}

// Sub-components
function SellerProductsList({ sellerId }: { sellerId: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <p className="text-center text-neutral-400 text-sm py-8">جاري التحميل...</p>
    </div>
  )
}

function SellerOrdersList({ orders }: { orders: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      {orders.length === 0
        ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد طلبات</p>
        : orders.map((order: any) => {
          const cfg = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.pending
          const Icon = cfg.icon
          return (
            <div key={order.id} className="flex items-center gap-3 px-4 py-4 border-b border-neutral-50 last:border-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-neutral-900">طلب #{order.id.slice(-6).toUpperCase()}</div>
                <div className="text-xs text-neutral-400">{new Date(order.created_at).toLocaleDateString('ar-MA')}</div>
              </div>
              <div className="text-end">
                <div className="font-bold text-sm">{order.total?.toLocaleString()} د.م.</div>
                <span className={`text-[10px] font-medium ${cfg.color} px-2 py-0.5 rounded-full`}>{cfg.label}</span>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

function SellerSettingsForm({ profile }: { profile: any }) {
  const [storeName, setStoreName] = useState(profile?.store_name ?? '')
  const [storeDesc, setStoreDesc] = useState(profile?.store_desc ?? '')
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [saving, setSaving] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ store_name: storeName, store_desc: storeDesc, whatsapp, city })
      .eq('id', profile.id)
    if (error) toast.error('خطأ في الحفظ')
    else toast.success('✅ تم الحفظ')
    setSaving(false)
  }

  return (
    <form onSubmit={save} className="space-y-4 max-w-md">
      {[
        { label: 'اسم المتجر', value: storeName, set: setStoreName, placeholder: 'اسم متجرك' },
        { label: 'واتساب', value: whatsapp, set: setWhatsapp, placeholder: '0612345678' },
        { label: 'المدينة', value: city, set: setCity, placeholder: 'الدار البيضاء' },
      ].map(({ label, value, set, placeholder }) => (
        <div key={label}>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
          <input value={value} onChange={e => set(e.target.value)} className="input" placeholder={placeholder} />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">وصف المتجر</label>
        <textarea value={storeDesc} onChange={e => setStoreDesc(e.target.value)}
          className="input resize-none" rows={3} placeholder="وصف قصير عن متجرك..." />
      </div>
      <button type="submit" disabled={saving} className="btn-primary w-full py-3">
        {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </form>
  )
}
