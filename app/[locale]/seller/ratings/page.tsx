'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { Star } from 'lucide-react'

export default function RatingsPage() {
  const [ratings, setRatings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase
        .from('seller_ratings')
        .select('*, profiles(full_name, store_name)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
      setRatings(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const avg = ratings.length ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : '—'
  const dist = [5,4,3,2,1].map(n => ({ n, count: ratings.filter(r => r.rating === n).length }))

  if (loading) return <div className="p-8 pt-20 lg:pt-8 flex justify-center"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">التقييمات</h1>

      {/* Summary */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4 flex items-center gap-5">
        <div className="text-center shrink-0">
          <p className="text-5xl font-bold text-neutral-900 dark:text-white">{avg}</p>
          <div className="flex gap-0.5 justify-center mt-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={14} className={parseFloat(avg as string) >= s ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 dark:text-neutral-700'} />
            ))}
          </div>
          <p className="text-xs text-neutral-400 mt-1">{ratings.length} تقييم</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map(({ n, count }) => (
            <div key={n} className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 w-3">{n}</span>
              <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: ratings.length ? `${(count / ratings.length) * 100}%` : '0%' }} />
              </div>
              <span className="text-xs text-neutral-400 w-4">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
        {ratings.length === 0
          ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد تقييمات بعد</p>
          : ratings.map(r => (
            <div key={r.id} className="px-4 py-4 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {r.profiles?.store_name || r.profiles?.full_name || 'مستخدم'}
                </span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12} className={r.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 dark:text-neutral-700'} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-xs text-neutral-500 dark:text-neutral-400">{r.comment}</p>}
              <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-1">{new Date(r.created_at).toLocaleDateString('ar-MA')}</p>
            </div>
          ))
        }
      </div>
    </div>
  )
}