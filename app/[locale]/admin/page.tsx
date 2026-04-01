'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import Image from 'next/image'
import {
  Users, Package, ShoppingBag, Clock, AlertTriangle, CheckCircle,
  XCircle, Shield, BarChart2, Flag, Store, LogOut, Star, Megaphone,
   Percent, BadgeCheck, ExternalLink, CreditCard, Crown, FileText, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateInvoicePDF } from '@/lib/pdf/invoice'

const TABS = [
  { key: 'overview', icon: BarChart2, label: 'نظرة عامة' },
  { key: 'products', icon: Package, label: 'المنتجات' },
  { key: 'sellers', icon: Store, label: 'المتاجر' },
  { key: 'verification', icon: CreditCard, label: 'التوثيق' },
  { key: 'premium', icon: Crown, label: 'Premium' },
  { key: 'ads', icon: Megaphone, label: 'الإعلانات' },
  { key: 'commissions', icon: Percent, label: 'العمولات' },
  { key: 'flags', icon: Flag, label: 'البلاغات' },
  { key: 'orders', icon: ShoppingBag, label: 'الطلبات' },
  { key: 'analytics', icon: BarChart2, label: 'الإحصائيات' }
] as const

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<typeof TABS[number]['key']>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ usersCount: 0, productsCount: 0, ordersCount: 0, pendingCount: 0, flagsCount: 0, adsCount: 0, pendingAdsCount: 0, verificationCount: 0, premiumCount: 0 })
  const [pendingProducts, setPendingProducts] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [flags, setFlags] = useState<any[]>([])
  const [sellers, setSellers] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [pendingAds, setPendingAds] = useState<any[]>([])
  const [verificationRequests, setVerificationRequests] = useState<any[]>([])
  const [premiumRequests, setPremiumRequests] = useState<any[]>([])
  const [globalCommission, setGlobalCommission] = useState(10)
  const [selectedFlag, setSelectedFlag] = useState<any>(null)
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/ar/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/ar'); return }

      const [
        { count: usersCount }, { count: productsCount }, { count: ordersCount },
        { count: pendingCount }, { count: flagsCount }, { count: adsCount },
        { count: pendingAdsCount },
        { count: verificationCount }, { count: premiumCount },
        { data: pp }, { data: ro }, { data: fl }, { data: sl }, { data: ad },
        { data: pendingAd }, { data: vr }, { data: pr },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('product_reports').select('*', { count: 'exact', head: true }).eq('resolved', false),
        supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('premium_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('id, name, price, category, created_at, seller_id, profiles(store_name)').eq('status', 'pending').order('created_at', { ascending: false }).limit(10),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('product_reports').select('*').eq('resolved', false).order('created_at', { ascending: false }).limit(30),
        supabase.from('profiles').select('*').eq('role', 'seller').order('created_at', { ascending: false }).limit(30),
        supabase.from('ads').select('id, title, headline, description, status, views_count, is_vip, city, phone, price, images, category, user_id, advertiser_id').eq('status', 'active').order('created_at', { ascending: false }).limit(20),
        supabase.from('ads').select('id, title, headline, description, status, views_count, city, phone, price, images, category, user_id, advertiser_id, created_at').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('id, full_name, store_name, email, id_card_url, verification_requested_at, successful_sales').eq('verification_status', 'pending').order('verification_requested_at', { ascending: false }),
        supabase.from('premium_requests').select('*, profiles(full_name, store_name, email, phone)').eq('status', 'pending').order('created_at', { ascending: false }),
      ])

      setStats({ usersCount: usersCount ?? 0, productsCount: productsCount ?? 0, ordersCount: ordersCount ?? 0, pendingCount: pendingCount ?? 0, flagsCount: flagsCount ?? 0, adsCount: adsCount ?? 0, pendingAdsCount: pendingAdsCount ?? 0, verificationCount: verificationCount ?? 0, premiumCount: premiumCount ?? 0 })
      setPendingProducts(pp ?? [])
      setRecentOrders(ro ?? [])
      setFlags(fl ?? [])
      setSellers(sl ?? [])
      setAds(ad ?? [])
      setPendingAds(pendingAd ?? [])
      setVerificationRequests(vr ?? [])
      setPremiumRequests(pr ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function approveProduct(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ status: 'active' }).eq('id', id)
    if (error) { toast.error('خطأ: ' + error.message); return }
    const product = pendingProducts.find(p => p.id === id)
    if (product?.seller_id) {
      await supabase.from('notifications').insert({ user_id: product.seller_id, title: 'تم قبول منتجك ✅', body: `منتج "${product.name}" أصبح نشطاً`, type: 'product', is_read: false })
    }
    toast.success('تم قبول المنتج ✅')
    setPendingProducts(prev => prev.filter(p => p.id !== id))
    setStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1, productsCount: prev.productsCount + 1 }))
  }

  async function rejectProduct(id: string) {
    const supabase = createClient()
    await supabase.from('products').update({ status: 'rejected' }).eq('id', id)
    const product = pendingProducts.find(p => p.id === id)
    if (product?.seller_id) {
      await supabase.from('notifications').insert({ user_id: product.seller_id, title: 'تم رفض منتجك ❌', body: `منتج "${product.name}" تم رفضه`, type: 'product', is_read: false })
    }
    toast.success('تم رفض المنتج')
    setPendingProducts(prev => prev.filter(p => p.id !== id))
    setStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1 }))
  }

  async function approveVerification(id: string) {
    const supabase = createClient()
    await supabase.from('profiles').update({ verification_status: 'approved', verified: true, tier: 'verified' }).eq('id', id)
    await supabase.from('notifications').insert({ user_id: id, title: 'تم توثيق حسابك ✅', body: 'تهانينا! حصلت على شارة التوثيق الزرقاء وعمولة 4%', type: 'product', is_read: false })
    toast.success('تم توثيق الحساب ✅')
    setVerificationRequests(prev => prev.filter(v => v.id !== id))
    setStats(prev => ({ ...prev, verificationCount: prev.verificationCount - 1 }))
  }

  async function rejectVerification(id: string) {
    const supabase = createClient()
    await supabase.from('profiles').update({ verification_status: 'rejected' }).eq('id', id)
    await supabase.from('notifications').insert({ user_id: id, title: 'تم رفض طلب التوثيق ❌', body: 'تم رفض طلبك، تواصل مع الدعم لمعرفة السبب', type: 'product', is_read: false })
    toast.success('تم رفض الطلب')
    setVerificationRequests(prev => prev.filter(v => v.id !== id))
    setStats(prev => ({ ...prev, verificationCount: prev.verificationCount - 1 }))
  }

  async function approvePremium(id: string, sellerId: string) {
    const supabase = createClient()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('premium_requests').update({ status: 'approved', processed_at: new Date().toISOString() }).eq('id', id)
    await supabase.from('profiles').update({ tier: 'premium', is_premium: true, premium_until: expires }).eq('id', sellerId)
    await supabase.from('notifications').insert({ user_id: sellerId, title: 'متجرك أصبح Premium ⭐', body: 'تهانينا! أصبحت بائعاً مميزاً لمدة 30 يوماً', type: 'product', is_read: false })
    toast.success('تم تفعيل Premium ⭐')
    setPremiumRequests(prev => prev.filter(r => r.id !== id))
    setStats(prev => ({ ...prev, premiumCount: prev.premiumCount - 1 }))
  }

  async function rejectPremium(id: string, sellerId: string) {
    const supabase = createClient()
    await supabase.from('premium_requests').update({ status: 'rejected' }).eq('id', id)
    await supabase.from('notifications').insert({ user_id: sellerId, title: 'تم رفض طلب Premium ❌', body: 'تم رفض طلبك، تواصل مع الدعم', type: 'product', is_read: false })
    toast.success('تم رفض الطلب')
    setPremiumRequests(prev => prev.filter(r => r.id !== id))
    setStats(prev => ({ ...prev, premiumCount: prev.premiumCount - 1 }))
  }

  async function toggleVerified(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('profiles').update({ verified: !current }).eq('id', id)
    if (!current) await supabase.from('notifications').insert({ user_id: id, title: 'تم توثيق متجرك ✅', body: 'تهانينا! متجرك أصبح موثقاً', type: 'product', is_read: false })
    toast.success(current ? 'تم إلغاء التوثيق' : 'تم توثيق المتجر ✅')
    setSellers(prev => prev.map(s => s.id === id ? { ...s, verified: !current } : s))
  }

  async function togglePremium(id: string, current: boolean) {
    const supabase = createClient()
    const premium_until = current ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('profiles').update({ is_premium: !current, tier: !current ? 'premium' : 'verified', premium_until }).eq('id', id)
    if (!current) await supabase.from('notifications').insert({ user_id: id, title: 'متجرك أصبح مميزاً ⭐', body: 'تهانينا! متجرك مميز لمدة 30 يوماً', type: 'product', is_read: false })
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
    const { error } = await supabase.from('product_reports').update({ resolved: true }).eq('id', id)
    if (error) { toast.error('خطأ: ' + error.message); return }
    toast.success('تم معالجة البلاغ ✅')
    setFlags(prev => prev.filter(f => f.id !== id))
    setStats(prev => ({ ...prev, flagsCount: prev.flagsCount - 1 }))
  }

  async function handleAdminInvoice(order: any) {
    setGeneratingPdf(order.id)
    try {
      const supabase = createClient()
      const [{ data: seller }, { data: buyer }] = await Promise.all([
        supabase.from('profiles').select('full_name, store_name, email, city, phone, commission_rate').eq('id', order.seller_id).single(),
        supabase.from('profiles').select('full_name, email').eq('id', order.buyer_id).single(),
      ])
      const items = Array.isArray(order.items) ? order.items : []
      const commissionRate = seller?.commission_rate ?? 6
      const subtotal = order.subtotal || order.total
      const commission = Math.round(subtotal * commissionRate / 100)
      generateInvoicePDF({
        orderId: order.id,
        orderDate: new Date(order.created_at).toLocaleDateString('fr-MA'),
        status: order.status,
        sellerName: seller?.full_name || '—',
        sellerStoreName: seller?.store_name || seller?.full_name || '—',
        sellerEmail: seller?.email || '—',
        sellerCity: seller?.city || '—',
        sellerPhone: seller?.phone,
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
    } catch {
      toast.error('خطأ في توليد الفاتورة')
    }
    setGeneratingPdf(null)
  }

  async function approveAd(id: string, userId: string) {
    const supabase = createClient()
    await supabase.from('ads').update({ status: 'active' }).eq('id', id)
    await supabase.from('notifications').insert({ user_id: userId, title: 'تم قبول إعلانك ✅', body: 'إعلانك أصبح نشطاً وظاهراً للجميع', type: 'product', is_read: false })
    toast.success('تم قبول الإعلان ✅')
    setPendingAds(prev => prev.filter(a => a.id !== id))
    setStats(prev => ({ ...prev, pendingAdsCount: prev.pendingAdsCount - 1, adsCount: prev.adsCount + 1 }))
  }

  async function rejectAd(id: string, userId: string) {
    const supabase = createClient()
    await supabase.from('ads').update({ status: 'rejected' }).eq('id', id)
    await supabase.from('notifications').insert({ user_id: userId, title: 'تم رفض إعلانك ❌', body: 'لم يستوف إعلانك شروط النشر، راجع السياسات', type: 'product', is_read: false })
    toast.success('تم رفض الإعلان')
    setPendingAds(prev => prev.filter(a => a.id !== id))
    setStats(prev => ({ ...prev, pendingAdsCount: prev.pendingAdsCount - 1 }))
  }

  async function toggleAd(id: string, current: string) {
    const supabase = createClient()
    const newStatus = current === 'active' ? 'paused' : 'active'
    await supabase.from('ads').update({ status: newStatus }).eq('id', id)
    toast.success(newStatus === 'active' ? 'تم تفعيل الإعلان' : 'تم إيقاف الإعلان')
    setAds(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
  }

  const reasonLabel: Record<string, string> = { misleading: 'إعلان مضلل', inappropriate: 'محتوى غير لائق', spam: 'بريد مزعج', other: 'سبب آخر', 'محتوى غير لائق': 'محتوى غير لائق' }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  const cardCls = "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800"
  const rowCls = "border-b border-neutral-50 dark:border-neutral-800 last:border-0"
  const titleCls = "text-xl font-bold text-neutral-900 dark:text-white"
  const textCls = "text-neutral-900 dark:text-white"
  const mutedCls = "text-neutral-400 dark:text-neutral-500"

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
      {/* Sidebar */}
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
              <Icon size={15} />{label}
              {key === 'products' && stats.pendingCount > 0 && <span className="ms-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingCount}</span>}
              {key === 'flags' && stats.flagsCount > 0 && <span className="ms-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.flagsCount}</span>}
              {key === 'verification' && stats.verificationCount > 0 && <span className="ms-auto bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.verificationCount}</span>}
              {key === 'ads' && stats.pendingAdsCount > 0 && <span className="ms-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingAdsCount}</span>}
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

      <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <h1 className={titleCls}>لوحة الإدارة</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'المستخدمون', value: stats.usersCount, icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
                { label: 'المنتجات النشطة', value: stats.productsCount, icon: Package, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
                { label: 'الطلبات', value: stats.ordersCount, icon: ShoppingBag, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
                { label: 'انتظار مراجعة', value: stats.pendingCount, icon: Clock, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
                { label: 'بلاغات مفتوحة', value: stats.flagsCount, icon: AlertTriangle, color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
                { label: 'إعلانات نشطة', value: stats.adsCount, icon: Megaphone, color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400' },
                { label: 'طلبات التوثيق', value: stats.verificationCount, icon: CreditCard, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
                { label: 'طلبات Premium', value: stats.premiumCount, icon: Crown, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={cardCls + " p-4"}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon size={16} /></div>
                  <div className={"text-2xl font-bold " + textCls}>{value}</div>
                  <div className={"text-xs mt-0.5 " + mutedCls}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div className="space-y-4">
            <h1 className={titleCls}>مراجعة المنتجات</h1>
            <div className={cardCls + " overflow-hidden"}>
              {pendingProducts.length === 0
                ? <p className={"text-center text-sm py-8 " + mutedCls}>لا توجد منتجات بانتظار المراجعة ✅</p>
                : pendingProducts.map((p: any) => (
                  <div key={p.id} className={"flex items-center gap-3 px-4 py-4 " + rowCls}>
                    <div className="flex-1 min-w-0">
                      <div className={"font-medium text-sm " + textCls}>{p.name}</div>
                      <div className={"text-xs mt-0.5 " + mutedCls}>{p.profiles?.store_name ?? '—'} · {p.price?.toLocaleString()} د.م.</div>
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

        {/* VERIFICATION REQUESTS */}
        {tab === 'verification' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className={titleCls}>طلبات التوثيق</h1>
              <span className={"text-sm " + mutedCls}>{verificationRequests.length} طلب</span>
            </div>
            <div className={cardCls + " overflow-hidden"}>
              {verificationRequests.length === 0
                ? <p className={"text-center text-sm py-8 " + mutedCls}>لا توجد طلبات توثيق ✅</p>
                : verificationRequests.map((v: any) => (
                  <div key={v.id} className={"px-4 py-4 " + rowCls}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className={"font-semibold text-sm " + textCls}>{v.store_name || v.full_name || '—'}</div>
                        <div className={"text-xs " + mutedCls}>{v.email} · {v.successful_sales ?? 0} مبيعات</div>
                        <div className={"text-xs " + mutedCls + " mt-0.5"}>
                          {v.verification_requested_at && new Date(v.verification_requested_at).toLocaleDateString('ar-MA')}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => approveVerification(v.id)}
                          className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-xl flex items-center gap-1">
                          <CheckCircle size={12} /> قبول
                        </button>
                        <button onClick={() => rejectVerification(v.id)}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-xl flex items-center gap-1">
                          <XCircle size={12} /> رفض
                        </button>
                      </div>
                    </div>
                    {/* ID Card */}
                    {v.id_card_url && (
                      <div className="rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-800">
                        <img src={v.id_card_url} alt="البطاقة الوطنية" className="w-full h-40 object-cover" />
                        <a href={v.id_card_url} target="_blank" rel="noreferrer"
                          className={"flex items-center gap-1 px-3 py-2 text-xs " + mutedCls + " hover:text-neutral-600 border-t border-neutral-100 dark:border-neutral-800"}>
                          <ExternalLink size={11} /> عرض كامل
                        </a>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* PREMIUM REQUESTS */}
        {tab === 'premium' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className={titleCls}>طلبات Premium</h1>
              <span className={"text-sm " + mutedCls}>{premiumRequests.length} طلب</span>
            </div>
            <div className={cardCls + " overflow-hidden"}>
              {premiumRequests.length === 0
                ? <p className={"text-center text-sm py-8 " + mutedCls}>لا توجد طلبات Premium ✅</p>
                : premiumRequests.map((r: any) => (
                  <div key={r.id} className={"px-4 py-4 " + rowCls}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className={"font-semibold text-sm " + textCls}>{r.profiles?.store_name || r.profiles?.full_name || '—'}</div>
                        <div className={"text-xs " + mutedCls}>{r.profiles?.email}</div>
                        {r.profiles?.phone && <div className={"text-xs " + mutedCls}>{r.profiles.phone}</div>}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                            {r.amount} د.م./شهر
                          </span>
                          <span className={"text-xs " + mutedCls}>{new Date(r.created_at).toLocaleDateString('ar-MA')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => approvePremium(r.id, r.seller_id)}
                          className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-xl flex items-center gap-1">
                          <Star size={12} /> تفعيل
                        </button>
                        <button onClick={() => rejectPremium(r.id, r.seller_id)}
                          className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-medium rounded-xl">
                          رفض
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* SELLERS */}
        {tab === 'sellers' && (
          <div className="space-y-4">
            <h1 className={titleCls}>إدارة المتاجر</h1>
            <div className={cardCls + " overflow-hidden"}>
              {sellers.length === 0
                ? <p className={"text-center text-sm py-8 " + mutedCls}>لا توجد متاجر</p>
                : sellers.map((s: any) => (
                  <div key={s.id} className={"px-4 py-4 " + rowCls}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-500">
                        {(s.store_name || s.full_name || 'W').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={"font-medium text-sm flex items-center gap-2 " + textCls}>
                          {s.store_name || s.full_name || '—'}
                          {s.verified && <BadgeCheck size={14} className="text-blue-500" />}
                          {s.is_premium && <Star size={14} className="text-amber-500 fill-amber-500" />}
                        </div>
                        <div className={"text-xs " + mutedCls}>{s.email} · {s.city || '—'} · عمولة: {s.commission_rate ?? 10}%</div>
                        <div className={"text-xs mt-0.5 " + mutedCls}>
                          {s.tier === 'premium' ? '⭐ Premium' : s.tier === 'verified' ? '✓ Verified' : 'Basic'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => toggleVerified(s.id, s.verified)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${s.verified ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                        <BadgeCheck size={12} />{s.verified ? 'موثق ✓' : 'توثيق'}
                      </button>
                      <button onClick={() => togglePremium(s.id, s.is_premium)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${s.is_premium ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                        <Star size={12} />{s.is_premium ? 'مميز ⭐' : 'تمييز'}
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ADS */}
        {tab === 'ads' && (
          <div className="space-y-4">
            <h1 className={titleCls}>إدارة الإعلانات</h1>

            {/* الإعلانات المنتظرة */}
            {pendingAds.length > 0 && (
              <div className={cardCls + " overflow-hidden"}>
                <div className={"px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 flex items-center gap-2"}>
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  <h2 className={"font-semibold text-sm " + textCls}>بانتظار المراجعة ({pendingAds.length})</h2>
                </div>
                {pendingAds.map((a: any) => (
                  <div key={a.id} className={"px-4 py-4 " + rowCls}>
                    <div className="flex items-start gap-3">
                      {a.images?.[0] && (
                        <img src={a.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={"font-medium text-sm truncate " + textCls}>{a.title || '—'}</div>
                        <div className={"text-xs mt-0.5 " + mutedCls}>{a.city || '—'} · {a.category || '—'}</div>
                        {a.price && <div className={"text-xs font-semibold mt-0.5 text-green-600"}>{a.price?.toLocaleString()} د.م.</div>}
                        {a.phone && <div className={"text-xs " + mutedCls}>{a.phone}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => approveAd(a.id, a.user_id || a.advertiser_id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white text-xs font-medium rounded-xl">
                        <CheckCircle size={13} /> قبول
                      </button>
                      <button onClick={() => rejectAd(a.id, a.user_id || a.advertiser_id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500 text-white text-xs font-medium rounded-xl">
                        <XCircle size={13} /> رفض
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* الإعلانات النشطة */}
            <div className={cardCls + " overflow-hidden"}>
              <div className={"px-4 py-3 border-b border-neutral-50 dark:border-neutral-800"}>
                <h2 className={"font-semibold text-sm " + textCls}>الإعلانات النشطة ({ads.length})</h2>
              </div>
              {ads.length === 0
                ? <p className={"text-center text-sm py-8 " + mutedCls}>لا توجد إعلانات نشطة</p>
                : ads.map((a: any) => (
                  <div key={a.id} className={"flex items-center gap-3 px-4 py-4 " + rowCls}>
                    {a.images?.[0] && (
                      <img src={a.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={"font-medium text-sm truncate " + textCls}>{a.title || a.headline || '—'}</div>
                      <div className={"text-xs mt-0.5 " + mutedCls}>{a.city || '—'} · {a.views_count ?? 0} مشاهدة</div>
                      <div className="flex items-center gap-2 mt-1">
                        {a.is_vip && <span className="text-[10px] bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">VIP</span>}
                        <span className="text-[10px] bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">نشط</span>
                      </div>
                    </div>
                    <button onClick={() => toggleAd(a.id, a.status)}
                      className="px-3 py-1.5 text-xs font-medium rounded-xl shrink-0 bg-red-50 text-red-600">
                      إيقاف
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* COMMISSIONS */}
        {tab === 'commissions' && (
          <div className="space-y-4">
            <h1 className={titleCls}>إدارة العمولات</h1>
            <div className={cardCls + " p-4 mb-4"}>
              <p className={"text-xs " + mutedCls + " mb-3"}>العمولات التلقائية حسب المستوى</p>
              <div className="grid grid-cols-3 gap-3">
                {[{ tier: 'Basic', rate: '6%', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400' }, { tier: 'Verified', rate: '4%', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' }, { tier: 'Premium', rate: '2%', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' }].map(({ tier, rate, color }) => (
                  <div key={tier} className={`rounded-xl p-3 text-center ${color}`}>
                    <p className="text-lg font-bold">{rate}</p>
                    <p className="text-xs mt-0.5">{tier}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={cardCls + " p-4"}>
              <h2 className={"font-semibold text-sm mb-3 " + textCls}>العمولة العامة (تجاوز يدوي)</h2>
              <div className="flex items-center gap-3">
                <input type="number" value={globalCommission} onChange={e => setGlobalCommission(Number(e.target.value))}
                  min={0} max={50} className="w-24 px-3 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl text-sm text-center" />
                <span className={"text-sm " + mutedCls}>%</span>
                <button onClick={async () => {
                  const supabase = createClient()
                  await supabase.from('profiles').update({ commission_rate: globalCommission }).eq('role', 'seller')
                  toast.success('تم تحديث العمولة العامة ✅')
                  setSellers(prev => prev.map(s => ({ ...s, commission_rate: globalCommission })))
                }} className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-xl">
                  تطبيق على الجميع
                </button>
              </div>
            </div>
            <div className={cardCls + " overflow-hidden"}>
              <div className={"px-4 py-3 " + rowCls}>
                <h2 className={"font-semibold text-sm " + textCls}>عمولة كل متجر</h2>
              </div>
              {sellers.map((s: any) => (
                <div key={s.id} className={"flex items-center gap-3 px-4 py-3 " + rowCls}>
                  <div className="flex-1 min-w-0">
                    <div className={"font-medium text-sm " + textCls}>{s.store_name || s.full_name || '—'}</div>
                    <div className={"text-xs " + mutedCls}>{s.tier || 'basic'}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input type="number" defaultValue={s.commission_rate ?? 10} min={0} max={50}
                      className="w-16 px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl text-sm text-center"
                      onBlur={e => updateCommission(s.id, Number(e.target.value))} />
                    <span className={"text-xs " + mutedCls}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FLAGS */}
        {tab === 'flags' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className={titleCls}>البلاغات</h1>
              <span className={"text-sm " + mutedCls}>{flags.length} بلاغ مفتوح</span>
            </div>
            <div className={cardCls + " overflow-hidden"}>
              {flags.length === 0
                ? <p className={"text-center text-sm py-8 " + mutedCls}>لا توجد بلاغات مفتوحة ✅</p>
                : flags.map((f: any) => (
                  <div key={f.id} className={"px-4 py-4 " + rowCls}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className={"text-sm font-semibold " + textCls}>{'بلاغ #' + f.id.slice(-6).toUpperCase()}</span>
                        <div className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium px-2.5 py-1 rounded-lg mt-1 mb-1">
                          <Flag size={10} />{reasonLabel[f.reason] || f.reason || 'بدون سبب'}
                        </div>
                        <div className={"text-[10px] " + mutedCls}>{new Date(f.created_at).toLocaleDateString('ar-MA')}</div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => setSelectedFlag(f)} className="px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-medium rounded-xl">التفاصيل</button>
                        <button onClick={() => resolveFlag(f.id)} className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-xl">معالجة</button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="space-y-4">
            <h1 className={titleCls}>جميع الطلبات</h1>
            <div className={cardCls + " overflow-hidden"}>
              {recentOrders.length === 0
                ? <p className={"text-center text-sm py-8 " + mutedCls}>لا توجد طلبات</p>
                : recentOrders.map((o: any) => (
                  <div key={o.id} className={"flex items-center gap-3 px-4 py-3 " + rowCls}>
                    <div className="flex-1">
                      <div className={"text-sm font-medium " + textCls}>#{o.id.slice(-6).toUpperCase()}</div>
                      <div className={"text-xs " + mutedCls}>{new Date(o.created_at).toLocaleDateString('ar-MA')}</div>
                    </div>
                    <div className={"text-sm font-bold " + textCls}>{o.total?.toLocaleString()} د.م.</div>
                    <span className={`text-xs px-2.5 py-1 rounded-xl font-medium ${o.status === 'delivered' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : o.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>{o.status}</span>
                    <button onClick={() => handleAdminInvoice(o)} disabled={generatingPdf === o.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-xl disabled:opacity-50 shrink-0">
                      <FileText size={12} />
                      {generatingPdf === o.id ? '...' : 'PDF'}
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Flag Modal */}
        {selectedFlag && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedFlag(null) }}>
            <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className={"font-bold text-lg " + textCls}>تفاصيل البلاغ</h3>
                <button onClick={() => setSelectedFlag(null)} className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <XCircle size={20} className="text-neutral-400" />
                </button>
              </div>
              <div className="space-y-3">
                <div className={"rounded-2xl p-4 bg-neutral-50 dark:bg-neutral-800"}>
                  <span className={"text-xs font-medium " + mutedCls}>رقم البلاغ</span>
                  <p className={"font-semibold text-sm mt-1 " + textCls}>#{selectedFlag.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="rounded-2xl p-4 bg-red-50 dark:bg-red-900/20">
                  <span className="text-xs font-medium text-red-500">سبب البلاغ</span>
                  <p className="font-semibold text-sm text-red-700 dark:text-red-300 mt-1">{reasonLabel[selectedFlag.reason] || selectedFlag.reason || 'بدون سبب'}</p>
                </div>
                {selectedFlag.details && (
                  <div className={"rounded-2xl p-4 bg-neutral-50 dark:bg-neutral-800"}>
                    <span className={"text-xs font-medium " + mutedCls}>تفاصيل</span>
                    <p className={"text-sm mt-1 " + textCls}>{selectedFlag.details}</p>
                  </div>
                )}
                <div className={"rounded-2xl p-4 bg-neutral-50 dark:bg-neutral-800"}>
                  <span className={"text-xs font-medium " + mutedCls}>التاريخ</span>
                  <p className={"text-sm mt-1 " + textCls}>{new Date(selectedFlag.created_at).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <a href={`/ar/product/${selectedFlag.product_id}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600">
                  <ExternalLink size={14} /> عرض المنتج
                </a>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { resolveFlag(selectedFlag.id); setSelectedFlag(null) }}
                  className="flex-1 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-xl text-sm">
                  معالجة البلاغ ✅
                </button>
                <button onClick={() => setSelectedFlag(null)} className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium rounded-xl text-sm">
                  إغلاق
                </button>
              </div>
            </div>
          </div>
           {tab === 'analytics' && (
          <div className="space-y-4">
            <h1 className={titleCls}>الإحصائيات</h1>
            <div className={cardCls + " p-4 text-center"}>
              <p className={"text-sm " + mutedCls}>
                افتح صفحة الإحصائيات التفصيلية 👇
              </p>
              <a href="/ar/admin/analytics"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-sm font-semibold">
                <TrendingUp size={15} />
                عرض الإحصائيات المبيانية
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 start-0 end-0 bg-neutral-950 border-t border-neutral-800 flex z-50 overflow-x-auto">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-colors min-w-[50px] ${tab === key ? 'text-white' : 'text-neutral-500'}`}>
            <Icon size={16} strokeWidth={tab === key ? 2.5 : 1.8} />{label}
          </button>
        ))}
      </nav>
    </div>
  )
}