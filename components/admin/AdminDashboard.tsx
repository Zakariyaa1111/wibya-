'use client'
import { useState } from 'react'
import {
  Users, Package, ShoppingBag, Clock, AlertTriangle, CheckCircle,
  XCircle, Shield, BarChart2, Settings, LogOut, Flag, Store
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'overview', icon: BarChart2, label: 'نظرة عامة' },
  { key: 'products', icon: Package, label: 'المنتجات' },
  { key: 'sellers', icon: Store, label: 'البائعون' },
  { key: 'orders', icon: ShoppingBag, label: 'الطلبات' },
  { key: 'flags', icon: Flag, label: 'الإبلاغات' },
  { key: 'users', icon: Users, label: 'المستخدمون' },
] as const

export function AdminDashboard({ stats, pendingProducts, recentOrders, flags, pendingSellers }: any) {
  const [tab, setTab] = useState<typeof TABS[number]['key']>('overview')
  const router = useRouter()

  async function approveProduct(id: string) {
    const supabase = createClient()
    await supabase.from('products').update({ status: 'active' }).eq('id', id)
    toast.success('تم قبول المنتج')
    router.refresh()
  }

  async function rejectProduct(id: string) {
    const supabase = createClient()
    await supabase.from('products').update({ status: 'rejected' }).eq('id', id)
    toast.success('تم رفض المنتج')
    router.refresh()
  }

  async function approveSeller(id: string) {
    const supabase = createClient()
    await supabase.from('profiles').update({ approved: true }).eq('id', id)
    toast.success('تم قبول البائع')
    router.refresh()
  }

  async function resolveFlag(id: string) {
    const supabase = createClient()
    await supabase.from('moderation_flags').update({ resolved: true }).eq('id', id)
    toast.success('تم معالجة البلاغ')
    router.refresh()
  }

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
                <span className="ms-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingCount}
                </span>
              )}
              {key === 'flags' && stats.flagsCount > 0 && (
                <span className="ms-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.flagsCount}
                </span>
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
      <div className="flex-1 p-4 md:p-6">
        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-xl font-bold text-neutral-900">لوحة الإدارة</h1>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'المستخدمون', value: stats.usersCount ?? 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
                { label: 'المنتجات النشطة', value: stats.productsCount ?? 0, icon: Package, color: 'bg-green-50 text-green-600' },
                { label: 'الطلبات', value: stats.ordersCount ?? 0, icon: ShoppingBag, color: 'bg-purple-50 text-purple-600' },
                { label: 'بانتظار المراجعة', value: stats.pendingCount ?? 0, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                { label: 'بلاغات مفتوحة', value: stats.flagsCount ?? 0, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl p-4 border border-neutral-100">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900">{value}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Pending products */}
            {pendingProducts.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-50 flex items-center justify-between">
                  <h2 className="font-semibold text-sm text-neutral-900">منتجات تنتظر المراجعة</h2>
                  <span className="badge bg-amber-50 text-amber-600 text-xs">{pendingProducts.length}</span>
                </div>
                {pendingProducts.slice(0,5).map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-neutral-400">{p.profiles?.store_name ?? '—'} · {p.price} د.م.</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => approveProduct(p.id)}
                        className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                        <CheckCircle size={14} className="text-white" />
                      </button>
                      <button onClick={() => rejectProduct(p.id)}
                        className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center">
                        <XCircle size={14} className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ PRODUCTS ══ */}
        {tab === 'products' && (
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-xl font-bold text-neutral-900">مراجعة المنتجات</h1>
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              {pendingProducts.length === 0
                ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد منتجات بانتظار المراجعة ✅</p>
                : pendingProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-4 border-b border-neutral-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {p.profiles?.store_name} · {p.price?.toLocaleString()} د.م. · {new Date(p.created_at).toLocaleDateString('ar-MA')}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => approveProduct(p.id)}
                        className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-xl">قبول</button>
                      <button onClick={() => rejectProduct(p.id)}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-xl">رفض</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ══ SELLERS ══ */}
        {tab === 'sellers' && (
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-xl font-bold text-neutral-900">البائعون بانتظار الموافقة</h1>
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              {pendingSellers.length === 0
                ? <p className="text-center text-neutral-400 text-sm py-8">لا يوجد بائعون بانتظار الموافقة ✅</p>
                : pendingSellers.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-4 border-b border-neutral-50 last:border-0">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center font-bold text-neutral-500">
                      {(s.full_name || s.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{s.full_name || '—'}</div>
                      <div className="text-xs text-neutral-400">{s.email} · {s.city || '—'}</div>
                    </div>
                    <button onClick={() => approveSeller(s.id)}
                      className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-xl shrink-0">
                      موافقة
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ══ FLAGS ══ */}
        {tab === 'flags' && (
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-xl font-bold text-neutral-900">البلاغات والإبلاغات</h1>
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              {flags.length === 0
                ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد بلاغات مفتوحة ✅</p>
                : flags.map((f: any) => (
                  <div key={f.id} className="px-4 py-4 border-b border-neutral-50 last:border-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {f.auto_flagged && (
                            <span className="badge bg-purple-50 text-purple-600 text-[10px]">🤖 AI</span>
                          )}
                          <span className="text-sm font-medium">{f.products?.name || 'منتج محذوف'}</span>
                        </div>
                        <div className="text-xs text-neutral-400 mb-2">{f.reason || 'بدون سبب'}</div>
                        {Array.isArray(f.flags) && f.flags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {f.flags.map((flag: string, i: number) => (
                              <span key={i} className="badge bg-red-50 text-red-500 text-[10px]">{flag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => resolveFlag(f.id)}
                        className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-xl shrink-0">
                        معالجة
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {tab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
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
                      o.status==='delivered' ? 'bg-green-50 text-green-600' :
                      o.status==='pending' ? 'bg-amber-50 text-amber-600' :
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
      <nav className="md:hidden fixed bottom-0 start-0 end-0 bg-neutral-950 border-t border-neutral-800 flex z-50">
        {TABS.slice(0,5).map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              tab === key ? 'text-white' : 'text-neutral-500'
            }`}>
            <Icon size={18} strokeWidth={tab === key ? 2.5 : 1.8} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
