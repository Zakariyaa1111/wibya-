'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { Shield, Upload, CheckCircle, Clock, X, Star, Phone, CreditCard, Eye, EyeOff, Lock } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { encryptStrong, validateIdNumber, validateExpiryDate } from '@/lib/crypto/encrypt'

export default function VerificationPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [idCardUrl, setIdCardUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showIdNumber, setShowIdNumber] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // بيانات البطاقة
  const [idNumber, setIdNumber] = useState('')
  const [fullNameAr, setFullNameAr] = useState('')
  const [fullNameFr, setFullNameFr] = useState('')
  const [expiryDate, setExpiryDate] = useState('')

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
    toast.success('تم رفع الصورة ✅')
    setUploading(false)
  }

  async function requestVerification() {
    // التحقق من المدخلات
    if (!idCardUrl) { toast.error('يجب رفع صورة البطاقة الوطنية'); return }
    if (!idNumber.trim()) { toast.error('يجب إدخال رقم البطاقة الوطنية'); return }
    if (!validateIdNumber(idNumber)) { toast.error('رقم البطاقة غير صحيح (مثال: AB123456)'); return }
    if (!fullNameAr.trim()) { toast.error('يجب إدخال الاسم الكامل بالعربية'); return }
    if (!fullNameFr.trim()) { toast.error('يجب إدخال الاسم الكامل بالفرنسية'); return }
    if (!expiryDate) { toast.error('يجب إدخال تاريخ انتهاء الصلاحية'); return }
    if (!validateExpiryDate(expiryDate)) { toast.error('البطاقة منتهية الصلاحية'); return }
    if ((profile?.successful_sales ?? 0) < 5) { toast.error('يجب إتمام 5 مبيعات ناجحة أولاً'); return }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // تشفير البيانات
      const [
        encryptedIdNumber,
        encryptedNameAr,
        encryptedNameFr,
        encryptedExpiry,
      ] = await Promise.all([
        encryptStrong(idNumber.toUpperCase().trim()),
        encryptStrong(fullNameAr.trim()),
        encryptStrong(fullNameFr.trim()),
        encryptStrong(expiryDate),
      ])

      // حفظ البيانات المشفرة
      const { error: cardError } = await supabase.from('seller_id_cards').upsert({
        seller_id: user!.id,
        id_number_encrypted: encryptedIdNumber,
        full_name_ar_encrypted: encryptedNameAr,
        full_name_fr_encrypted: encryptedNameFr,
        expiry_date_encrypted: encryptedExpiry,
        updated_at: new Date().toISOString(),
      })

      if (cardError) { toast.error('خطأ في حفظ البيانات'); setSubmitting(false); return }

      // تحديث حالة التحقق
      await supabase.from('profiles').update({
        verification_status: 'pending',
        verification_requested_at: new Date().toISOString(),
      }).eq('id', user!.id)

      // إشعار
      await supabase.from('notifications').insert({
        user_id: user!.id,
        title: 'تم إرسال طلب التوثيق 🔍',
        body: 'طلب التوثيق قيد المراجعة من فريق Wibya خلال 48 ساعة',
        type: 'product', is_read: false,
      })

      toast.success('تم إرسال طلب التوثيق ✅ بياناتك محفوظة بشكل آمن')
      setProfile((prev: any) => ({ ...prev, verification_status: 'pending' }))

      // مسح البيانات من الذاكرة
      setIdNumber('')
      setFullNameAr('')
      setFullNameFr('')
      setExpiryDate('')

    } catch (err) {
      toast.error('حدث خطأ غير متوقع')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="p-8 pt-20 lg:pt-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  const salesCount = profile?.successful_sales ?? 0
  const verificationStatus = profile?.verification_status ?? 'none'
  const tier = profile?.tier ?? 'basic'
  const alreadySubmitted = verificationStatus === 'pending' || verificationStatus === 'approved'

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 max-w-lg">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">التحقق من الهوية</h1>
      <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-6">احصل على شارة التوثيق وخفض العمولة إلى 4%</p>

      {/* Status */}
      {verificationStatus === 'approved' && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-6">
          <CheckCircle size={20} className="text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-700 dark:text-green-300">تم توثيق حسابك ✅</p>
        </div>
      )}
      {verificationStatus === 'pending' && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
          <Clock size={20} className="text-amber-600 shrink-0" />
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">طلبك قيد المراجعة — سيتم الرد خلال 48 ساعة</p>
        </div>
      )}
      {verificationStatus === 'rejected' && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
          <X size={20} className="text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">تم رفض طلبك — تواصل مع الدعم</p>
        </div>
      )}

      {/* Progress */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">شروط التوثيق</h2>
        </div>
        {[
          { icon: Phone, label: 'رقم الهاتف محقق', done: profile?.phone_verified, desc: 'OTP عبر الهاتف' },
          { icon: Star, label: '5 مبيعات ناجحة', done: salesCount >= 5, desc: `${salesCount}/5 مبيعات` },
          { icon: CreditCard, label: 'البطاقة الوطنية', done: !!idCardUrl, desc: 'صورة + بيانات مشفرة' },
        ].map(({ icon: Icon, label, done, desc }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
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

      {/* Form */}
      {!alreadySubmitted && (
        <>
          {/* رفع الصورة */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 mb-4">
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-white mb-3">صورة البطاقة الوطنية</h2>
            {idCardUrl ? (
              <div className="relative rounded-xl overflow-hidden mb-2">
                <img src={idCardUrl} alt="البطاقة الوطنية" className="w-full h-36 object-cover" />
                <button onClick={() => setIdCardUrl(null)} className="absolute top-2 end-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                  <X size={12} className="text-white" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-neutral-400 transition-colors mb-2">
                {uploading
                  ? <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                  : <><Upload size={22} /><span className="text-xs">رفع صورة البطاقة الوطنية</span></>
                }
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && uploadIdCard(e.target.files[0])} />
            <p className="text-xs text-neutral-400 dark:text-neutral-500">الصورة للتحقق فقط · لن تُحفظ بعد المراجعة</p>
          </div>

          {/* بيانات البطاقة المشفرة */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock size={14} className="text-neutral-500" />
              <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">بيانات البطاقة (مشفرة)</h2>
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
              🔒 هذه البيانات مشفرة بالكامل ولا يمكن الاطلاع عليها إلا من قبل الإدارة عند الحاجة للتحقق
            </p>

            <div className="space-y-3">
              {/* رقم البطاقة */}
              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">رقم البطاقة الوطنية *</label>
                <div className="relative">
                  <input
                    type={showIdNumber ? 'text' : 'password'}
                    value={idNumber}
                    onChange={e => setIdNumber(e.target.value.toUpperCase())}
                    className="input pe-10"
                    placeholder="AB123456"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowIdNumber(!showIdNumber)}
                    className="absolute inset-y-0 end-3 flex items-center text-neutral-400">
                    {showIdNumber ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">حرف أو حرفان + أرقام (مثال: AB123456)</p>
              </div>

              {/* الاسم بالعربية */}
              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">الاسم الكامل بالعربية (كما في البطاقة) *</label>
                <input
                  type="text"
                  value={fullNameAr}
                  onChange={e => setFullNameAr(e.target.value)}
                  className="input"
                  placeholder="محمد أمين الزكاري"
                  dir="rtl"
                />
              </div>

              {/* الاسم بالفرنسية */}
              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">Nom complet en français (tel qu'il figure sur la carte) *</label>
                <input
                  type="text"
                  value={fullNameFr}
                  onChange={e => setFullNameFr(e.target.value)}
                  className="input"
                  placeholder="Mohammed Amine ZAKARI"
                  dir="ltr"
                />
              </div>

              {/* تاريخ الانتهاء */}
              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">تاريخ انتهاء الصلاحية *</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="input"
                  dir="ltr"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={requestVerification}
            disabled={!idCardUrl || !idNumber || !fullNameAr || !fullNameFr || !expiryDate || submitting || salesCount < 5}
            className="w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-2xl disabled:opacity-40 text-sm flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            {submitting ? 'جاري التشفير والإرسال...' :
             salesCount < 5 ? `أكمل ${5 - salesCount} مبيعات إضافية` :
             'إرسال طلب التوثيق بشكل آمن'}
          </button>

          <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-3">
            🔒 بياناتك مشفرة بـ AES-256 ولا تُشارك مع أي طرف ثالث
          </p>
        </>
      )}
    </div>
  )
}