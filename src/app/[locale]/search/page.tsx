'use client'
import { useState, useTransition } from 'react'
import { Search, X, Sparkles } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { FeedItem } from '@/components/feed/FeedItem'
import { AdCard } from '@/components/feed/AdCard'

export default function SearchPage() {
  const t = useTranslations('nav')
  const locale = useLocale() as 'ar' | 'fr'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(q: string) {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/ai/search?q=${encodeURIComponent(q)}&locale=${locale}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />
      <main className="pb-20">
        {/* Search bar */}
        <div className="sticky top-14 z-30 bg-neutral-50/90 backdrop-blur-sm px-4 py-3">
          <div className="relative">
            <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={e => { setQuery(e.target.value); handleSearch(e.target.value) }}
              className="input ps-11 pe-10"
              placeholder={locale === 'ar' ? 'ابحث عن منتجات، إعلانات...' : 'Rechercher des produits...'}
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setResults([]) }}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-neutral-400"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {query && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-400">
              <Sparkles size={12} className="text-brand-500" />
              <span>بحث ذكي مدعوم بالذكاء الاصطناعي</span>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 px-4 pt-2">
            {results.map((item, i) =>
              item.type === 'ad'
                ? <AdCard key={item.id} ad={item} index={i} />
                : <FeedItem key={item.id} product={item} index={i} />
            )}
          </div>
        ) : query ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="text-3xl mb-3">🔍</div>
            <p className="text-neutral-500 text-sm">لا توجد نتائج لـ "{query}"</p>
          </div>
        ) : (
          <div className="px-4 pt-4">
            <p className="text-sm font-medium text-neutral-500 mb-3">عمليات بحث شائعة</p>
            <div className="flex flex-wrap gap-2">
              {['تلفون', 'ملابس', 'سيارة', 'شقة', 'أثاث', 'إلكترونيات'].map(term => (
                <button key={term} onClick={() => { setQuery(term); handleSearch(term) }}
                  className="px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-sm text-neutral-600 hover:border-neutral-400 transition-colors">
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
