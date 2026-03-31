'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { Star, Check, Clock, Shield, TrendingUp, Zap, BadgeCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PremiumPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pendingRequest, setPendingRequest] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const [{ data: p }, { data: req }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('premium_requests').select('id, status').eq('seller_id', user.id).eq('status', 'pending').single(),
      ])
      setProfile(p)
      setPendingRequest(!!req)
      setLoading(false)
    }
    load()
  }, [])

  async function requestPremium() {
    if (profile?.tier !== 'verified') { toast.error('يجب أن تكون موثقاً أولاً'); return }
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('premium_requests').insert({
      seller_id: user!.id, status: 'pending', amount: 100,
    })
    if (error) { toast.error('حدث خطأ'); setSubmitting(false); return }
    await supabase.from('notifications').insert({
      user_id: user!.id,
      title: 'تم إرسال طلب Premium ⭐',
      body: 'سيتواصل معك فريق Wibya لإتمام الدفع عبر CMI خلال 24 ساعة',
      type: 'product', is_read: false,
    })
    toast.success('تم إرسال الطلب! سنتواصل معك قريباً ✅')
    setPendingRequest(true)
    setSubmitting(false)
  }

  if (loading) return (
    <div className="p-8 pt-20 lg:pt-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  const isPremium = profile?.tier === 'premium'
  const isVerified = profile?.tier === 'verified'

  const features = [
    { icon: TrendingUp, label: 'عمولة 2% فقط', desc: 'بدل 4% للموثق و6% للعادي' },
    { icon: Star, label: 'شارة ذهبية ★', desc: 'تميز واضح في نتائج البحث' },
    { icon: Zap, label: 'أولوية قصوى في SEO', desc: 'منتجاتك تظهر أولاً دائماً' },
    { icon: BadgeCheck, label: 'نشر على صفحات Wibya', desc: 'Instagram, TikTok, Facebook' },
    { icon: Clock, label: 'صرف الأرباح 24 ساعة', desc: 'أسرع من Basic (48 ساعة)' },
    { icon: Shield, label: 'دعم أولوي', desc: 'خط دعم مباشر مع الفريق' },
  ]

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 max-w-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Star size={32} className="text-amber-500 fill-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Wibya Premium</h1>
        <p className="text-neutral-400 dark:text-neutral-500 text-sm">ارتقِ بمتجرك لمستوى أعلى</p>
      </div>

      {/* Price */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 text-center mb-6">
        <p className="text-4xl font-bold text-amber-700 dark:text-amber-300">100</p>
        <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">درهم مغربي / شهر</p>
        <p className="text-xs text-amber-500 dark:text-amber-500 mt-2">الدفع عبر CMI · يجدد شهرياً</p>
      </div>

      {/* Status */}
      {isPremium && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
          <Star size={20} className="text-amber-500 fill-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">أنت مشترك في Premium ⭐</p>
            {profile?.tier_expires_at && (
              <p className="text-xs text-amber-500 mt-0.5">
                ينتهي في {new Date(profile.tier_expires_at).toLocaleDateString('ar-MA')}
              </p>
            )}
          </div>
        </div>
      )}

      {pendingRequest && !isPremium && (
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
          <Clock size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">طلبك قيد المعالجة — سنتواصل معك قريباً</p>
        </div>
      )}

      {!isVerified && !isPremium && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
          <Shield size={20} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">يجب التوثيق أولاً</p>
            <button onClick={() => router.push('/seller/verification')} className="text-xs text-red-500 underline mt-0.5">
              اذهب لصفحة التوثيق
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">مميزات Premium</h2>
        </div>
        {features.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{label}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{desc}</p>
            </div>
            <Check size={14} className="text-green-500 shrink-0" />
          </div>
        ))}
      </div>

      {/* CTA */}
      {!isPremium && !pendingRequest && (
        <button onClick={requestPremium} disabled={!isVerified || submitting}
          className="w-full py-4 bg-amber-500 text-white font-bold rounded-2xl disabled:opacity-40 hover:bg-amber-600 transition-colors text-sm flex items-center justify-center gap-2">
          <Star size={18} className="fill-white" />
          {submitting ? 'جاري الإرسال...' : 'اشترك في Premium — 100 د.م/شهر'}
        </button>
      )}

      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-3">
        بعد الطلب سيتواصل معك فريق Wibya لإتمام الدفع عبر CMI
      </p>
    </div>
  )
}