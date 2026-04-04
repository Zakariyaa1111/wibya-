'use client'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Flag, Upload, X, ArrowRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

const REASONS = [
  'المنتج لا يعمل كما هو موصوف',
  'الملف تالف أو غير مكتمل',
  'الوصف مضلل أو غير دقيق',
  'مشكلة في التثبيت لم يتم حلها',
  'المنتج لا يتوافق مع المتطلبات المذكورة',
  'سبب آخر',
]

function DisputeForm() {
  const searchParams = useSearchParams()
  const purchaseId = searchParams.get('purchase')
  const router = useRouter()

  const [purchase, setPurchase] = useState<any>(null)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    if (!purchaseId) { router.push('/purchases'); return }
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('purchases')
        .select('*, digital_products(title, preview_images), profiles!developer_id(store_name, full_name)')
        .eq('id', purchaseId)
        .eq('buyer_id', user.id)
        .single()

      if (!data) { toast.error('الطلب غير موجود'); router.push('/purchases'); return }

      // هل فيه نزاع مسبق؟
      const { data: existing } = await supabase
        .from('disputes')
        .select('id')
        .eq('purchase_id', purchaseId)
        .single()

      if (existing) {
        toast('يوجد نزاع مفتوح بالفعل لهذا الطلب', { icon: 'ℹ️' })
        router.push('/purchases')
        return
      }

      setPurchase(data)
      setLoading(false)
    })
  }, [purchaseId])

  function handleImages(files: FileList) {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/') && f.size < 5 * 1024 * 1024)
    if (valid.length + images.length > 5) { toast.error('الحد الأقصى 5 صور'); return }
    setImages(prev => [...prev, ...valid])
    setImageUrls(prev => [...prev, ...valid.map(f => URL.createObjectURL(f))])
  }

  function removeImage(i: number) {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setImageUrls(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    if (!reason) { toast.error('اختر سبب النزاع'); return }
    if (!description.trim() || description.length < 20) {
      toast.error('اشرح مشكلتك بالتفصيل (20 حرف على الأقل)')
      return
    }
    setSubmitting(true)

    const supabase = createClient()

    // رفع الصور
    const uploadedUrls: string[] = []
    for (const img of images) {
      const path = `disputes/${userId}/${Date.now()}_${img.name}`
      const { error } = await supabase.storage.from('wibya-digital').upload(path, img)
      if (!error) {
        const { data } = supabase.storage.from('wibya-digital').getPublicUrl(path)
        uploadedUrls.push(data.publicUrl)
      }
    }

    const { error } = await supabase.from('disputes').insert({
      purchase_id: purchaseId,
      buyer_id: userId,
      developer_id: purchase.developer_id,
      reason,
      description: description.trim(),
      evidence_images: uploadedUrls,
      status: 'open',
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    })

    if (error) {
      toast.error('خطأ: ' + error.message)
      setSubmitting(false)
      return
    }

    // إشعار للأدمن
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin')
    if (admins?.length) {
      await Promise.all(admins.map(a =>
        supabase.from('notifications').insert({
          user_id: a.id,
          title: '⚠️ نزاع جديد',
          body: `${reason} — ${purchase.digital_products?.title}`,
          type: 'dispute',
          is_read: false,
        })
      ))
    }

    // إشعار للمطور
    await supabase.from('notifications').insert({
      user_id: purchase.developer_id,
      title: '⚠️ تم فتح نزاع على منتجك',
      body: `السبب: ${reason}`,
      type: 'dispute',
      is_read: false,
    })

    toast.success('تم فتح النزاع ✅ سيتم الفصل خلال 4 أيام')
    router.push('/purchases')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  const product = purchase?.digital_products

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <div className="pb-24 pt-4 px-4 max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="رجوع">
            <ArrowRight size={16} className="text-neutral-600 dark:text-neutral-400 rotate-180" aria-hidden="true" />
          </button>
          <div>
            <h1 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Flag size={16} className="text-red-500" aria-hidden="true" />
              فتح نزاع
            </h1>
            <p className="text-xs text-neutral-400">سيتم الفصل خلال 4 أيام عمل</p>
          </div>
        </div>

        {/* Product */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 relative">
            {product?.preview_images?.[0] && (
              <Image src={product.preview_images[0]} alt={product.title} fill className="object-cover" sizes="56px" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{product?.title}</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {purchase?.profiles?.store_name || purchase?.profiles?.full_name}
            </p>
            <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5">${purchase?.amount?.toFixed(2)}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <p className="font-semibold text-sm text-neutral-900 dark:text-white mb-3">سبب النزاع *</p>
          <div className="space-y-2" role="radiogroup" aria-label="سبب النزاع">
            {REASONS.map(r => (
              <button key={r} type="button" onClick={() => setReason(r)}
                role="radio"
                aria-checked={reason === r}
                className={`w-full text-start px-4 py-3 rounded-xl text-sm transition-colors ${
                  reason === r
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <label className="font-semibold text-sm text-neutral-900 dark:text-white mb-2 block" htmlFor="dispute-desc">
            وصف المشكلة بالتفصيل *
          </label>
          <textarea
            id="dispute-desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="اشرح المشكلة بالتفصيل — ماذا حدث؟ ماذا توقعت؟ ماذا حصلت؟"
            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-neutral-400 transition-colors resize-none"
            rows={4}
          />
          <p className="text-[10px] text-neutral-400 mt-1 text-end">{description.length}/500</p>
        </div>

        {/* Evidence Images */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <p className="font-semibold text-sm text-neutral-900 dark:text-white mb-2">صور كدليل (اختياري)</p>
          <p className="text-xs text-neutral-400 mb-3">أضف screenshots تثبت المشكلة — الحد الأقصى 5 صور</p>

          <div className="grid grid-cols-4 gap-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
                <Image src={url} alt={`دليل ${i+1}`} fill className="object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 end-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  aria-label={`حذف الصورة ${i+1}`}>
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors">
                <Upload size={18} className="text-neutral-400" aria-hidden="true" />
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={e => e.target.files && handleImages(e.target.files)} />
              </label>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">تنبيه مهم</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              فتح نزاع كاذب أو بدون مبرر قد يؤدي لتعليق حسابك. تأكد من وجود مشكلة حقيقية قبل المتابعة.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !reason || description.length < 20}
          className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl text-sm disabled:opacity-40 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Flag size={16} aria-hidden="true" />
          )}
          {submitting ? 'جاري الإرسال...' : 'فتح النزاع'}
        </button>
      </div>
      <BottomNav />
    </div>
  )
}

export default function DisputePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    }>
      <DisputeForm />
    </Suspense>
  )
}