'use client'
import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter as useNextRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Search, X, SlidersHorizontal, MapPin, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const CATEGORIES = ['الكل','إلكترونيات','سيارات','عقارات','ملابس','أثاث','رياضة','وظائف','خدمات','أخرى']
const CITIES = ['الكل','الدار البيضاء','الرباط','فاس','مراكش','أكادير','طنجة','مكناس','وجدة','تطوان','سلا']
const SORT_OPTIONS = [
  { key: 'newest', label: 'الأحدث' },
  { key: 'price_asc', label: 'السعر: الأقل' },
  { key: 'price_desc', label: 'السعر: الأعلى' },
  { key: 'popular', label: 'الأكثر مشاهدة' },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [category, setCategory] = useState('الكل')
  const [city, setCity] = useState('الكل')
  const [sort, setSort] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 12

  const search = useCallback(async (q: string, reset = true) => {
    if (!q.trim() && category === 'الكل' && city === 'الكل') {
      setResults([]); setTotal(0); return
    }
    setLoading(true)
    const currentPage = reset ? 0 : page
    if (reset) setPage(0)

    const supabase = createClient()
    let query_builder = supabase
      .from('products')
      .select('id, name, price, images, city, condition, views_count, profiles(store_name, verified)', { count: 'exact' })
      .eq('status', 'active')

    if (q.trim()) query_builder = query_builder.ilike('name', `%${q.trim()}%`)
    if (category !== 'الكل') query_builder = query_builder.eq('category', category)
    if (city !== 'الكل') query_builder = query_builder.eq('city', city)
    if (minPrice) query_builder = query_builder.gte('price', parseFloat(minPrice))
    if (maxPrice) query_builder = query_builder.lte('price', parseFloat(maxPrice))

    switch (sort) {
      case 'newest': query_builder = query_builder.order('created_at', { ascending: false }); break
      case 'price_asc': query_builder = query_builder.order('price', { ascending: true }); break
      case 'price_desc': query_builder = query_builder.order('price', { ascending: false }); break
      case 'popular': query_builder = query_builder.order('views_count', { ascending: false }); break
    }

    const { data, count } = await query_builder
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)
      .returns<any[]>()

    if (reset) setResults(data ?? [])
    else setResults(prev => [...prev, ...(data ?? [])])
    setTotal(count ?? 0)
    setLoading(false)
  }, [category, city, sort, minPrice, maxPrice, page])

  useEffect(() => {
    if (initialQuery) search(initialQuery)
  }, [])

  useEffect(() => {
    if (query) search(query)
    else if (category !== 'الكل' || city !== 'الكل') search('')
  }, [category, city, sort])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    search(query)
  }

  function clearFilters() {
    setCategory('الكل'); setCity('الكل'); setSort('newest')
    setMinPrice(''); setMaxPrice('')
    search(query)
  }

  const hasFilters = category !== 'الكل' || city !== 'الكل' || minPrice || maxPrice

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 px-4 py-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              autoFocus
              className="w-full ps-9 pe-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none border border-transparent focus:border-neutral-300 dark:focus:border-neutral-600 transition-colors"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setResults([]); setTotal(0) }}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-2xl border transition-colors relative ${showFilters || hasFilters ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 border-transparent text-neutral-500'}`}>
            <SlidersHorizontal size={16} />
            {hasFilters && <span className="absolute -top-1 -end-1 w-3 h-3 bg-red-500 rounded-full" />}
          </button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-3">
            {/* Categories */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === c ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'}`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Cities */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {CITIES.map(c => (
                <button key={c} onClick={() => setCity(c)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${city === c ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'}`}>
                  {c !== 'الكل' && <MapPin size={10} />}{c}
                </button>
              ))}
            </div>

            {/* Price + Sort */}
            <div className="flex gap-2">
              <input value={minPrice} onChange={e => setMinPrice(e.target.value)}
                className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white outline-none"
                placeholder="سعر من" type="number" dir="ltr" />
              <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white outline-none"
                placeholder="سعر إلى" type="number" dir="ltr" />
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white outline-none">
                {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={() => search(query)} className="flex-1 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-semibold">
                تطبيق
              </button>
              {hasFilters && (
                <button onClick={clearFilters} className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs">
                  مسح
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <main className="pb-24 px-4 pt-4">
        {/* Results count */}
        {total > 0 && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-3">
            {total.toLocaleString()} نتيجة {query && `لـ "${query}"`}
          </p>
        )}

        {loading && results.length === 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse h-52" />
            ))}
          </div>
        ) : results.length === 0 && (query || hasFilters) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={40} className="text-neutral-300 dark:text-neutral-700 mb-3" />
            <p className="font-semibold text-neutral-900 dark:text-white mb-1">لا توجد نتائج</p>
            <p className="text-neutral-400 text-sm">جرب كلمات مختلفة أو غير الفلاتر</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={40} className="text-neutral-300 dark:text-neutral-700 mb-3" />
            <p className="font-semibold text-neutral-900 dark:text-white mb-1">ابحث عن أي شيء</p>
            <p className="text-neutral-400 text-sm">منتجات، فئات، مدن...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {results.map(p => (
                <Link key={p.id} href={`/product/${p.id}`}>
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
                    <div className="aspect-square relative bg-neutral-100 dark:bg-neutral-800">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <Tag size={24} />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 line-clamp-2 mb-1">{p.name}</p>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">{p.price?.toLocaleString()} د.م.</p>
                      {p.city && (
                        <p className="text-[10px] text-neutral-400 flex items-center gap-0.5 mt-1">
                          <MapPin size={9} />{p.city}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {results.length < total && (
              <button onClick={() => { setPage(p => p + 1); search(query, false) }}
                disabled={loading}
                className="w-full mt-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-2xl text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50">
                {loading ? 'جاري التحميل...' : `تحميل المزيد (${total - results.length} متبقي)`}
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  )
}