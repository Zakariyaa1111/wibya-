'use client'
import { useState, useRef } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { ArrowRight, Upload, X, Megaphone, Phone, MapPin, Tag, FileText, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['إلكترونيات','سيارات','عقارات','ملابس','أثاث','رياضة','وظائف','خدمات','حيوانات','أخرى']
const CITIES = ['الدار البيضاء','الرباط','فاس','مراكش','أكادير','طنجة','مكناس','وجدة','تطوان','سلا','أخرى']

export default function NewAdPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function uploadImage(file: File) {
    if (images.length >= 4) { toast.error('الحد الأقصى 4 صور'); return }
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const ext = file.name.split('.').pop()
    const path = `ads/${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('wibya-media').upload(path, file)
    if (error) { toast.error('خطأ في الرفع'); setUploading(false); return }
    const { data } = supabase.storage.from('wibya-media').getPublicUrl(path)
    setImages(prev => [...prev, data.publicUrl])
    setUploading(false)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = 'العنوان مطلوب'
    if (!description.trim()) e.description = 'الوصف مطلوب'
    if (!city) e.city = 'المدينة مطلوبة'
    if (!category) e.category = 'الفئة مطلوبة'
    if (!phone.trim()) e.phone = 'الهاتف مطلوب'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { error } = await supabase.from('ads').insert({
      user_id: user.id,
      title: title.trim(),
      headline: description.trim(),
      category,
      city,
      phone: phone.trim(),
      price: price ? parseFloat(price) : null,
      images,
      status: 'pending',
      is_vip: false,
      views_count: 0,
    })

    if (error) {
      toast.error('خطأ: ' + error.message)
      setSubmitting(false)
      return
    }

    // إشعار للأدمن
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin')
    if (admins) {
      await Promise.all(admins.map(a => supabase.from('notifications').insert({
        user_id: a.id,
        title: '📢 إعلان جديد للمراجعة',
        body: `"${title.trim()}" — ${city}`,
        type: 'product',
        is_read: false,
      })))
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5">
        <Check size={36} className="text-green-600 dark:text-green-400" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">تم إرسال الإعلان ✅</h1>
      <p className="text-neutral-400 text-sm mb-2">إعلانك قيد المراجعة من فريق Wibya</p>
      <p className="text-neutral-300 dark:text-neutral-600 text-xs mb-8">سيتم نشره خلال 24 ساعة بعد الموافقة</p>
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={() => router.push('/')}
          className="flex-1 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-2xl text-sm">
          الرئيسية
        </button>
        <button onClick={() => { setSubmitted(false); setTitle(''); setDescription(''); setPrice(''); setPhone(''); setCity(''); setCategory(''); setImages([]) }}
          className="flex-1 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-2xl text-sm">
          إعلان جديد
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3 px-4 h-14">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowRight size={18} className="text-neutral-700 dark:text-neutral-300 rotate-180" />
        </button>
        <div className="flex items-center gap-2">
          <Megaphone size={18} className="text-neutral-600 dark:text-neutral-400" />
          <h1 className="font-bold text-neutral-900 dark:text-white">إضافة إعلان</h1>
        </div>
      </header>

      <div className="px-4 py-4 pb-36 max-w-lg mx-auto space-y-4">

        {/* Images */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white mb-3">الصور ({images.length}/4)</h2>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <Image src={img} alt="" fill className="object-cover" />
                <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:border-neutral-400 transition-colors">
                {uploading
                  ? <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                  : <><Upload size={16} /><span className="text-[10px]">رفع</span></>
                }
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
          <p className="text-xs text-neutral-400 mt-2">أضف حتى 4 صور لإعلانك</p>
        </div>

        {/* Info */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 space-y-4">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText size={15} className="text-neutral-500" /> معلومات الإعلان
          </h2>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">
              عنوان الإعلان <span className="text-red-500">*</span>
            </label>
            <input value={title} onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })) }}
              className={`w-full px-4 py-3 rounded-2xl text-sm bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white placeholder-neutral-400 outline-none transition-colors ${errors.title ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-400'}`}
              placeholder="مثال: سيارة رينو كليو 2019" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">
              الوصف <span className="text-red-500">*</span>
            </label>
            <textarea value={description} onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })) }}
              className={`w-full px-4 py-3 rounded-2xl text-sm bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white placeholder-neutral-400 outline-none resize-none transition-colors ${errors.description ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-400'}`}
              rows={3} placeholder="اكتب تفاصيل إعلانك..." />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
              <Tag size={11} /> السعر (اختياري)
            </label>
            <div className="relative">
              <input value={price} onChange={e => setPrice(e.target.value)}
                type="number" min="0"
                className="w-full px-4 py-3 rounded-2xl text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-neutral-400 transition-colors pe-14"
                placeholder="0" dir="ltr" />
              <span className="absolute inset-y-0 end-4 flex items-center text-xs text-neutral-400">د.م.</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">
              الفئة <span className="text-red-500">*</span>
            </label>
            <select value={category} onChange={e => { setCategory(e.target.value); setErrors(p => ({ ...p, category: '' })) }}
              className={`w-full px-4 py-3 rounded-2xl text-sm bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white outline-none transition-colors ${errors.category ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-400'}`}>
              <option value="">اختر الفئة...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
              <MapPin size={11} /> المدينة <span className="text-red-500">*</span>
            </label>
            <select value={city} onChange={e => { setCity(e.target.value); setErrors(p => ({ ...p, city: '' })) }}
              className={`w-full px-4 py-3 rounded-2xl text-sm bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white outline-none transition-colors ${errors.city ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-400'}`}>
              <option value="">اختر المدينة...</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
              <Phone size={11} /> رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <input value={phone} onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })) }}
              type="tel"
              className={`w-full px-4 py-3 rounded-2xl text-sm bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white placeholder-neutral-400 outline-none transition-colors ${errors.phone ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-400'}`}
              placeholder="+212 6XX-XXXXXX" dir="ltr" />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Info box */}
        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4">
          <Megaphone size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">إعلانك مجاني!</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              سيتم مراجعة إعلانك من فريق Wibya ونشره خلال 24 ساعة.
              يمكنك ترقيته لإعلان VIP لمزيد من الظهور.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 start-0 end-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 p-4">
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Megaphone size={17} /> نشر الإعلان</>
          }
        </button>
        <p className="text-center text-xs text-neutral-400 mt-1.5">الحقول المعلمة بـ * إلزامية</p>
      </div>
    </div>
  )
}