'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { Shield, Upload, CheckCircle, Clock, X, Star, Phone, Chrome, CreditCard, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function VerificationPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [idCardUrl, setIdCardUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setIdCardUrl(data?.id_card_url || null)
      setLoading(false)
    }
    load()
  }, [])

  async function uploadIdCard(file: File) {
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const ext = file.name.split('.').pop()
    const path = `id-cards/${user!.id}/national-id.${ext}`
    const { error } = await supabase.storage.from('wibya-media').upload(path, file, { upsert: true })
    if (error) { toast.error('خطأ في الرفع'); setUploading(false); return }
    const { data } = supabase.storage.from('wibya-media').getPublicUrl(path)
    setIdCardUrl(data.publicUrl)
    await supabase.from('profiles').update({ id_card_url: data.publicUrl }).eq('id', user!.id)
    toast.success('تم رفع البطاقة ✅')
    setUploading(false)
  }

  async function requestVerification() {
    if (!idCardUrl) { toast.error('يجب رفع البطاقة الوطنية أولاً'); return }
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({
      verification_status: 'pending',
      verification_requested_at: new Date().toISOString(),
    }).eq('id', user!.id)
    await supabase.from('notifications').insert({
      user_id: user!.id,
      title: 'تم إرسال طلب التوثيق 🔍',
      body: 'طلب التوثيق قيد المراجعة من فريق Wibya وسيتم الرد خلال 48 ساعة',
      type: 'product', is_read: false,
    })
    toast.success('تم إرسال طلب التوثيق ✅')
    setProfile((prev: any) => ({ ...prev, verification_status: 'pending' }))
    setSubmitting(false)
  }

  if (loading) return (
    <div className="p-8 pt-20 lg:pt-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  const salesCount = profile?.successful_sales ?? 0
  const canRequestVerification = salesCount >= 5
  const verificationStatus = profile?.verification_status ?? 'none'
  const tier = profile?.tier ?? 'basic'

  const steps = [
    {
      icon: Chrome,
      label: 'حساب Google',
      done: profile?.google_verified,
      desc: 'ربط حسابك بـ Google',
    },
    {
      icon: Phone,
      label: 'رقم الهاتف',
      done: profile?.phone_verified,
      desc: 'تحقق برمز OTP',
    },
    {
      icon: Star,
      label: '5 مبيعات ناجحة',
      done: salesCount >= 5,
      desc: `${salesCount}/5 مبيعات`,
    },
    {
      icon: CreditCard,
      label: 'البطاقة الوطنية',
      done: !!idCardUrl,
      desc: 'رفع صورة واضحة',
    },
  ]

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 max-w-lg">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">التحقق من الهوية</h1>
      <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-6">احصل على شارة التوثيق وخفض العمولة إلى 4%</p>

      {/* Current tier */}
      <div className={`rounded-2xl p-4 mb-6 border ${
        tier === 'premium' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
        tier === 'verified' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
        'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            tier === 'premium' ? 'bg-amber-100 dark:bg-amber-900/30' :
            tier === 'verified' ? 'bg-blue-100 dark:bg-blue-900/30' :
            'bg-neutral-100 dark:bg-neutral-700'
          }`}>
            {tier === 'premium' ? <Star size={20} className="text-amber-600 dark:text-amber-400 fill-amber-500" /> :
             tier === 'verified' ? <Shield size={20} className="text-blue-600 dark:text-blue-400" /> :
             <Shield size={20} className="text-neutral-500" />}
          </div>
          <div>
            <p className="font-semibold text-sm text-neutral-900 dark:text-white">
              {tier === 'premium' ? 'بائع مميز ★' : tier === 'verified' ? 'بائع موثق ✓' : 'بائع عادي'}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {tier === 'premium' ? 'عمولة 2% · أولوية قصوى' :
               tier === 'verified' ? 'عمولة 4% · علامة زرقاء' :
               'عمولة 6%'}
            </p>
          </div>
        </div>
      </div>

      {/* Verification status */}
      {verificationStatus === 'approved' && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-6">
          <CheckCircle size={20} className="text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm font-medium text-green-700 dark:text-green-300">تم توثيق حسابك ✅</p>
        </div>
      )}
      {verificationStatus === 'pending' && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
          <Clock size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">طلبك قيد المراجعة — سيتم الرد خلال 48 ساعة</p>
        </div>
      )}
      {verificationStatus === 'rejected' && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
          <X size={20} className="text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">تم رفض طلبك — تواصل مع الدعم</p>
        </div>
      )}

      {/* Steps */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">خطوات التوثيق</h2>
        </div>
        {steps.map(({ icon: Icon, label, done, desc }, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${done ? 'bg-green-50 dark:bg-green-900/20' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
              <Icon size={16} className={done ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${done ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>{label}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{desc}</p>
            </div>
            {done && <CheckCircle size={16} className="text-green-500 shrink-0" />}
          </div>
        ))}
      </div>

      {/* Upload ID card */}
      {verificationStatus !== 'approved' && verificationStatus !== 'pending' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 mb-4">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white mb-3">رفع البطاقة الوطنية</h2>
          {idCardUrl ? (
            <div className="relative rounded-xl overflow-hidden mb-3">
              <img src={idCardUrl} alt="البطاقة الوطنية" className="w-full h-32 object-cover" />
              <button onClick={() => setIdCardUrl(null)} className="absolute top-2 end-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                <X size={12} className="text-white" />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-neutral-400 transition-colors mb-3">
              {uploading
                ? <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                : <>
                    <Upload size={24} />
                    <span className="text-xs">انقر لرفع صورة البطاقة الوطنية</span>
                  </>
              }
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadIdCard(e.target.files[0])} />
          <p className="text-xs text-neutral-400 dark:text-neutral-500">يجب أن تكون الصورة واضحة وتظهر اسمك ورقم البطاقة</p>
        </div>
      )}

      {/* Submit button */}
      {verificationStatus !== 'approved' && verificationStatus !== 'pending' && (
        <button
          onClick={requestVerification}
          disabled={!canRequestVerification || !idCardUrl || submitting}
          className="w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-2xl disabled:opacity-40 transition-opacity text-sm flex items-center justify-center gap-2"
        >
          {submitting ? 'جاري الإرسال...' : (
            !canRequestVerification ? `أكمل ${5 - salesCount} مبيعات إضافية للتفعيل` :
            !idCardUrl ? 'ارفع البطاقة الوطنية أولاً' :
            'إرسال طلب التوثيق'
          )}
        </button>
      )}
    </div>
  )
}