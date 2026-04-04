import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import {
  Package, DollarSign, Eye, Star, TrendingUp,
  Plus, ArrowUpRight, Clock, CheckCircle,
  XCircle, AlertCircle, Wallet, Users, Code2
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'لوحة المطور | Wibya' }

export default async function DeveloperDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, wallets(*)')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'developer' && profile?.role !== 'admin') {
    redirect('/ar')
  }

  const [
    { data: products },
    { data: recentSales },
  ] = await Promise.all([
    supabase.from('digital_products')
      .select('id, title, status, price, views_count, sales_count, average_rating, quality_badge, claude_score, created_at, preview_images, category')
      .eq('developer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('purchases')
      .select('id, amount, developer_amount, created_at, status, digital_products(title, preview_images)')
      .eq('developer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const productIds = (products ?? []).map((p: any) => p.id)
  const { data: ratings } = productIds.length > 0
    ? await supabase.from('product_reviews')
        .select('rating, comment, created_at, profiles(full_name), digital_products(title)')
        .in('product_id', productIds)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  const wallet = (profile as any)?.wallets

  // إحصائيات
  const totalViews = products?.reduce((s, p) => s + (p.views_count || 0), 0) ?? 0
  const totalSales = products?.reduce((s, p) => s + (p.sales_count || 0), 0) ?? 0
  const activeProducts = products?.filter(p => p.status === 'active').length ?? 0
  const pendingProducts = products?.filter(p => p.status === 'pending').length ?? 0
  const avgRating = ratings?.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : '—'

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    active: { label: 'نشط', icon: CheckCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    pending: { label: 'انتظار', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    rejected: { label: 'مرفوض', icon: XCircle, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
    draft: { label: 'مسودة', icon: AlertCircle, color: 'text-neutral-400 bg-neutral-100 dark:bg-neutral-800' },
    suspended: { label: 'موقوف', icon: XCircle, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />

      <main className="pb-24 pt-4 px-4 max-w-2xl mx-auto space-y-4">

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              مرحباً، {profile?.store_name || profile?.full_name || 'مطور'} 👋
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">لوحة تحكم المطور</p>
          </div>
          <Link
            href="/developer/products/new"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <Plus size={14} aria-hidden="true" />
            منتج جديد
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: Wallet,
              label: 'الرصيد المتاح',
              value: `$${wallet?.balance?.toFixed(2) ?? '0.00'}`,
              sub: `إجمالي: $${wallet?.total_earned?.toFixed(2) ?? '0.00'}`,
              color: 'text-green-600',
              href: '/developer/wallet',
            },
            {
              icon: DollarSign,
              label: 'قيد الإفراج',
              value: `$${wallet?.pending_balance?.toFixed(2) ?? '0.00'}`,
              sub: 'Escrow 48 ساعة',
              color: 'text-amber-600',
              href: null,
            },
            {
              icon: Package,
              label: 'المنتجات',
              value: `${activeProducts} نشط`,
              sub: pendingProducts > 0 ? `${pendingProducts} انتظار` : 'لا يوجد انتظار',
              color: 'text-blue-600',
              href: '/developer/products',
            },
            {
              icon: TrendingUp,
              label: 'المبيعات',
              value: `${totalSales}`,
              sub: `${totalViews.toLocaleString()} مشاهدة`,
              color: 'text-purple-600',
              href: null,
            },
            {
              icon: Star,
              label: 'متوسط التقييم',
              value: avgRating,
              sub: `${ratings?.length ?? 0} تقييم`,
              color: 'text-amber-500',
              href: null,
            },
            {
              icon: Users,
              label: 'المتابعون',
              value: `${profile?.followers_count ?? 0}`,
              sub: 'متابع',
              color: 'text-teal-600',
              href: null,
            },
          ].map(({ icon: Icon, label, value, sub, color, href }) => {
            const card = (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
                <Icon size={18} className={`${color} mb-2`} aria-hidden="true" />
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{value}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
                <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-0.5">{sub}</p>
              </div>
            )
            return href ? (
              <Link key={label} href={href}>{card}</Link>
            ) : (
              <div key={label}>{card}</div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/developer/products/new"
            className="flex items-center gap-3 bg-neutral-900 dark:bg-white p-4 rounded-2xl hover:opacity-90 transition-opacity">
            <Plus size={18} className="text-white dark:text-neutral-900" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-white dark:text-neutral-900">رفع منتج</p>
              <p className="text-[10px] text-white/60 dark:text-neutral-900/60">أضف منتجاً جديداً</p>
            </div>
          </Link>
          <Link href="/developer/wallet"
            className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl hover:border-neutral-300 transition-colors">
            <Wallet size={18} className="text-green-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">سحب الأموال</p>
              <p className="text-[10px] text-neutral-400">PayPal متاح</p>
            </div>
          </Link>
        </div>

        {/* Products */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm">منتجاتي ({products?.length ?? 0})</h2>
            <Link href="/developer/products" className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1">
              عرض الكل <ArrowUpRight size={12} />
            </Link>
          </div>

          {!products?.length ? (
            <div className="p-8 text-center">
              <Code2 size={32} className="text-neutral-300 mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-neutral-400 mb-3">لا توجد منتجات بعد</p>
              <Link href="/developer/products/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-medium">
                <Plus size={13} /> أضف أول منتج
              </Link>
            </div>
          ) : (
            products.slice(0, 5).map(p => {
              const status = statusConfig[p.status] ?? statusConfig.draft
              const StatusIcon = status.icon
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 relative">
                    {p.preview_images?.[0] ? (
                      <Image src={p.preview_images[0]} alt={p.title} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={18} className="text-neutral-300" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${status.color}`}>
                        <StatusIcon size={10} aria-hidden="true" />
                        {status.label}
                      </span>
                      {p.quality_badge && (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">✓ مفحوص</span>
                      )}
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">${p.price}</p>
                    <p className="text-[10px] text-neutral-400">{p.sales_count} مبيعة</p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Recent Sales */}
        {recentSales && recentSales.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm">آخر المبيعات</h2>
            </div>
            {recentSales.map(sale => {
              const prod = sale.digital_products as any
              return (
                <div key={sale.id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {prod?.title ?? '—'}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(sale.created_at).toLocaleDateString('ar-MA')}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-bold text-green-600">+${sale.developer_amount?.toFixed(2)}</p>
                    <span className={`text-[10px] font-medium ${
                      sale.status === 'completed' ? 'text-green-500' :
                      sale.status === 'escrow' ? 'text-amber-500' : 'text-neutral-400'
                    }`}>
                      {sale.status === 'completed' ? 'مكتمل' : sale.status === 'escrow' ? 'Escrow' : sale.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Recent Reviews */}
        {ratings && ratings.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm">آخر التقييمات</h2>
            </div>
            {ratings.map((r: any, i: number) => (
              <div key={i} className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {r.profiles?.full_name || 'مستخدم'}
                  </p>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={11} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 dark:text-neutral-700'} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-xs text-neutral-400">{r.comment}</p>}
                <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-0.5 truncate">
                  {r.digital_products?.title}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Wibya Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            💡 كل منتج يُفحص تلقائياً بـ <strong>Claude AI</strong> قبل النشر.
            المنتجات التي تحصل على <strong>70+/100</strong> تحصل على شارة جودة Wibya.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}