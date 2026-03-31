import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { FeedItem } from '@/components/feed/FeedItem'
import { AdCard } from '@/components/feed/AdCard'
import { FeedTabs } from '@/components/feed/FeedTabs'
import { FeedSkeleton } from '@/components/feed/FeedSkeleton'



async function FeedContent() {
  const supabase = await createClient()

  // جلب المنتجات
  const { data: products, error } = await supabase
  .from('products')
  .select(`*, profiles(store_name, store_image, verified)`)
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(10)
  .returns<any[]>()

console.log('products:', products?.length, 'error:', error)
  // جلب الإعلانات
  const { data: ads } = await supabase
    .from('ads')
    .select(`
      *,
      profiles(full_name, verified)
    `)
    .eq('status', 'active')
    .order('is_vip', { ascending: false })
    .limit(4)
    .returns<any[]>()

  // دمج المنتجات والإعلانات في feed واحد
  type FeedEntry =
    | { type: 'product'; data: NonNullable<typeof products>[number]; key: string }
    | { type: 'ad'; data: NonNullable<typeof ads>[number]; key: string }

  const feed: FeedEntry[] = []
  const productList = products ?? []
  const adList = ads ?? []
  let adIdx = 0

  productList.forEach((product, i) => {
    feed.push({ type: 'product', data: product, key: product.id })
    // إعلان كل 4 منتجات
    if ((i + 1) % 4 === 0 && adIdx < adList.length) {
      feed.push({ type: 'ad', data: adList[adIdx++], key: adList[adIdx - 1].id + '-ad' })
    }
  })

  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="text-4xl mb-4">🛍️</div>
        <h2 className="font-semibold text-neutral-900 text-lg mb-2">لا توجد منتجات بعد</h2>
        <p className="text-neutral-400 text-sm">كن أول من يضيف منتجاً!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 pb-4">
      {feed.map((entry, i) =>
        entry.type === 'product' ? (
          <FeedItem key={entry.key} product={entry.data as any} index={i} />
        ) : (
          <AdCard key={entry.key} ad={entry.data as any} index={i} />
        )
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />

      <main className="pt-2 pb-20">
        {/* Feed tabs */}
        <div className="pt-3">
          <FeedTabs />
        </div>

        {/* Feed */}
        <Suspense fallback={<FeedSkeleton />}>
          <FeedContent />
        </Suspense>
      </main>

      <BottomNav />
    </div>
  )
}