'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
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

interface FeedEntry {
  type: 'product' | 'ad'
  data: any
  key: string
}

// ✅ Cache خارج الـ component — يبقى حتى بعد re-render
const feedCache = new Map<string, { feed: FeedEntry[]; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 دقائق

export function FeedTabs() {
  const [active, setActive] = useState<TabKey>('forYou')
  const [feeds, setFeeds] = useState<Record<string, FeedEntry[]>>({})
  const [loading, setLoading] = useState(true)
  const [userCity, setUserCity] = useState<string | null>(null)
  const [page, setPage] = useState<Record<string, number>>({})
  const [hasMore, setHasMore] = useState<Record<string, boolean>>({})
  const loadingMore = useRef(false)
  const PAGE_SIZE = 10

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('city').eq('id', user.id).single()
        .then(({ data }) => setUserCity(data?.city || null))
    })
  }, [])

  const buildFeed = (products: any[], ads: any[], isVip: boolean): FeedEntry[] => {
    const feed: FeedEntry[] = []
    if (isVip) {
      ads.forEach(ad => feed.push({ type: 'ad', data: ad, key: ad.id }))
      return feed
    }
    let adIdx = 0
    products.forEach((p, i) => {
      feed.push({ type: 'product', data: p, key: p.id })
      if ((i + 1) % 4 === 0 && adIdx < ads.length) {
        feed.push({ type: 'ad', data: ads[adIdx++], key: ads[adIdx - 1]?.id + '-ad' })
      }
    })
    return feed
  }

  const fetchData = useCallback(async (tab: TabKey, pageNum = 0, append = false) => {
    // تحقق من الـ cache
    const cacheKey = `${tab}-${pageNum}-${userCity || 'all'}`
    const cached = feedCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL && !append) {
      setFeeds(prev => ({ ...prev, [tab]: cached.feed }))
      setLoading(false)
      return
    }

    if (!append) setLoading(true)
    const supabase = createClient()
    const from = pageNum * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    if (tab === 'vipAds') {
      const { data: vipAds } = await supabase.from('ads').select('*')
        .eq('status', 'active').eq('is_vip', true)
        .order('created_at', { ascending: false })
        .range(from, to).returns<any[]>()
      const { data: normalAds } = await supabase.from('ads').select('*')
        .eq('status', 'active').eq('is_vip', false)
        .order('created_at', { ascending: false })
        .limit(5).returns<any[]>()
      const allAds = [...(vipAds ?? []), ...(normalAds ?? [])]
      const newFeed = buildFeed([], allAds, true)
      const finalFeed = append ? [...(feeds[tab] ?? []), ...newFeed] : newFeed
      feedCache.set(cacheKey, { feed: finalFeed, timestamp: Date.now() })
      setFeeds(prev => ({ ...prev, [tab]: finalFeed }))
      setHasMore(prev => ({ ...prev, [tab]: (vipAds?.length ?? 0) === PAGE_SIZE }))
      setLoading(false)
      return
    }

    let query = supabase.from('products')
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
      query.range(from, to).returns<any[]>(),
      pageNum === 0
        ? supabase.from('ads').select('*').eq('status', 'active')
            .order('is_vip', { ascending: false }).limit(4).returns<any[]>()
        : Promise.resolve({ data: [] as any[] }),
    ])

    const newFeed = buildFeed(prods ?? [], activeAds ?? [], false)
    const finalFeed = append ? [...(feeds[tab] ?? []), ...newFeed] : newFeed
    feedCache.set(cacheKey, { feed: finalFeed, timestamp: Date.now() })
    setFeeds(prev => ({ ...prev, [tab]: finalFeed }))
    setHasMore(prev => ({ ...prev, [tab]: (prods?.length ?? 0) === PAGE_SIZE }))
    setLoading(false)
  }, [userCity])

  useEffect(() => {
    if (!feeds[active]) fetchData(active, 0)
    else setLoading(false)
  }, [active, userCity])

  useEffect(() => {
    if (userCity) {
      feedCache.clear()
      setFeeds({})
      fetchData(active, 0)
    }
  }, [userCity])

  async function loadMore() {
    if (loadingMore.current || !hasMore[active]) return
    loadingMore.current = true
    const nextPage = (page[active] ?? 0) + 1
    setPage(prev => ({ ...prev, [active]: nextPage }))
    await fetchData(active, nextPage, true)
    loadingMore.current = false
  }

  const currentFeed = feeds[active] ?? []

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => { setActive(tab.key); if (!feeds[tab.key]) fetchData(tab.key, 0) }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap ${
              active === tab.key
                ? tab.key === 'vipAds'
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-neutral-100 dark:bg-neutral-800 rounded-3xl animate-pulse h-72" />
          ))}
        </div>
      ) : currentFeed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="text-4xl mb-4">
            {active === 'nearby' ? '📍' : active === 'vipAds' ? '⭐' : '🛍️'}
          </div>
          <h2 className="font-semibold text-neutral-900 dark:text-white text-lg mb-2">
            {active === 'nearby' && !userCity ? 'سجل دخولك لرؤية القريب منك' :
             active === 'nearby' ? `لا يوجد في ${userCity}` :
             active === 'vipAds' ? 'لا توجد إعلانات مميزة' :
             'لا توجد منتجات بعد'}
          </h2>
          <p className="text-neutral-400 text-sm">تفقد لاحقاً!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 px-4 pb-4">
            {currentFeed.map((entry, i) =>
              entry.type === 'product'
                ? <FeedItem key={entry.key} product={entry.data} index={i} />
                : <AdCard key={entry.key} ad={entry.data} index={i} />
            )}
          </div>
          {/* Pagination */}
          {hasMore[active] && (
            <div className="px-4 pb-6">
              <button onClick={loadMore}
                className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-2xl text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                تحميل المزيد
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}