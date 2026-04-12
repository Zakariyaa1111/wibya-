'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import Image from 'next/image'
import {
  Package, Users, ShoppingBag, BarChart2, Flag,
  CheckCircle, XCircle, Clock, Star, Wallet,
  AlertTriangle, Eye, Download, Code2, TrendingUp,
  Shield, LogOut, ChevronDown, ChevronUp, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { reviewProductWithClaude } from '@/lib/actions/claudeReview'

const TABS = [
  { key: 'overview', icon: BarChart2, label: 'نظرة عامة' },
  { key: 'products', icon: Package, label: 'المنتجات' },
  { key: 'developers', icon: Code2, label: 'المطورون' },
  { key: 'purchases', icon: ShoppingBag, label: 'المبيعات' },
  { key: 'disputes', icon: Flag, label: 'النزاعات' },
  { key: 'withdrawals', icon: Wallet, label: 'السحوبات' },
  { key: 'reviews', icon: Star, label: 'التقييمات' },
] as const

type TabKey = typeof TABS[number]['key']

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('overview')
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Stats
  const [stats, setStats] = useState({
    pendingProducts: 0,
    totalProducts: 0,
    totalDevelopers: 0,
    totalBuyers: 0,
    totalSales: 0,
    totalRevenue: 0,
    openDisputes: 0,
    pendingWithdrawals: 0,
  })

  // Data
  const [pendingProducts, setPendingProducts] = useState<any[]>([])
  const [activeProducts, setActiveProducts] = useState<any[]>([])
  const [developers, setDevelopers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [disputes, setDisputes] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/ar/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/ar'); return }

      const [
        { count: pendingCount },
        { count: totalProducts },
        { count: totalDevelopers },
        { count: totalBuyers },
        { count: totalSales },
        { count: openDisputes },
        { count: pendingWithdrawals },
        { data: pendingProds },
        { data: activeProds },
        { data: devs },
        { data: purcs },
        { data: disps },
        { data: withs },
        { data: revs },
      ] = await Promise.all([
        supabase.from('digital_products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('digital_products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'developer'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
        supabase.from('purchases').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['open', 'reviewing']),
        supabase.from('withdrawal_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('digital_products').select('*, profiles(full_name, store_name, email), product_files(file_name, file_size)').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('digital_products').select('*, profiles(full_name, store_name)').eq('status', 'active').order('sales_count', { ascending: false }).limit(10),
        supabase.from('profiles').select('*, wallets(balance, total_earned)').eq('role', 'developer').order('created_at', { ascending: false }).limit(20),
        supabase.from('purchases').select('*, digital_products(title, price), profiles!buyer_id(full_name)').order('created_at', { ascending: false }).limit(20),
        supabase.from('disputes').select('*, purchases(amount), profiles!buyer_id(full_name), profiles!developer_id(store_name, full_name)').in('status', ['open', 'reviewing']).order('created_at', { ascending: false }),
        supabase.from('withdrawal_requests').select('*, profiles(full_name, store_name, paypal_email)').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('product_reviews').select('*, digital_products(title), profiles(full_name)').order('created_at', { ascending: false }).limit(20),
      ])

      // حساب الإيرادات
      const { data: revenueData } = await supabase
        .from('purchases')
        .select('platform_fee')
        .eq('status', 'completed')
      const totalRevenue = revenueData?.reduce((s, p) => s + (p.platform_fee || 0), 0) ?? 0

      setStats({
        pendingProducts: pendingCount ?? 0,
        totalProducts: totalProducts ?? 0,
        totalDevelopers: totalDevelopers ?? 0,
        totalBuyers: totalBuyers ?? 0,
        totalSales: totalSales ?? 0,
        totalRevenue,
        openDisputes: openDisputes ?? 0,
        pendingWithdrawals: pendingWithdrawals ?? 0,
      })

      setPendingProducts(pendingProds ?? [])
      setActiveProducts(activeProds ?? [])
      setDevelopers(devs ?? [])
      setPurchases(purcs ?? [])
      setDisputes(disps ?? [])
      setWithdrawals(withs ?? [])
      setReviews(revs ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // فحص Claude وعرض التقرير
  async function handleClaudeReview(productId: string) {
    setReviewing(productId)
    toast.loading('Claude يفحص المنتج...', { id: 'claude' })
    try {
      const report = await reviewProductWithClaude(productId)
      if (report) {
        toast.success(`الفحص اكتمل — النتيجة: ${report.score}/100`, { id: 'claude' })
        // تحديث المنتج في الـ state
        setPendingProducts(prev => prev.map(p =>
          p.id === productId ? { ...p, claude_report: report, claude_score: report.score, quality_badge: report.badge } : p
        ))
      } else {
        toast.error('خطأ في الفحص', { id: 'claude' })
      }
    } catch {
      toast.error('خطأ في الفحص', { id: 'claude' })
    }
    setReviewing(null)
  }

  async function approveProduct(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('digital_products').update({ status: 'active' }).eq('id', id)
    if (error) { toast.error('خطأ: ' + error.message); return }
    const product = pendingProducts.find(p => p.id === id)
    if (product?.developer_id) {
      await supabase.from('notifications').insert({
        user_id: product.developer_id,
        title: '✅ تم قبول منتجك!',
        body: `منتج "${product.title}" أصبح نشطاً وظاهراً للمشترين`,
        type: 'product', is_read: false,
      })
    }
    toast.success('تم قبول المنتج ✅')
    setPendingProducts(prev => prev.filter(p => p.id !== id))
    setStats(prev => ({ ...prev, pendingProducts: prev.pendingProducts - 1, totalProducts: prev.totalProducts + 1 }))
  }

  async function rejectProduct(id: string) {
    const supabase = createClient()
    await supabase.from('digital_products').update({ status: 'rejected' }).eq('id', id)
    const product = pendingProducts.find(p => p.id === id)
    if (product?.developer_id) {
      await supabase.from('notifications').insert({
        user_id: product.developer_id,
        title: '❌ تم رفض منتجك',
        body: `منتج "${product.title}" لم يستوف معايير النشر. راجع التقرير وأعد المحاولة.`,
        type: 'product', is_read: false,
      })
    }
    toast.success('تم رفض المنتج')
    setPendingProducts(prev => prev.filter(p => p.id !== id))
    setStats(prev => ({ ...prev, pendingProducts: prev.pendingProducts - 1 }))
  }

  async function resolveDispute(id: string, decision: 'resolved_buyer' | 'resolved_developer', note: string) {
    const supabase = createClient()
    await supabase.from('disputes').update({
      status: decision,
      admin_decision: decision === 'resolved_buyer' ? 'لصالح المشتري' : 'لصالح المطور',
      admin_note: note,
      resolved_at: new Date().toISOString(),
    }).eq('id', id)
    toast.success('تم حل النزاع ✅')
    setDisputes(prev => prev.filter(d => d.id !== id))
    setStats(prev => ({ ...prev, openDisputes: prev.openDisputes - 1 }))
  }

  async function processWithdrawal(id: string, approved: boolean) {
    const supabase = createClient()
    const withdrawal = withdrawals.find(w => w.id === id)
    await supabase.from('withdrawal_requests').update({
      status: approved ? 'processing' : 'rejected',
      processed_at: new Date().toISOString(),
    }).eq('id', id)

    if (approved && withdrawal) {
      // خصم من المحفظة
      await supabase.from('wallets').update({
        balance: supabase.rpc('decrement_balance', { amount: withdrawal.amount, dev_id: withdrawal.developer_id }),
        total_withdrawn: supabase.rpc('increment_withdrawn', { amount: withdrawal.amount, dev_id: withdrawal.developer_id }),
      }).eq('developer_id', withdrawal.developer_id)

      await supabase.from('notifications').insert({
        user_id: withdrawal.developer_id,
        title: '💸 تمت معالجة طلب السحب',
        body: `سيصل مبلغ $${withdrawal.amount} عبر تحويل بنكي خلال 1-3 أيام`,
        type: 'product', is_read: false,
      })
      toast.success('تمت الموافقة على السحب ✅')
    } else {
      await supabase.from('notifications').insert({
        user_id: withdrawal.developer_id,
        title: '❌ تم رفض طلب السحب',
        body: `تم رفض طلب سحب $${withdrawal.amount}. تواصل مع الدعم لمعرفة السبب.`,
        type: 'product', is_read: false,
      })
      toast.success('تم رفض طلب السحب')
    }
    setWithdrawals(prev => prev.filter(w => w.id !== id))
    setStats(prev => ({ ...prev, pendingWithdrawals: prev.pendingWithdrawals - 1 }))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  const cardCls = "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800"
  const textCls = "text-neutral-900 dark:text-white"
  const mutedCls = "text-neutral-400 dark:text-neutral-500"
  const rowCls = "border-b border-neutral-50 dark:border-neutral-800 last:border-0"

  const scoreColor = (score: number) =>
    score >= 70 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'

  const scoreBg = (score: number) =>
    score >= 70 ? 'bg-green-50 dark:bg-green-900/20' : score >= 50 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-neutral-950 min-h-screen sticky top-0">
        <div className="p-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Wibya" width={32} height={32} className="object-contain" />
            <div>
              <div className="font-bold text-white text-sm">لوحة الإدارة</div>
              <div className="text-xs text-neutral-500">Wibya Admin</div>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {TABS.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-start ${tab === key ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}>
              <Icon size={15} aria-hidden="true" />
              {label}
              {key === 'products' && stats.pendingProducts > 0 && (
                <span className="ms-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingProducts}</span>
              )}
              {key === 'disputes' && stats.openDisputes > 0 && (
                <span className="ms-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.openDisputes}</span>
              )}
              {key === 'withdrawals' && stats.pendingWithdrawals > 0 && (
                <span className="ms-auto bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingWithdrawals}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-neutral-800">
          <button onClick={async () => { await createClient().auth.signOut(); router.push('/ar') }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors">
            <LogOut size={15} aria-hidden="true" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 p-4 lg:p-6 pb-24 max-w-4xl">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-4">
            <h1 className={`text-xl font-bold ${textCls}`}>نظرة عامة</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'منتجات نشطة', value: stats.totalProducts, icon: Package, color: 'text-green-600' },
                { label: 'المطورون', value: stats.totalDevelopers, icon: Code2, color: 'text-blue-600' },
                { label: 'المشترون', value: stats.totalBuyers, icon: Users, color: 'text-purple-600' },
                { label: 'المبيعات', value: stats.totalSales, icon: ShoppingBag, color: 'text-amber-600' },
                { label: 'بانتظار المراجعة', value: stats.pendingProducts, icon: Clock, color: 'text-orange-600' },
                { label: 'نزاعات مفتوحة', value: stats.openDisputes, icon: Flag, color: 'text-red-600' },
                { label: 'طلبات سحب', value: stats.pendingWithdrawals, icon: Wallet, color: 'text-teal-600' },
                { label: 'إيرادات المنصة', value: `$${stats.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'text-green-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={cardCls + ' p-4'}>
                  <Icon size={18} className={color + ' mb-2'} aria-hidden="true" />
                  <p className={`text-2xl font-bold ${textCls}`}>{value}</p>
                  <p className={`text-xs ${mutedCls} mt-0.5`}>{label}</p>
                </div>
              ))}
            </div>

            {/* أفضل المنتجات */}
            <div className={cardCls + ' overflow-hidden'}>
              <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
                <h2 className={`font-semibold text-sm ${textCls}`}>أكثر المنتجات مبيعاً</h2>
              </div>
              {activeProducts.slice(0, 5).map(p => (
                <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${rowCls}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${textCls}`}>{p.title}</p>
                    <p className={`text-xs ${mutedCls}`}>{p.profiles?.store_name || p.profiles?.full_name} · {p.sales_count} مبيعة</p>
                  </div>
                  <p className={`text-sm font-bold ${textCls}`}>${p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div className="space-y-4">
            <h1 className={`text-xl font-bold ${textCls}`}>المنتجات</h1>

            {/* بانتظار المراجعة */}
            {pendingProducts.length > 0 && (
              <div className={cardCls + ' overflow-hidden'}>
                <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 flex items-center gap-2">
                  <Clock size={14} className="text-amber-500" aria-hidden="true" />
                  <h2 className={`font-semibold text-sm ${textCls}`}>بانتظار المراجعة ({pendingProducts.length})</h2>
                </div>
                {pendingProducts.map(p => (
                  <div key={p.id} className={`px-4 py-4 ${rowCls}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${textCls}`}>{p.title}</p>
                        <p className={`text-xs ${mutedCls} mt-0.5`}>
                          {p.profiles?.store_name || p.profiles?.full_name} · {p.category} · ${p.price}
                        </p>
                        <p className={`text-xs ${mutedCls}`}>
                          {p.product_files?.[0] ? `${(p.product_files[0].file_size / 1024 / 1024).toFixed(1)}MB` : 'لا ملف'}
                          {p.demo_url && ' · Demo متوفر ✅'}
                        </p>
                      </div>
                      <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                        className="text-neutral-400 p-1">
                        {expanded === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {/* Claude Score */}
                    {p.claude_score !== null && p.claude_score !== undefined ? (
                      <div className={`rounded-xl p-3 mb-3 ${scoreBg(p.claude_score)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield size={14} className={scoreColor(p.claude_score)} aria-hidden="true" />
                            <span className={`text-xs font-bold ${scoreColor(p.claude_score)}`}>
                              فحص Claude: {p.claude_score}/100
                            </span>
                            {p.quality_badge && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">شارة الجودة ✓</span>}
                          </div>
                          <span className={`text-xs font-semibold ${scoreColor(p.claude_score)}`}>
                            {p.claude_report?.recommendation === 'approve' ? '✅ يُنصح بالقبول' :
                             p.claude_report?.recommendation === 'review' ? '⚠️ يحتاج مراجعة' : '❌ يُنصح بالرفض'}
                          </span>
                        </div>
                        {p.claude_report?.summary && (
                          <p className={`text-xs ${mutedCls} mb-2`}>{p.claude_report.summary}</p>
                        )}
                        {expanded === p.id && p.claude_report && (
                          <div className="space-y-2 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                            {p.claude_report.strengths?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-green-600 mb-1">نقاط القوة:</p>
                                {p.claude_report.strengths.map((s: string, i: number) => (
                                  <p key={i} className={`text-xs ${mutedCls} flex items-start gap-1`}>
                                    <CheckCircle size={11} className="text-green-500 shrink-0 mt-0.5" />
                                    {s}
                                  </p>
                                ))}
                              </div>
                            )}
                            {p.claude_report.issues?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-600 mb-1">ملاحظات:</p>
                                {p.claude_report.issues.map((issue: string, i: number) => (
                                  <p key={i} className={`text-xs ${mutedCls} flex items-start gap-1`}>
                                    <AlertTriangle size={11} className="text-amber-500 shrink-0 mt-0.5" />
                                    {issue}
                                  </p>
                                ))}
                              </div>
                            )}
                            {p.claude_report.security?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-red-600 mb-1">ملاحظات أمنية:</p>
                                {p.claude_report.security.map((s: string, i: number) => (
                                  <p key={i} className={`text-xs ${mutedCls} flex items-start gap-1`}>
                                    <Shield size={11} className="text-red-500 shrink-0 mt-0.5" />
                                    {s}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => handleClaudeReview(p.id)} disabled={reviewing === p.id}
                        className="w-full mb-3 py-2.5 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl text-xs text-neutral-500 hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {reviewing === p.id ? (
                          <><div className="w-3 h-3 border-2 border-neutral-400 border-t-neutral-700 rounded-full animate-spin" /> Claude يفحص...</>
                        ) : (
                          <><Shield size={13} /> فحص بـ Claude</>
                        )}
                      </button>
                    )}

                    {/* Demo */}
                    {p.demo_url && (
                      <a href={p.demo_url} target="_blank" rel="noreferrer"
                        className={`flex items-center gap-1.5 text-xs text-blue-500 mb-3 hover:underline`}>
                        <Eye size={12} /> عرض Demo
                      </a>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => approveProduct(p.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition-colors">
                        <CheckCircle size={13} /> قبول
                      </button>
                      <button onClick={() => rejectProduct(p.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-600 transition-colors">
                        <XCircle size={13} /> رفض
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* المنتجات النشطة */}
            <div className={cardCls + ' overflow-hidden'}>
              <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
                <h2 className={`font-semibold text-sm ${textCls}`}>المنتجات النشطة ({activeProducts.length})</h2>
              </div>
              {activeProducts.length === 0
                ? <p className={`text-center text-sm py-6 ${mutedCls}`}>لا توجد منتجات نشطة</p>
                : activeProducts.map(p => (
                  <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${rowCls}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${textCls}`}>{p.title}</p>
                        {p.quality_badge && <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full shrink-0">✓</span>}
                      </div>
                      <p className={`text-xs ${mutedCls}`}>{p.profiles?.store_name || p.profiles?.full_name} · {p.sales_count} مبيعة · ⭐{p.average_rating?.toFixed(1)}</p>
                    </div>
                    <div className="text-end shrink-0">
                      <p className={`text-sm font-bold ${textCls}`}>${p.price}</p>
                      {p.claude_score !== null && (
                        <p className={`text-[10px] ${scoreColor(p.claude_score)}`}>{p.claude_score}/100</p>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* DEVELOPERS */}
        {tab === 'developers' && (
          <div className="space-y-4">
            <h1 className={`text-xl font-bold ${textCls}`}>المطورون ({developers.length})</h1>
            <div className={cardCls + ' overflow-hidden'}>
              {developers.length === 0
                ? <p className={`text-center text-sm py-8 ${mutedCls}`}>لا يوجد مطورون بعد</p>
                : developers.map(dev => (
                  <div key={dev.id} className={`px-4 py-4 ${rowCls}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-500 shrink-0">
                        {(dev.store_name || dev.full_name || 'D').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${textCls}`}>{dev.store_name || dev.full_name || '—'}</p>
                        <p className={`text-xs ${mutedCls}`}>{dev.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs ${mutedCls}`}>رصيد: ${dev.wallets?.balance?.toFixed(2) || '0.00'}</span>
                          <span className={`text-xs ${mutedCls}`}>مجموع: ${dev.wallets?.total_earned?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                      {dev.is_verified && (
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-medium shrink-0">
                          موثق ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* PURCHASES */}
        {tab === 'purchases' && (
          <div className="space-y-4">
            <h1 className={`text-xl font-bold ${textCls}`}>المبيعات الأخيرة</h1>
            <div className={cardCls + ' overflow-hidden'}>
              {purchases.length === 0
                ? <p className={`text-center text-sm py-8 ${mutedCls}`}>لا توجد مبيعات بعد</p>
                : purchases.map(p => (
                  <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${rowCls}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${textCls}`}>{p.digital_products?.title || '—'}</p>
                      <p className={`text-xs ${mutedCls}`}>
                        {p.profiles?.full_name || 'مشتري'} · {new Date(p.created_at).toLocaleDateString('ar-MA')}
                      </p>
                    </div>
                    <div className="text-end shrink-0">
                      <p className={`text-sm font-bold ${textCls}`}>${p.amount?.toFixed(2)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'completed' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                        p.status === 'escrow' ? 'bg-amber-50 text-amber-600' :
                        'bg-neutral-100 text-neutral-500'
                      }`}>
                        {p.status === 'completed' ? 'مكتمل' : p.status === 'escrow' ? 'Escrow' : p.status}
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* DISPUTES */}
        {tab === 'disputes' && (
          <div className="space-y-4">
            <h1 className={`text-xl font-bold ${textCls}`}>النزاعات المفتوحة ({disputes.length})</h1>
            {disputes.length === 0 ? (
              <div className={cardCls + ' p-8 text-center'}>
                <Flag size={36} className="text-neutral-300 mx-auto mb-3" />
                <p className={`text-sm ${mutedCls}`}>لا توجد نزاعات مفتوحة 🎉</p>
              </div>
            ) : disputes.map(d => (
              <div key={d.id} className={cardCls + ' p-4'}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`font-semibold text-sm ${textCls}`}>نزاع #{d.id.slice(-6).toUpperCase()}</p>
                    <p className={`text-xs ${mutedCls} mt-0.5`}>
                      المشتري: {d['profiles!buyer_id']?.full_name || '—'} ·
                      المطور: {d['profiles!developer_id']?.store_name || d['profiles!developer_id']?.full_name || '—'}
                    </p>
                    <p className={`text-xs ${mutedCls}`}>
                      المبلغ: ${d.purchases?.amount?.toFixed(2)} ·
                      الموعد النهائي: {new Date(d.deadline).toLocaleDateString('ar-MA')}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                    d.status === 'open' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {d.status === 'open' ? 'مفتوح' : 'قيد المراجعة'}
                  </span>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 mb-3">
                  <p className={`text-xs font-semibold ${textCls} mb-1`}>السبب: {d.reason}</p>
                  <p className={`text-xs ${mutedCls}`}>{d.description}</p>
                  {d.evidence_images?.length > 0 && (
                    <p className={`text-xs text-blue-500 mt-1`}>📎 {d.evidence_images.length} صورة كدليل</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => resolveDispute(d.id, 'resolved_buyer', 'قرار الأدمن: لصالح المشتري')}
                    className="flex-1 py-2.5 bg-blue-500 text-white text-xs font-semibold rounded-xl hover:bg-blue-600 transition-colors">
                    لصالح المشتري
                  </button>
                  <button onClick={() => resolveDispute(d.id, 'resolved_developer', 'قرار الأدمن: لصالح المطور')}
                    className="flex-1 py-2.5 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition-colors">
                    لصالح المطور
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WITHDRAWALS */}
        {tab === 'withdrawals' && (
          <div className="space-y-4">
            <h1 className={`text-xl font-bold ${textCls}`}>طلبات السحب ({withdrawals.length})</h1>
            {withdrawals.length === 0 ? (
              <div className={cardCls + ' p-8 text-center'}>
                <Wallet size={36} className="text-neutral-300 mx-auto mb-3" />
                <p className={`text-sm ${mutedCls}`}>لا توجد طلبات سحب معلقة</p>
              </div>
            ) : withdrawals.map(w => (
              <div key={w.id} className={cardCls + ' p-4'}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`font-semibold text-sm ${textCls}`}>
                      {w.profiles?.store_name || w.profiles?.full_name || '—'}
                    </p>
                    <p className={`text-xs ${mutedCls}`}>{w.paypal_email}</p>
                    <p className={`text-xs ${mutedCls}`}>{new Date(w.created_at).toLocaleDateString('ar-MA')}</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">${w.amount?.toFixed(2)}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mb-3">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    ⚠️ تأكد من تحويل المبلغ للبريد: <strong>{w.paypal_email}</strong> قبل الموافقة
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => processWithdrawal(w.id, true)}
                    className="flex-1 py-2.5 bg-green-500 text-white text-xs font-semibold rounded-xl">
                    ✅ موافقة وتحويل
                  </button>
                  <button onClick={() => processWithdrawal(w.id, false)}
                    className="flex-1 py-2.5 bg-red-50 text-red-600 text-xs font-semibold rounded-xl">
                    ❌ رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS */}
        {tab === 'reviews' && (
          <div className="space-y-4">
            <h1 className={`text-xl font-bold ${textCls}`}>التقييمات</h1>
            <div className={cardCls + ' overflow-hidden'}>
              {reviews.length === 0
                ? <p className={`text-center text-sm py-8 ${mutedCls}`}>لا توجد تقييمات بعد</p>
                : reviews.map(r => (
                  <div key={r.id} className={`px-4 py-3 ${rowCls}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium truncate ${textCls}`}>{r.digital_products?.title || '—'}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={12} className={i <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'} />
                        ))}
                      </div>
                    </div>
                    <p className={`text-xs ${mutedCls}`}>{r.profiles?.full_name || 'مستخدم'}</p>
                    {r.comment && <p className={`text-xs ${mutedCls} mt-1`}>{r.comment}</p>}
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 start-0 end-0 bg-neutral-950 border-t border-neutral-800 flex z-50 overflow-x-auto">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-colors min-w-[50px] relative ${tab === key ? 'text-white' : 'text-neutral-500'}`}>
            <Icon size={16} strokeWidth={tab === key ? 2.5 : 1.8} aria-hidden="true" />
            {label}
            {key === 'products' && stats.pendingProducts > 0 && (
              <span className="absolute top-1 end-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}