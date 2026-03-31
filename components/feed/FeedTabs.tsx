'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FeedItem } from '@/components/feed/FeedItem'
import { AdCard } from '@/components/feed/AdCard'

const TABS = [
  { key: 'forYou', label: 'لك' },
  { key: 'new', label: 'الجديد' },
  { key: 'nearby', label: 'قريب منك' },
  { key: 'trending', label: 'الأكثر رواجاً' },
] as const

type TabKey = typeof TABS[number]['key']

export function FeedTabs() {
  const [active, setActive] = useState<TabKey>('forYou')
  const [products, setProducts] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userCity, setUserCity] = useState<string | null>(null)

  // جلب مدينة المستخدم
  useEffect(() => {
    async function getCity() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('city').eq('id', user.id).single()
        setUserCity(data?.city || null)
      }
    }
    getCity()
  }, [])

  const fetchProducts = useCallback(async (tab: TabKey) => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('products')
      .select('*, profiles(store_name, store_image, verified)')
      .eq('status', 'active')

    switch (tab) {
      case 'forYou':
        // منتجات مميزة أولاً ثم الأحدث
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
        break
      case 'new':
        // الأحدث أولاً
        query = query.order('created_at', { ascending: false })
        break
      case 'nearby':
        // فرز حسب المدينة
        if (userCity) {
          query = query.eq('city', userCity).order('created_at', { ascending: false })
        } else {
          query = query.order('created_at', { ascending: false })
        }
        break
      case 'trending':
        // الأكثر مشاهدة
        query = query.order('views_count', { ascending: false })
        break
    }

    const { data } = await query.limit(15).returns<any[]>()
    setProducts(data ?? [])

    // جلب الإعلانات
    const { data: adsData } = await supabase
      .from('ads')
      .select('*, profiles(full_name, verified)')
      .eq('status', 'active')
      .order('is_vip', { ascending: false })
      .limit(3)
      .returns<any[]>()
    setAds(adsData ?? [])

    setLoading(false)
  }, [userCity])

  useEffect(() => {
    fetchProducts(active)
  }, [active, fetchProducts])

  // دمج المنتجات والإعلانات
  type FeedEntry =
    | { type: 'product'; data: any; key: string }
    | { type: 'ad'; data: any; key: string }

  const feed: FeedEntry[] = []
  let adIdx = 0
  products.forEach((product, i) => {
    feed.push({ type: 'product', data: product, key: product.id })
    if ((i + 1) % 4 === 0 && adIdx < ads.length) {
      feed.push({ type: 'ad', data: ads[adIdx++], key: ads[adIdx - 1]?.id + '-ad' })
    }
  })

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
              active === tab.key
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {tab.label}
            {tab.key === 'nearby' && !userCity && (
              <span className="ms-1 text-[10px] opacity-60">📍</span>
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-neutral-100 dark:bg-neutral-800 rounded-3xl animate-pulse" style={{ height: '400px' }} />
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="text-4xl mb-4">
            {active === 'nearby' ? '📍' : '🛍️'}
          </div>
          <h2 className="font-semibold text-neutral-900 dark:text-white text-lg mb-2">
            {active === 'nearby' && !userCity
              ? 'سجل دخولك لرؤية المنتجات القريبة'
              : active === 'nearby'
              ? `لا توجد منتجات في ${userCity}`
              : 'لا توجد منتجات بعد'
            }
          </h2>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm">
            {active === 'nearby' && !userCity ? 'أو حدث مدينتك في الإعدادات' : 'تفقد لاحقاً!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-4 pb-4">
          {feed.map((entry, i) =>
            entry.type === 'product' ? (
              <FeedItem key={entry.key} product={entry.data} index={i} />
            ) : (
              <AdCard key={entry.key} ad={entry.data} index={i} />
            )
          )}
        </div>
      )}
    </div>
  )
}