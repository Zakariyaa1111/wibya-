import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ProductCard } from '@/components/product/ProductCard'
import { HomeTabs } from '@/components/feed/HomeTabs'
import Link from 'next/link'
import Image from 'next/image'
import { Search, TrendingUp, Shield, Star, Code2, Zap } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: featured },
    { data: newest },
    { data: topSelling },
    { data: topDevelopers },
  ] = await Promise.all([
    supabase.from('digital_products')
      .select('id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles!developer_id(full_name, store_name, is_verified)')
      .eq('status', 'active')
      .eq('featured', true)
      .limit(6),
    supabase.from('digital_products')
      .select('id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles!developer_id(full_name, store_name, is_verified)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('digital_products')
      .select('id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles!developer_id(full_name, store_name, is_verified)')
      .eq('status', 'active')
      .order('sales_count', { ascending: false })
      .limit(8),
    supabase.from('profiles')
      .select('id, full_name, store_name, store_image, is_verified, total_sales, followers_count')
      .eq('role', 'developer')
      .order('total_sales', { ascending: false })
      .limit(6),
  ])

  const CATEGORIES = [
    { key: 'template', label: 'قوالب متاجر', icon: '🛍️', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { key: 'tool', label: 'أدوات', icon: '🔧', color: 'bg-green-50 dark:bg-green-900/20' },
    { key: 'course', label: 'دورات', icon: '🎓', color: 'bg-purple-50 dark:bg-purple-900/20' },
    { key: 'ui_kit', label: 'UI Kits', icon: '🎨', color: 'bg-pink-50 dark:bg-pink-900/20' },
    { key: 'saas', label: 'SaaS', icon: '⚡', color: 'bg-amber-50 dark:bg-amber-900/20' },
    { key: 'other', label: 'أخرى', icon: '📦', color: 'bg-neutral-50 dark:bg-neutral-800' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />

      <main className="pb-24">

        {/* Hero */}
        <div className="bg-neutral-900 dark:bg-neutral-950 px-4 pt-8 pb-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image src="/logo.png" alt="Wibya" width={40} height={40} className="object-contain" />
              <span className="text-white font-bold text-xl">Wibya</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
              سوق المنتجات الرقمية العربي
            </h1>
            <p className="text-white/60 text-sm mb-6">
              قوالب، أدوات، ودورات تعليمية من أفضل المطورين العرب
            </p>

            <Link href="/search"
              className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl px-4 py-3.5 transition-colors w-full max-w-sm mx-auto"
              aria-label="البحث في المنتجات"
            >
              <Search size={18} className="text-white/50" aria-hidden="true" />
              <span className="text-white/50 text-sm">ابحث عن قوالب، أدوات...</span>
            </Link>

            <div className="flex justify-center gap-6 mt-6">
              {[
                { value: `${(newest?.length || 0) + (topSelling?.length || 0)}+`, label: 'منتج' },
                { value: `${topDevelopers?.length || 0}+`, label: 'مطور' },
                { value: '100%', label: 'مفحوص' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-white font-bold text-lg">{value}</p>
                  <p className="text-white/50 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 py-5">
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">الفئات</h2>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.key}
                href={`/search?category=${cat.key}`}
                className={`${cat.color} rounded-2xl p-3 text-center hover:scale-[1.02] transition-transform`}
              >
                <span className="text-2xl block mb-1" aria-hidden="true">{cat.icon}</span>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{cat.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Why Wibya */}
        <div className="px-4 mb-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Shield, text: 'كل منتج مفحوص بـ AI', color: 'text-green-500' },
              { icon: Star, text: 'تقييمات حقيقية', color: 'text-amber-500' },
              { icon: Zap, text: 'تحميل فوري', color: 'text-blue-500' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 text-center">
                <Icon size={18} className={`${color} mx-auto mb-1.5`} aria-hidden="true" />
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured */}
        {featured && featured.length > 0 && (
          <section className="px-4 mb-6" aria-labelledby="featured-title">
            <h2 id="featured-title" className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-amber-500" aria-hidden="true" />
              منتجات مميزة
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {featured.map(product => (
                <ProductCard key={product.id} product={product as any} featured />
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <HomeTabs newest={newest ?? []} topSelling={topSelling ?? []} />

        {/* Top Developers */}
        {topDevelopers && topDevelopers.length > 0 && (
          <section className="px-4 mt-6" aria-labelledby="developers-title">
            <div className="flex items-center justify-between mb-3">
              <h2 id="developers-title" className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                <Code2 size={15} className="text-neutral-500" aria-hidden="true" />
                أفضل المطورين
              </h2>
              <Link href="/developers" className="text-xs text-neutral-400">
                عرض الكل
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {topDevelopers.map((dev: any) => (
                <Link key={dev.id} href={`/developer/${dev.id}`}>
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 text-center w-32 shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden mx-auto mb-2 flex items-center justify-center text-lg font-bold text-neutral-500">
                      {dev.store_image
                        ? <Image src={dev.store_image} alt={dev.store_name || ''} width={48} height={48} className="object-cover w-full h-full" />
                        : (dev.store_name || dev.full_name || 'D').charAt(0)
                      }
                    </div>
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                      {dev.store_name || dev.full_name}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{dev.total_sales || 0} مبيعة</p>
                    {dev.is_verified && (
                      <span className="text-[9px] text-blue-500 font-medium">موثق ✓</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="px-4 mt-6">
          <div className="bg-neutral-900 dark:bg-neutral-800 rounded-3xl p-5 text-center">
            <Code2 size={28} className="text-white/80 mx-auto mb-3" aria-hidden="true" />
            <h3 className="font-bold text-white text-base mb-1">أنت مطور؟</h3>
            <p className="text-white/60 text-xs mb-4">بيع منتجاتك لآلاف المشترين العرب</p>
            <Link
              href="/auth/register?role=developer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-neutral-900 font-bold rounded-xl text-sm hover:bg-neutral-100 transition-colors"
            >
              <Code2 size={15} aria-hidden="true" />
              ابدأ البيع مجاناً
            </Link>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}