import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import {
  Plus, Package, Eye, Download, Star,
  CheckCircle, Clock, XCircle, AlertCircle,
  Shield, ArrowRight
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'منتجاتي | Wibya' }

export default async function DeveloperProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'developer' && profile?.role !== 'admin') redirect('/ar')

  const { data: products } = await supabase
    .from('digital_products')
    .select('*')
    .eq('developer_id', user.id)
    .order('created_at', { ascending: false })

  const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    active: { label: 'نشط', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    pending: { label: 'انتظار المراجعة', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    rejected: { label: 'مرفوض', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    draft: { label: 'مسودة', icon: AlertCircle, color: 'text-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800' },
    suspended: { label: 'موقوف', icon: XCircle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  }

  const stats = {
    total: products?.length ?? 0,
    active: products?.filter(p => p.status === 'active').length ?? 0,
    pending: products?.filter(p => p.status === 'pending').length ?? 0,
    rejected: products?.filter(p => p.status === 'rejected').length ?? 0,
    totalSales: products?.reduce((s, p) => s + (p.sales_count || 0), 0) ?? 0,
    totalViews: products?.reduce((s, p) => s + (p.views_count || 0), 0) ?? 0,
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-4 px-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link href="/developer/dashboard"
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="رجوع للوحة">
              <ArrowRight size={16} className="text-neutral-500 rotate-180" aria-hidden="true" />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">منتجاتي</h1>
          </div>
          <Link
            href="/developer/products/new"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <Plus size={14} aria-hidden="true" />
            جديد
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'الكل', value: stats.total, color: 'text-neutral-900 dark:text-white' },
            { label: 'نشط', value: stats.active, color: 'text-green-600' },
            { label: 'انتظار', value: stats.pending, color: 'text-amber-600' },
            { label: 'مبيعات', value: stats.totalSales, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 text-center">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Products List */}
        {!products?.length ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-10 text-center">
            <Package size={40} className="text-neutral-300 mx-auto mb-3" aria-hidden="true" />
            <p className="font-semibold text-neutral-900 dark:text-white mb-1">لا توجد منتجات بعد</p>
            <p className="text-neutral-400 text-sm mb-4">ارفع أول منتج وابدأ بالبيع</p>
            <Link href="/developer/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl text-sm">
              <Plus size={15} aria-hidden="true" />
              إضافة منتج
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(p => {
              const status = statusConfig[p.status] ?? statusConfig.draft
              const StatusIcon = status.icon

              return (
                <div key={p.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                  <div className="flex items-start gap-3 p-4">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 relative">
                      {p.preview_images?.[0] ? (
                        <Image src={p.preview_images[0]} alt={p.title} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-neutral-300" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{p.title}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{p.category} · v{p.version}</p>

                      {/* Status */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.color} ${status.bg}`}>
                          <StatusIcon size={10} aria-hidden="true" />
                          {status.label}
                        </span>
                        {p.quality_badge && (
                          <span className="flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 font-medium">
                            <Shield size={10} aria-hidden="true" /> مفحوص
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-end shrink-0">
                      <p className="font-bold text-neutral-900 dark:text-white">${p.price}</p>
                      {p.claude_score !== null && (
                        <p className={`text-[10px] font-medium ${
                          (p.claude_score ?? 0) >= 70 ? 'text-green-600' :
                          (p.claude_score ?? 0) >= 50 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {p.claude_score}/100
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="flex items-center gap-4 px-4 py-2.5 border-t border-neutral-50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Eye size={12} aria-hidden="true" />
                      <span>{p.views_count?.toLocaleString() ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Download size={12} aria-hidden="true" />
                      <span>{p.sales_count ?? 0}</span>
                    </div>
                    {p.average_rating > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <Star size={12} className="text-amber-400" aria-hidden="true" />
                        <span>{p.average_rating?.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="ms-auto flex items-center gap-2">
                      {p.status === 'active' && (
                        <Link
                          href={`/product/${p.id}`}
                          className="text-[10px] text-blue-500 hover:underline"
                        >
                          عرض
                        </Link>
                      )}
                      {p.status === 'rejected' && (
                        <Link
                          href="/developer/products/new"
                          className="text-[10px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        >
                          إعادة رفع
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Rejection Note */}
                  {p.status === 'rejected' && (
                    <div className="mx-4 mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <p className="text-xs text-red-600 dark:text-red-400">
                        ❌ تم رفض هذا المنتج. راجع تقرير Claude وأعد الرفع مع التصحيحات اللازمة.
                      </p>
                    </div>
                  )}

                  {/* Pending Note */}
                  {p.status === 'pending' && (
                    <div className="mx-4 mb-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        ⏳ المنتج قيد المراجعة — سيتم الفصل خلال 24-48 ساعة.
                      </p>
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