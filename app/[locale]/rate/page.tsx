'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Star } from 'lucide-react'
import { useRouter } from '@/lib/i18n/navigation'
import toast from 'react-hot-toast'

export default function RatePage() {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { toast.error('اختر تقييماً'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('يجب تسجيل الدخول أولاً'); setLoading(false); router.push('/auth/login'); return }

    await supabase.from('site_ratings').insert({
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
    })

    setDone(true)
    setLoading(false)
  }

  const labels = ['', 'سيء', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز']

  if (done) return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      <TopBar />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">شكراً على تقييمك!</h2>
        <p className="text-neutral-400 text-sm mb-6">رأيك يساعدنا على التحسين</p>
        <button onClick={() => router.push('/')} className="btn-primary px-8">العودة للرئيسية</button>
      </div>
      <BottomNav />
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-8 px-6 max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⭐</div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">قيّم تجربتك مع Wibya</h1>
          <p className="text-neutral-400 text-sm">رأيك يهمنا ويساعدنا على تطوير المنصة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stars */}
          <div className="flex justify-center gap-3">
            {[1,2,3,4,5].map(star => (
              <button key={star} type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110 active:scale-95">
                <Star
                  size={44}
                  className={`transition-colors ${
                    star <= (hover || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-neutral-200 dark:text-neutral-700'
                  }`}
                />
              </button>
            ))}
          </div>

          {(hover || rating) > 0 && (
            <p className="text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {labels[hover || rating]}
            </p>
          )}

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              تعليقك (اختياري)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="input resize-none"
              rows={4}
              placeholder="شاركنا تجربتك مع المنصة..."
            />
          </div>

          <button type="submit" disabled={loading || rating === 0} className="btn-primary w-full py-3.5">
            {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
          </button>
        </form>
      </main>
      <BottomNav />
    </div>
  )
}