'use client'
import { useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { FeedItem } from '@/components/feed/FeedItem'
import { createClient } from '@/lib/supabase/client'

export default function SearchPage() {
  const locale = useLocale()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, profiles(store_name, store_image, verified)')
        .eq('status', 'active')
        .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,city.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(20)
      setResults(data ?? [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [])

  const POPULAR = ['تلفون', 'ملابس', 'سيارة', 'شقة', 'أثاث', 'إلكترونيات', 'لابتوب', 'أحذية']

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-20">
        {/* Search bar */}
        <div className="sticky top-14 z-30 bg-neutral-50/90 dark:bg-neutral-950/90 backdrop-blur-sm px-4 py-3">
          <div className="relative">
            <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={e => { setQuery(e.target.value); handleSearch(e.target.value) }}
              className="input ps-11 pe-10"
              placeholder={locale === 'ar' ? 'ابحث عن منتجات...' : 'Rechercher des produits...'}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]) }}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <X size={16} />
              </button>
            )}
          </div>
          {query && !loading && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5 px-1">
              {results.length > 0 ? `${results.length} نتيجة لـ "${query}"` : `لا نتائج لـ "${query}"`}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 gap-4 px-4 pt-2">
            {results.map((item, i) => (
              <FeedItem key={item.id} product={item} index={i} />
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="text-3xl mb-3">🔍</div>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-1">لا توجد نتائج لـ "{query}"</p>
            <p className="text-neutral-400 dark:text-neutral-500 text-xs">جرب كلمات مختلفة</p>
          </div>
        )}

        {/* Popular searches */}
        {!query && (
          <div className="px-4 pt-4">
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">عمليات بحث شائعة</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map(term => (
                <button key={term}
                  onClick={() => { setQuery(term); handleSearch(term) }}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 transition-colors">
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
