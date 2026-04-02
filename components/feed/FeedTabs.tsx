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
  { key: 'vipAds', label: '⭐ إعلانات مميزة' },
] as const

type TabKey = typeof TABS[number]['key']

export function FeedTabs() {
  const [active, setActive] = useState<TabKey>('forYou')
  const [products, setProducts] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userCity, setUserCity] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('city').eq('id', user.id).single()
        .then(({ data }) => setUserCity(data?.city || null))
    })
  }, [])

  const fetchData = useCallback(async (tab: TabKey) => {
    setLoading(true)
    const supabase = createClient()

    // تاب الإعلانات المميزة
    if (tab === 'vipAds') {
      const { data: vipAds } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .eq('is_vip', true)
        .order('created_at', { ascending: false })
        .limit(20)
        .returns<any[]>()

      // إعلانات عادية أيضاً
      const { data: normalAds } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .eq('is_vip', false)
        .order('created_at', { ascending: false })
        .limit(10)
        .returns<any[]>()

      setAds([...(vipAds ?? []), ...(normalAds ?? [])])
      setProducts([])
      setLoading(false)
      return
    }

    // باقي التابات — منتجات + إعلانات active
    let query = supabase
      .from('products')
      .select('*, profiles(store_name, store_image, verified)')
      .eq('status', 'active')

    switch (tab) {
      case 'forYou':
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
        break
      case 'new':
        query = query.order('created_at', { ascending: false })
        break
      case 'nearby':
        if (userCity) query = query.eq('city', userCity).order('created_at', { ascending: false })
        else query = query.order('created_at', { ascending: false })
        break
      case 'trending':
        query = query.order('views_count', { ascending: false })
        break
    }

    const [{ data: prods }, { data: activeAds }] = await Promise.all([
      query.limit(15).returns<any[]>(),
      supabase.from('ads').select('*').eq('status', 'active')
        .order('is_vip', { ascending: false })
        .limit(4).returns<any[]>(),
    ])

    setProducts(prods ?? [])
    setAds(activeAds ?? [])
    setLoading(false)
  }, [userCity])

  useEffect(() => {
    fetchData(active)
  }, [active, fetchData])

  // دمج المنتجات والإعلانات
  type FeedEntry =
    | { type: 'product'; data: any; key: string }
    | { type: 'ad'; data: any; key: string }

  const feed: FeedEntry[] = []

  if (active === 'vipAds') {
    ads.forEach(ad => feed.push({ type: 'ad', data: ad, key: ad.id }))
  } else {
    let adIdx = 0
    products.forEach((p, i) => {
      feed.push({ type: 'product', data: p, key: p.id })
      if ((i + 1) % 4 === 0 && adIdx < ads.length) {
        feed.push({ type: 'ad', data: ads[adIdx++], key: ads[adIdx - 1]?.id + '-ad' })
      }
    })
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActive(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap ${
              active === tab.key
                ? tab.key === 'vipAds'
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-neutral-100 dark:bg-neutral-800 rounded-3xl animate-pulse h-96" />
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="text-4xl mb-4">
            {active === 'nearby' ? '📍' : active === 'vipAds' ? '⭐' : '🛍️'}
          </div>
          <h2 className="font-semibold text-neutral-900 dark:text-white text-lg mb-2">
            {active === 'nearby' && !userCity ? 'سجل دخولك لرؤية القريب منك' :
             active === 'nearby' ? `لا يوجد في ${userCity}` :
             active === 'vipAds' ? 'لا توجد إعلانات مميزة حالياً' :
             'لا توجد منتجات بعد'}
          </h2>
          <p className="text-neutral-400 text-sm">تفقد لاحقاً!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-4 pb-4">
          {feed.map((entry, i) =>
            entry.type === 'product'
              ? <FeedItem key={entry.key} product={entry.data} index={i} />
              : <AdCard key={entry.key} ad={entry.data} index={i} />
          )}
        </div>
      )}
    </div>
  )
}