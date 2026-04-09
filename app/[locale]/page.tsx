import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ProductCard } from '@/components/product/ProductCard'
import { HomeTabs } from '@/components/feed/HomeTabs'
import Link from 'next/link'
import Image from 'next/image'
import { Search, TrendingUp, Shield, Star, Code2, Zap } from 'lucide-react'

export const revalidate = 0
export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: featured },
    { data: newest },
    { data: topSelling },
    { data: topDevelopers },
  ] = await Promise.all([
    supabase.from('digital_products')
      .select('id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles!developer_id(full_name, store_name, verified)')
      .eq('status', 'active')
      .eq('featured', true)
      .limit(6),
    supabase.from('digital_products')
      .select('id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles!developer_id(full_name, store_name, verified)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('digital_products')
      .select('id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles!developer_id(full_name, store_name, verified)')
      .eq('status', 'active')
      .order('sales_count', { ascending: false })
      .limit(8),
    supabase.from('profiles')
      .select('id, full_name, store_name, store_image, verified, total_sales, followers_count')
      .eq('role', 'developer')
      .order('total_sales', { ascending: false })
      .limit(6),
  ])

  const CATEGORIES = [
    { key: 'ecommerce', label: 'قوالب تجارة إلكترونية', image: '/cat-ecommerce.png' },
    { key: 'portfolio', label: 'قوالب حافظة أعمال', image: '/cat-portfolio.png' },
    { key: 'blog', label: 'قوالب مدونات وأخبار', image: '/cat-blog.png' },
    { key: 'corporate', label: 'قوالب شركات', image: '/cat-corporate.png' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />

      <main className="pb-24">

        {/* Hero — صورة خلفية + خانة البحث فقط */}
        <div className="relative px-4 pt-12 pb-14 overflow-hidden">
          <Image
            src="/hero-bg.png"
            alt=""
            fill
            className="object-cover"
            priority
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
          <div className="relative max-w-lg mx-auto" style={{ animation: 'fadeInUp 0.7s ease-out both' }}>
            <Link href="/search"
              className="flex items-center gap-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-white/50 dark:border-neutral-700 rounded-2xl px-4 py-4 transition-all hover:bg-white dark:hover:bg-neutral-800 shadow-lg w-full max-w-sm mx-auto"
              aria-label="البحث في القوالب"
            >
              <Search size={20} className="text-neutral-400" aria-hidden="true" />
              <span className="text-neutral-400 text-sm">ابحث عن قوالب مواقع...</span>
            </Link>
          </div>
        </div>

        {/* Categories — صور الفئات مع حركات */}
        <div className="px-4 py-6">
          <h2
            className="font-bold text-neutral-900 dark:text-white text-sm mb-4"
            style={{ animation: 'fadeInUp 0.5s ease-out both' }}
          >
            تصفح القوالب
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.key}
                href={`/search?category=${cat.key}`}
                className="group relative rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                style={{ animation: `fadeInUp 0.6s ease-out ${0.1 + i * 0.1}s both` }}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Why Wibya */}
        <div className="px-4 mb-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Shield, text: 'كل قالب مفحوص بـ AI', color: 'text-green-500' },
              { icon: Star, text: 'تقييمات حقيقية', color: 'text-amber-500' },
              { icon: Zap, text: 'تحميل فوري', color: 'text-blue-500' },
            ].map(({ icon: Icon, text, color }, i) => (
              <div
                key={text}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 text-center"
                style={{ animation: `fadeInUp 0.6s ease-out ${0.6 + i * 0.1}s both` }}
              >
                <Icon size={18} className={`${color} mx-auto mb-1.5`} aria-hidden="true" />
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured */}
        {featured && featured.length > 0 && (
          <section className="px-4 mb-6" aria-labelledby="featured-title">
            <h2
              id="featured-title"
              className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2 mb-3"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.9s both' }}
            >
              <TrendingUp size={15} className="text-amber-500" aria-hidden="true" />
              قوالب مميزة
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {featured.map((product, i) => (
                <div key={product.id} style={{ animation: `fadeInUp 0.5s ease-out ${1 + i * 0.08}s both` }}>
                  <ProductCard product={product as any} featured />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <div style={{ animation: 'fadeInUp 0.6s ease-out 1.2s both' }}>
          <HomeTabs newest={newest ?? []} topSelling={topSelling ?? []} />
        </div>

        {/* Top Developers */}
        {topDevelopers && topDevelopers.length > 0 && (
          <section className="px-4 mt-6" aria-labelledby="developers-title">
            <div
              className="flex items-center justify-between mb-3"
              style={{ animation: 'fadeInUp 0.6s ease-out 1.4s both' }}
            >
              <h2 id="developers-title" className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                <Code2 size={15} className="text-neutral-500" aria-hidden="true" />
                أفضل المطورين
              </h2>
              <Link href="/developers" className="text-xs text-neutral-400">
                عرض الكل
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {topDevelopers.map((dev: any, i: number) => (
                <Link key={dev.id} href={`/developer/${dev.id}`}>
                  <div
                    className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 text-center w-32 shrink-0 hover:shadow-md hover:scale-[1.03] transition-all duration-300"
                    style={{ animation: `fadeInUp 0.5s ease-out ${1.5 + i * 0.08}s both` }}
                  >
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
                    {dev.verified && (
                      <span className="text-[9px] text-blue-500 font-medium">موثق ✓</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="px-4 mt-6" style={{ animation: 'fadeInUp 0.6s ease-out 1.8s both' }}>
          <div className="bg-neutral-900 dark:bg-neutral-800 rounded-3xl p-5 text-center">
            <Code2 size={28} className="text-white/80 mx-auto mb-3" aria-hidden="true" />
            <h3 className="font-bold text-white text-base mb-1">أنت مطور؟</h3>
            <p className="text-white/60 text-xs mb-4">بيع قوالبك لآلاف المشترين العرب</p>
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