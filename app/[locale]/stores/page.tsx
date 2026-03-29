'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Store, BadgeCheck, Star, ArrowRight } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, store_name, full_name, store_image, store_desc, city, verified, is_premium, total_sales, store_category')
        .eq('role', 'seller')
        .order('is_premium', { ascending: false })
        .order('total_sales', { ascending: false })
        .limit(50)
      setStores(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = stores.filter(s =>
    (s.store_name || s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.city || '').includes(search)
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-4 px-4 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">المتاجر</h1>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن متجر..."
          className="input mb-4"
        />

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Store size={40} className="text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">لا توجد متاجر</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => (
              <div key={s.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-500 text-lg overflow-hidden shrink-0">
                  {s.store_image ? (
                    <img src={s.store_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (s.store_name || s.full_name || 'W').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                      {s.store_name || s.full_name || 'متجر'}
                    </span>
                    {s.verified && <BadgeCheck size={14} className="text-blue-500 shrink-0" />}
                    {s.is_premium && <Star size={14} className="text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  <div className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
                    {s.city && <span>📍 {s.city}</span>}
                    {s.store_category && <span>· {s.store_category}</span>}
                  </div>
                  {s.store_desc && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">{s.store_desc}</p>
                  )}
                </div>
                <ArrowRight size={16} className="text-neutral-300 dark:text-neutral-600 rotate-180 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}