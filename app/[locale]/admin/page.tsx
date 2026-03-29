'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import {
  Users, Package, ShoppingBag, Clock, AlertTriangle, CheckCircle,
  XCircle, Shield, BarChart2, Flag, Store, LogOut, Star, Megaphone,
  Percent, BadgeCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'overview', icon: BarChart2, label: 'نظرة عامة' },
  { key: 'products', icon: Package, label: 'المنتجات' },
  { key: 'sellers', icon: Store, label: 'المتاجر' },
  { key: 'ads', icon: Megaphone, label: 'الإعلانات' },
  { key: 'commissions', icon: Percent, label: 'العمولات' },
  { key: 'flags', icon: Flag, label: 'البلاغات' },
  { key: 'orders', icon: ShoppingBag, label: 'الطلبات' },
] as const

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<typeof TABS[number]['key']>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ usersCount: 0, productsCount: 0, ordersCount: 0, pendingCount: 0, flagsCount: 0, adsCount: 0 })
  const [pendingProducts, setPendingProducts] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [flags, setFlags] = useState<any[]>([])
  const [sellers, setSellers] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [globalCommission, setGlobalCommission] = useState(10)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/ar/auth/login'); return }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/ar'); return }

      const [
        { count: usersCount },
        { count: productsCount },
        { count: ordersCount },
        { count: pendingCount },
        { count: flagsCount },
        { count: adsCount },
        { data: pp },
        { data: ro },
        { data: fl },
        { data: sl },
        { data: ad },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('product_reports').select('*', { count: 'exact', head: true }).eq('resolved', false),
        supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('products').select('*, profiles(store_name)').eq('status', 'pending').order('created_at', { ascending: false }).limit(10),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('product_reports').select('*, products(name, price, seller_id)').eq('resolved', false).order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('*').eq('role', 'seller').order('created_at', { ascending: false }).limit(20),
        supabase.from('ads').select('*, profiles(full_name, store_name)').order('created_at', { ascending: false }).limit(20),
      ])

      setStats({ usersCount: usersCount ?? 0, productsCount: productsCount ?? 0, ordersCount: ordersCount ?? 0, pendingCount: pendingCount ?? 0, flagsCount: flagsCount ?? 0, adsCount: adsCount ?? 0 })
      setPendingProducts(pp ?? [])
      setRecentOrders(ro ?? [])
      setFlags(fl ?? [])
      setSellers(sl ?? [])
      setAds(ad ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function approveProduct(id: string) {
    const supabase = createClient()
    await supabase.from('products').update({ status: 'active' }).eq('id', id)
    toast.success('تم قبول المنتج')
    setPendingProducts(prev => prev.filter(p => p.id !== id))
    setStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1, productsCount: prev.productsCount + 1 }))
  }

  async function rejectProduct(id: string) {
    const supabase = createClient()
    await supabase.from('products').update({ status: 'rejected' }).eq('id', id)
    toast.success('تم رفض المنتج')
    setPendingProducts(prev => prev.filter(p => p.id !== id))
    setStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1 }))
  }

  async function toggleVerified(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('profiles').update({ verified: !current }).eq('id', id)
    toast.success(current ? 'تم إلغاء التوثيق' : 'تم توثيق المتجر ✅')
    setSellers(prev => prev.map(s => s.id === id ? { ...s, verified: !current } : s))
  }

  async function togglePremium(id: string, current: boolean) {
    const supabase = createClient()
    const premium_until = current ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('profiles').update({ is_premium: !current, premium_until }).eq('id', id)
    toast.success(current ? 'تم إلغاء التميز' : 'تم تمييز المتجر ⭐')
    setSellers(prev => prev.map(s => s.id === id ? { ...s, is_premium: !current } : s))
  }

  async function updateCommission(id: string, rate: number) {
    const supabase = createClient()
    await supabase.from('profiles').update({ commission_rate: rate }).eq('id', id)
    toast.success('تم تحديث العمولة')
    setSellers(prev => prev.map(s => s.id === id ? { ...s, commission_rate: rate } : s))
  }

  async function resolveFlag(id: string) {
    const supabase = createClient()
    await supabase.from('product_reports').update({ resolved: true }).eq('id', id)
    toast.success('تم معالجة البلاغ')
    setFlags(prev => prev.filter(f => f.id !== id))
    setStats(prev => ({ ...prev, flagsCount: prev.flagsCount - 1 }))
  }

  async function toggleAd(id: string, current: string) {
    const supabase = createClient()
    const newStatus = current === 'active' ? 'paused' : 'active'
    await supabase.from('ads').update({ status: newStatus }).eq('id', id)
    toast.success(newStatus === 'active' ? 'تم تفعيل الإعلان' : 'تم إيقاف الإعلان')
    setAds(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-neutral-950 min-h-screen sticky top-0">
        <div className="p-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">لوحة الإدارة</div>
              <div className="text-xs text-neutral-500">Wibya Admin</div>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {TABS.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-start ${
                tab === key ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}>
              <Icon size={15} />
              {label}
              {key === 'products' && stats.pendingCount > 0 && (
                <span className="ms-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingCount}</span>
              )}
              {key === 'flags' && stats.flagsCount > 0 && (
                <span className="ms-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.flagsCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-neutral-800">
          <button onClick={async () => { await createClient().auth.signOut(); router.push('/') }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors">
            <LogOut size={15} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">

        {tab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-xl font-bold text-neutral-900">لوحة الإدارة</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'المستخدمون', value: stats.usersCount, icon: Users, color: 'bg-blue-50 text-blue-600' },
                { label: 'المنتجات', value: stats.productsCount, icon: Package, color: 'bg-green-50 text-green-600' },
                { label: 'الطلبات', value: stats.ordersCount, icon: ShoppingBag, color: 'bg-purple-50 text-purple-600' },
                { label: 'انتظار مراجعة', value: stats.pendingCount, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                { label: 'بلاغات', value: stats.flagsCount, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
                { label: 'إعلانات نشطة', value: stats.adsCount, icon: Megaphone, color: 'bg-pink-50 text-pink-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl p-4 border border-neutral-100">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon size={16} /></div>
                  <div className="text-2xl font-bold text-neutral-900">{value}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            {pendingProducts.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-50">
                  <h2 className="font-semibold text-sm text-neutral-900">منتجات تنتظر المراجعة</h2>
                </div>
                {pendingProducts.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-neutral-400">{p.profiles?.store_name ?? '—'} · {p.price} د.م.</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => approveProduct(p.id)} className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center"><CheckCircle size={14} className="text-white" /></button>
                      <button onClick={() => rejectProduct(p.id)} className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center"><XCircle size={14} className="text-white" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'products' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-neutral-900">مراجعة المنتجات</h1>
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              {pendingProducts.length === 0
                ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد منتجات بانتظار المراجعة ✅</p>
                : pendingProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-4 border-b border-neutral-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-neutral-400 mt-0.5">{p.profiles?.store_name} · {p.price?.toLocaleString()} د.م.</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => approveProduct(p.id)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-xl">قبول</button>
                      <button onClick={() => rejectProduct(p.id)} className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-xl">رفض</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {tab === 'sellers' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-neutral-900">إدارة المتاجر</h1>
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              {sellers.length === 0
                ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد متاجر</p>
                : sellers.map((s: any) => (
                  <div key={s.id} className="px-4 py-4 border-b border-neutral-50 last:border-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center font-bold text-neutral-500">
                        {(s.store_name || s.full_name || 'W').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm flex items-center gap-2">
                          {s.store_name || s.full_name || '—'}
                          {s.verified && <BadgeCheck size={14} className="text-blue-500" />}
                          {s.is_premium && <Star size={14} className="text-amber-500 fill-amber-500" />}
                        </div>
                        <div className="text-xs text-neutral-400">{s.email} · {s.city || '—'}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => toggleVerified(s.id, s.verified)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${s.verified ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-500'}`}>
                        <BadgeCheck size={12} />
                        {s.verified ? 'موثق ✓' : 'توثيق'}
                      </button>
                      <button onClick={() => togglePremium(s.id, s.is_premium)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${s.is_premium ? 'bg-amber-50 text-amber-600' : 'bg-neutral-100 text-neutral-500'}`}>
                        <Star size={12} />
                        {s.is_premium ? 'مميز ⭐' : 'تمييز'}
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {tab === 'ads' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-neutral-900">إدارة الإعلانات</h1>
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              {ads.length === 0
                ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد إعلانات</p>
                : ads.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-4 border-b border-neutral-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{a.title || a.headline}</div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {a.profiles?.store_name || a.profiles?.full_name || '—'} · {a.views_count ?? 0} مشاهدة
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {a.is_vip && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">VIP</span>}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500'}`}>
                          {a.status === 'active' ? 'نشط' : 'موقوف'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => toggleAd(a.id, a.status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl shrink-0 ${a.status === 'active' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {a.status === 'active' ? 'إيقاف' : 'تفعيل'}
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {tab === 'commissions' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-neutral-900">إدارة العمولات</h1>
            <div className="bg-white rounded-2xl border border-neutral-100 p-4">
              <h2 className="font-semibold text-sm text-neutral-900 mb-3">العمولة العامة لجميع المتاجر</h2>
              <div className="flex items-center gap-3">
                <input type="number" value={globalCommission} onChange={e => setGlobalCommission(Number(e.target.value))}
                  min={0} max={50} className="w-24 px-3 py-2 border border-neutral-200 rounded-xl text-sm text-center" />
                <span className="text-sm text-neutral-500">%</span>
                <button onClick={async () => {
                  const supabase = createClient()
                  await supabase.from('profiles').update({ commission_rate: globalCommission }).eq('role', 'seller')
                  toast.success('تم تحديث العمولة العامة')
                  setSellers(prev => prev.map(s => ({ ...s, commission_rate: globalCommission })))
                }} className="px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-xl">
                  تطبيق على الجميع
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-50">
                <h2 className="font-semibold text-sm text-neutral-900">عمولة كل متجر</h2>
              </div>
              {sellers.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{s.store_name || s.full_name || '—'}</div>
                    <div className="text-xs text-neutral-400">{s.email}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input type="number" defaultValue={s.commission_rate ?? 10} min={0} max={50}
                      className="w-16 px-2 py-1.5 border border-neutral-200 rounded-xl text-sm text-center"
                      onBlur={e => updateCommission(s.id, Number(e.target.value))} />
                    <span className="text-xs text-neutral-400">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'flags' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-neutral-900">البلاغات</h1>
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              {flags.length === 0
                ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد بلاغات مفتوحة ✅</p>
                : flags.map((f: any) => (
                  <div key={f.id} className="px-4 py-4 border-b border-neutral-50 last:border-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{f.products?.name || 'منتج محذوف'}</div>
                        <div className="text-xs text-neutral-400 mt-1">بلّغ عنه: {f.profiles?.full_name || '—'}</div>
                        <div className="text-xs text-neutral-500 mt-1 bg-neutral-50 rounded-lg px-2 py-1">{f.reason || 'بدون سبب'}</div>
                      </div>
                      <button onClick={() => resolveFlag(f.id)} className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-xl shrink-0">معالجة</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-neutral-900">جميع الطلبات</h1>
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              {recentOrders.length === 0
                ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد طلبات</p>
                : recentOrders.map((o: any) => (
                  <div key={o.id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 last:border-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium">#{o.id.slice(-6).toUpperCase()}</div>
                      <div className="text-xs text-neutral-400">{new Date(o.created_at).toLocaleDateString('ar-MA')}</div>
                    </div>
                    <div className="text-sm font-bold">{o.total?.toLocaleString()} د.م.</div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                      o.status === 'delivered' ? 'bg-green-50 text-green-600' :
                      o.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      'bg-neutral-100 text-neutral-500'
                    }`}>{o.status}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 start-0 end-0 bg-neutral-950 border-t border-neutral-800 flex z-50 overflow-x-auto">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-colors min-w-[50px] ${
              tab === key ? 'text-white' : 'text-neutral-500'
            }`}>
            <Icon size={16} strokeWidth={tab === key ? 2.5 : 1.8} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}