'use client'
import { useEffect, useState, useRef } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ProductCard } from '@/components/product/ProductCard'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Shield, Star, Code2, Zap, MessageCircle } from 'lucide-react'

// عدّاد أرقام متحرك
function AnimatedCounter({ target, label, duration = 2000 }: { target: number; label: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl font-bold text-neutral-900 dark:text-white">{count}+</p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{label}</p>
    </div>
  )
}

// مكوّن ظهور عند التمرير
function FadeInOnScroll({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

interface HomeClientProps {
  featured: any[]
  newest: any[]
  topSelling: any[]
  topDevelopers: any[]
}

export default function HomeClient({ featured, newest, topSelling, topDevelopers }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<'newest' | 'top'>('newest')
  const sliderRef = useRef<HTMLDivElement>(null)

  // تمرير تلقائي للسلايدر
  useEffect(() => {
    if (!featured || featured.length === 0) return
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          sliderRef.current.scrollBy({ left: 280, behavior: 'smooth' })
        }
      }
    }, 3500)
    return () => clearInterval(interval)
  }, [featured])

  const CATEGORIES = [
    { key: 'ecommerce', label: 'قوالب تجارة إلكترونية', image: '/cat-ecommerce.png' },
    { key: 'portfolio', label: 'قوالب حافظة أعمال', image: '/cat-portfolio.png' },
    { key: 'blog', label: 'قوالب مدونات وأخبار', image: '/cat-blog.png' },
    { key: 'corporate', label: 'قوالب شركات', image: '/cat-corporate.png' },
  ]

  const currentList = activeTab === 'newest' ? newest : topSelling

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />

      <main className="pb-24">

        {/* Hero — صورة فقط بدون أي شيء فوقها */}
        <div className="relative overflow-hidden">
          <div className="relative aspect-[16/9] max-h-[400px] w-full">
            <Image
              src="/hero-bg.png"
              alt="Wibya — أفضل القوالب الإلكترونية"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-neutral-50 dark:to-neutral-950" />
          </div>
        </div>

        {/* عدّاد أرقام متحرك */}
        <FadeInOnScroll>
          <div className="px-4 py-6">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-6 grid grid-cols-3 gap-4">
              <AnimatedCounter target={50} label="قالب احترافي" />
              <AnimatedCounter target={100} label="مشتري" />
              <AnimatedCounter target={15} label="مطور موثق" />
            </div>
          </div>
        </FadeInOnScroll>

        {/* Categories — صور كبيرة تحت بعضها */}
        <div className="px-4 py-2">
          <FadeInOnScroll>
            <h2 className="font-bold text-neutral-900 dark:text-white text-base mb-4">
              تصفح القوالب
            </h2>
          </FadeInOnScroll>
          <div className="flex flex-col gap-4">
            {CATEGORIES.map((cat, i) => (
              <FadeInOnScroll key={cat.key} delay={i * 0.1}>
                <Link
                  href={`/search?category=${cat.key}`}
                  className="group relative block rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500"
                >
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={cat.image}
                      alt={cat.label}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </Link>
              </FadeInOnScroll>
            ))}
          </div>
        </div>

        {/* لماذا Wibya */}
        <div className="px-4 py-6">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Shield, text: 'كل قالب مفحوص بـ AI', color: 'text-green-500' },
              { icon: Star, text: 'تقييمات حقيقية', color: 'text-amber-500' },
              { icon: Zap, text: 'تحميل فوري', color: 'text-blue-500' },
            ].map(({ icon: Icon, text, color }, i) => (
              <FadeInOnScroll key={text} delay={i * 0.1}>
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 text-center">
                  <Icon size={18} className={`${color} mx-auto mb-1.5`} aria-hidden="true" />
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">{text}</p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>

        {/* شريط تمرير تلقائي — قوالب مميزة */}
        {featured && featured.length > 0 && (
          <section className="py-4" aria-labelledby="featured-title">
            <FadeInOnScroll>
              <h2 id="featured-title" className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2 mb-4 px-4">
                <TrendingUp size={16} className="text-amber-500" aria-hidden="true" />
                قوالب مميزة
              </h2>
            </FadeInOnScroll>
            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featured.map((product, i) => (
                <FadeInOnScroll key={product.id} delay={i * 0.08} className="w-[280px] shrink-0 snap-start">
                  <ProductCard product={product as any} />
                </FadeInOnScroll>
              ))}
            </div>
            {/* نقاط السلايدر */}
            <div className="flex justify-center gap-1.5 mt-2">
              {featured.slice(0, 6).map((_: any, i: number) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              ))}
            </div>
          </section>
        )}

        {/* تبويبات — الأحدث / الأكثر مبيعاً */}
        <FadeInOnScroll>
          <div className="px-4 pt-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('newest')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'newest'
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                }`}
              >
                الأحدث
              </button>
              <button
                onClick={() => setActiveTab('top')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'top'
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                }`}
              >
                الأكثر مبيعاً
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {currentList.map((product: any, i: number) => (
                <FadeInOnScroll key={product.id} delay={i * 0.05}>
                  <ProductCard product={product as any} featured />
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        {/* أفضل المطورين */}
        {topDevelopers && topDevelopers.length > 0 && (
          <section className="px-4 mt-6" aria-labelledby="developers-title">
            <FadeInOnScroll>
              <div className="flex items-center justify-between mb-3">
                <h2 id="developers-title" className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
                  <Code2 size={16} className="text-neutral-500" aria-hidden="true" />
                  أفضل المطورين
                </h2>
                <Link href="/developers" className="text-xs text-neutral-400">عرض الكل</Link>
              </div>
            </FadeInOnScroll>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {topDevelopers.map((dev: any, i: number) => (
                <FadeInOnScroll key={dev.id} delay={i * 0.08}>
                  <Link href={`/developer/${dev.id}`}>
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 text-center w-32 shrink-0 hover:shadow-md hover:scale-[1.03] transition-all duration-300">
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
                </FadeInOnScroll>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <FadeInOnScroll>
          <div className="px-4 mt-6">
            <div className="bg-neutral-900 dark:bg-neutral-800 rounded-3xl p-6 text-center">
              <Code2 size={28} className="text-white/80 mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-bold text-white text-lg mb-1">أنت مطور؟</h3>
              <p className="text-white/60 text-sm mb-4">بيع قوالبك لآلاف المشترين العرب</p>
              <Link
                href="/auth/register?role=developer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 font-bold rounded-xl text-sm hover:bg-neutral-100 transition-colors"
              >
                <Code2 size={15} aria-hidden="true" />
                ابدأ البيع مجاناً
              </Link>
            </div>
          </div>
        </FadeInOnScroll>
      </main>

      {/* زر واتساب عائم */}
      <a
        href="https://wa.me/212XXXXXXXXX"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 left-4 z-30 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="تواصل معنا عبر واتساب"
        style={{ animation: 'fadeInUp 0.6s ease-out 1s both' }}
      >
        <MessageCircle size={26} className="text-white" fill="white" aria-hidden="true" />
      </a>

      <BottomNav />
    </div>
  )
}