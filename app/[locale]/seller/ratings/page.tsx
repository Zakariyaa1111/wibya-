'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { Star, MessageSquare } from 'lucide-react'

export default function SellerRatingsPage() {
  const [ratings, setRatings] = useState<any[]>([])
  const [stats, setStats] = useState({ avg: 0, total: 0, dist: [0,0,0,0,0] })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('seller_ratings')
        .select('*, profiles!buyer_id(full_name, store_name)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      const list = data ?? []
      setRatings(list)

      if (list.length > 0) {
        const avg = list.reduce((s: number, r: any) => s + r.rating, 0) / list.length
        const dist = [0,0,0,0,0]
        list.forEach((r: any) => { dist[r.rating - 1]++ })
        setStats({ avg: Math.round(avg * 10) / 10, total: list.length, dist })
      }
      setLoading(false)
    }
    load()
  }, [])

  const Stars = ({ value, size = 16 }: { value: number; size?: number }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          className={i <= value ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 dark:text-neutral-700'} />
      ))}
    </div>
  )

  if (loading) return (
    <div className="p-8 pt-20 lg:pt-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 max-w-lg">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">تقييمات متجري</h1>

      {/* Stats */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-neutral-900 dark:text-white">{stats.avg || '—'}</p>
            <Stars value={Math.round(stats.avg)} size={18} />
            <p className="text-xs text-neutral-400 mt-1">{stats.total} تقييم</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5,4,3,2,1].map(star => {
              const count = stats.dist[star - 1]
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 w-3">{star}</span>
                  <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-neutral-400 w-4">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Ratings list */}
      {ratings.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-8 text-center">
          <Star size={36} className="text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">لا توجد تقييمات بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map((r: any) => (
            <div key={r.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm text-neutral-900 dark:text-white">
                    {r.profiles?.store_name || r.profiles?.full_name || 'مستخدم'}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {new Date(r.created_at).toLocaleDateString('ar-MA')}
                  </p>
                </div>
                <Stars value={r.rating} />
              </div>
              {r.comment && (
                <div className="flex items-start gap-2 mt-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                  <MessageSquare size={13} className="text-neutral-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{r.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}