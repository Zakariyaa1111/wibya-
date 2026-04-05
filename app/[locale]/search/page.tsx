'use client'
import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ProductCard } from '@/components/product/ProductCard'
import { Search, SlidersHorizontal, X, Shield } from 'lucide-react'

const CATEGORIES = [
  { key: '', label: 'Ø§Ù„ÙƒÙ„' },
  { key: 'template', label: 'ðŸ›ï¸ Ù‚ÙˆØ§Ù„Ø¨' },
  { key: 'tool', label: 'ðŸ”§ Ø£Ø¯ÙˆØ§Øª' },
  { key: 'course', label: 'ðŸŽ“ Ø¯ÙˆØ±Ø§Øª' },
  { key: 'ui_kit', label: 'ðŸŽ¨ UI Kit' },
  { key: 'saas', label: 'âš¡ SaaS' },
  { key: 'other', label: 'ðŸ“¦ Ø£Ø®Ø±Ù‰' },
]

const SORT_OPTIONS = [
  { key: 'newest', label: 'Ø§Ù„Ø£Ø­Ø¯Ø«' },
  { key: 'top_selling', label: 'Ø§Ù„Ø£ÙƒØ«Ø± Ù…Ø¨ÙŠØ¹Ø§Ù‹' },
  { key: 'top_rated', label: 'Ø§Ù„Ø£Ø¹Ù„Ù‰ ØªÙ‚ÙŠÙŠÙ…Ø§Ù‹' },
  { key: 'price_asc', label: 'Ø§Ù„Ø³Ø¹Ø±: Ø§Ù„Ø£Ù‚Ù„' },
  { key: 'price_desc', label: 'Ø§Ù„Ø³Ø¹Ø±: Ø§Ù„Ø£Ø¹Ù„Ù‰' },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''

  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [qualityOnly, setQualityOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 12

  const search = useCallback(async (reset = true) => {
    setLoading(true)
    const currentPage = reset ? 0 : page
    if (reset) setPage(0)

    const supabase = createClient()
    let q = supabase
      .from('digital_products')
      .select('id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles!developer_id(full_name, store_name, is_verified)', { count: 'exact' })
      .eq('status', 'active')

    if (query.trim()) q = q.ilike('title', `%${query.trim()}%`)
    if (category) q = q.eq('category', category)
    if (minPrice) q = q.gte('price', parseFloat(minPrice))
    if (maxPrice) q = q.lte('price', parseFloat(maxPrice))
    if (qualityOnly) q = q.eq('quality_badge', true)

    switch (sort) {
      case 'newest': q = q.order('created_at', { ascending: false }); break
      case 'top_selling': q = q.order('sales_count', { ascending: false }); break
      case 'top_rated': q = q.order('average_rating', { ascending: false }); break
      case 'price_asc': q = q.order('price', { ascending: true }); break
      case 'price_desc': q = q.order('price', { ascending: false }); break
    }

    const { data, count } = await q.range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

    if (reset) setResults(data ?? [])
    else setResults(prev => [...prev, ...(data ?? [])])
    setTotal(count ?? 0)
    setLoading(false)
  }, [query, category, sort, minPrice, maxPrice, qualityOnly, page])

  useEffect(() => {
    search(true)
  }, [category, sort, qualityOnly])

  useEffect(() => {
    if (initialQuery) search(true)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    search(true)
  }

  function clearFilters() {
    setCategory('')
    setSort('newest')
    setMinPrice('')
    setMaxPrice('')
    setQualityOnly(false)
  }

  const hasFilters = category || minPrice || maxPrice || qualityOnly || sort !== 'newest'

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />

      {/* Search Bar */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 px-4 py-3">
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ù†ØªØ¬..."
              autoFocus
              className="w-full ps-9 pe-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none border border-transparent focus:border-neutral-300 dark:focus:border-neutral-600 transition-colors"
              aria-label="Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ù…Ù†ØªØ¬"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); search(true) }}
                className="absolute end-3 top-1/2 -translate-y-1/2"
                aria-label="Ù…Ø³Ø­ Ø§Ù„Ø¨Ø­Ø«"
              >
                <X size={14} className="text-neutral-400" aria-hidden="true" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-2xl border transition-colors relative ${
              showFilters || hasFilters
                ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 border-transparent text-neutral-500'
            }`}
            aria-label="Ø§Ù„ÙÙ„Ø§ØªØ±"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            {hasFilters && <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-red-500 rounded-full" aria-hidden="true" />}
          </button>
        </form>

        {/* Categories */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide" role="list" aria-label="Ø§Ù„ÙØ¦Ø§Øª">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              role="listitem"
              aria-pressed={category === cat.key}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                category === cat.key
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-3 space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            {/* Sort */}
            <div>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Ø§Ù„ØªØ±ØªÙŠØ¨</p>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSort(opt.key)}
                    aria-pressed={sort === opt.key}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors ${
                      sort === opt.key
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Ù†Ø·Ø§Ù‚ Ø§Ù„Ø³Ø¹Ø± (USD)</p>
              <div className="flex gap-2">
                <input
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  type="number"
                  placeholder="Ù…Ù†"
                  className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white outline-none"
                  dir="ltr"
                  aria-label="Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ù„Ù„Ø³Ø¹Ø±"
                />
                <input
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  type="number"
                  placeholder="Ø¥Ù„Ù‰"
                  className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white outline-none"
                  dir="ltr"
                  aria-label="Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ Ù„Ù„Ø³Ø¹Ø±"
                />
              </div>
            </div>

            {/* Quality Badge Filter */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setQualityOnly(!qualityOnly)}
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  qualityOnly
                    ? 'bg-green-500 border-green-500'
                    : 'border-neutral-300 dark:border-neutral-600'
                }`}
                role="checkbox"
                aria-checked={qualityOnly}
                tabIndex={0}
              >
                {qualityOnly && <Shield size={12} className="text-white" aria-hidden="true" />}
              </div>
              <span className="text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Shield size={13} className="text-green-500" aria-hidden="true" />
                Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ù…ÙØ­ÙˆØµØ© ÙÙ‚Ø·
              </span>
            </label>

            {/* Apply / Clear */}
            <div className="flex gap-2">
              <button
                onClick={() => { search(true); setShowFilters(false) }}
                className="flex-1 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-semibold"
              >
                ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„ÙÙ„Ø§ØªØ±
              </button>
              {hasFilters && (
                <button
                  onClick={() => { clearFilters(); search(true) }}
                  className="px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs"
                >
                  Ù…Ø³Ø­
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <main className="pb-24 px-4 pt-4">
        {/* Count */}
        {(query || hasFilters) && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-3">
            {total.toLocaleString()} Ù†ØªÙŠØ¬Ø©
            {query && ` Ù„Ù€ "${query}"`}
          </p>
        )}

        {loading && results.length === 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={40} className="text-neutral-300 dark:text-neutral-700 mb-3" aria-hidden="true" />
            <p className="font-semibold text-neutral-900 dark:text-white mb-1">
              {query || hasFilters ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬' : 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø£ÙŠ Ù…Ù†ØªØ¬'}
            </p>
            <p className="text-neutral-400 text-sm">
              {query || hasFilters ? 'Ø¬Ø±Ø¨ ÙƒÙ„Ù…Ø§Øª Ù…Ø®ØªÙ„ÙØ© Ø£Ùˆ ØºÙŠØ± Ø§Ù„ÙÙ„Ø§ØªØ±' : 'Ù‚ÙˆØ§Ù„Ø¨ØŒ Ø£Ø¯ÙˆØ§ØªØŒ Ø¯ÙˆØ±Ø§Øª...'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {results.map(product => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>

            {results.length < total && (
              <button
                onClick={() => { setPage(p => p + 1); search(false) }}
                disabled={loading}
                className="w-full mt-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-2xl text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„...' : `ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ø²ÙŠØ¯ (${total - results.length} Ù…ØªØ¨Ù‚ÙŠ)`}
              </button>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}