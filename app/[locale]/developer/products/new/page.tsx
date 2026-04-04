'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { TopBar } from '@/components/layout/TopBar'
import {
  Upload, X, Plus, ArrowRight, ArrowLeft,
  Code2, FileText, Image as ImageIcon, Link,
  DollarSign, Tag, Info, CheckCircle, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

const CATEGORIES = [
  { key: 'template', label: 'قالب متجر', labelFr: 'Template', icon: '🛍️' },
  { key: 'tool', label: 'أداة', labelFr: 'Outil', icon: '🔧' },
  { key: 'course', label: 'دورة تعليمية', labelFr: 'Cours', icon: '🎓' },
  { key: 'ui_kit', label: 'UI Kit', labelFr: 'UI Kit', icon: '🎨' },
  { key: 'saas', label: 'SaaS Template', labelFr: 'SaaS', icon: '⚡' },
  { key: 'other', label: 'أخرى', labelFr: 'Autre', icon: '📦' },
]

const TECH_STACK_OPTIONS = [
  'Next.js', 'React', 'Vue.js', 'Nuxt', 'Laravel', 'Node.js',
  'Supabase', 'Firebase', 'Tailwind CSS', 'TypeScript', 'Python',
  'Django', 'FastAPI', 'Flutter', 'React Native', 'MongoDB', 'PostgreSQL'
]

const STEPS = [
  { id: 1, label: 'المعلومات الأساسية' },
  { id: 2, label: 'الملفات والمعاينة' },
  { id: 3, label: 'السعر والتفاصيل' },
  { id: 4, label: 'المراجعة والنشر' },
]

// ✅ Field component خارج الـ component الرئيسي
function Field({
  label, required, error, hint, children
}: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-400 dark:text-neutral-500">{hint}</p>}
      {error && (
        <div className="flex items-center gap-1.5">
          <AlertCircle size={12} className="text-red-500 shrink-0" aria-hidden="true" />
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}
    </div>
  )
}

const inputCls = "w-full px-4 py-3 rounded-2xl text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"

export default function NewProductPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string>('')

  // Step 1 — المعلومات الأساسية
  const [title, setTitle] = useState('')
  const [titleFr, setTitleFr] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionFr, setDescriptionFr] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])

  // Step 2 — الملفات
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [previewImages, setPreviewImages] = useState<File[]>([])
  const [previewImageUrls, setPreviewImageUrls] = useState<string[]>([])
  const [demoUrl, setDemoUrl] = useState('')
  const [previewVideo, setPreviewVideo] = useState('')
  const [previewPdf, setPreviewPdf] = useState<File | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)

  // Step 3 — السعر
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [version, setVersion] = useState('1.0.0')
  const [requirements, setRequirements] = useState('')
  const [installationGuide, setInstallationGuide] = useState('')
  const [supportDuration, setSupportDuration] = useState('30')

  const [errors, setErrors] = useState<Record<string, string>>({})

  const zipRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  // جلب userId
  useState(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
    })
  })

  // Validation
  function validateStep(s: number): boolean {
    const e: Record<string, string> = {}
    if (s === 1) {
      if (!title.trim()) e.title = 'العنوان مطلوب'
      if (title.length < 10) e.title = 'العنوان يجب أن يكون 10 أحرف على الأقل'
      if (!description.trim()) e.description = 'الوصف مطلوب'
      if (description.length < 50) e.description = 'الوصف يجب أن يكون 50 حرف على الأقل'
      if (!category) e.category = 'اختر فئة للمنتج'
    }
    if (s === 2) {
      if (!zipFile) e.zipFile = 'ملف ZIP مطلوب'
      if (previewImages.length === 0) e.previewImages = 'أضف صورة واحدة على الأقل'
      if (previewImages.length > 5) e.previewImages = 'الحد الأقصى 5 صور'
    }
    if (s === 3) {
      if (!price) e.price = 'السعر مطلوب'
      if (parseFloat(price) < 5) e.price = 'الحد الأدنى للسعر $5'
      if (originalPrice && parseFloat(originalPrice) <= parseFloat(price)) {
        e.originalPrice = 'السعر الأصلي يجب أن يكون أكبر من السعر الحالي'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function nextStep() {
    if (validateStep(step)) setStep(s => Math.min(s + 1, 4))
  }

  function prevStep() {
    setStep(s => Math.max(s - 1, 1))
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  function toggleTech(tech: string) {
    setTechStack(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    )
  }

  async function handleImagesSelect(files: FileList) {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/') && f.size < 5 * 1024 * 1024)
    if (valid.length + previewImages.length > 5) {
      toast.error('الحد الأقصى 5 صور')
      return
    }
    setPreviewImages(prev => [...prev, ...valid])
    const urls = valid.map(f => URL.createObjectURL(f))
    setPreviewImageUrls(prev => [...prev, ...urls])
  }

  function removeImage(index: number) {
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
    setPreviewImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadFile(file: File, path: string): Promise<string | null> {
    const supabase = createClient()
    const { error } = await supabase.storage.from('wibya-digital').upload(path, file, { upsert: false })
    if (error) { toast.error('خطأ في رفع الملف: ' + error.message); return null }
    return path
  }

  async function handleSubmit() {
    if (!validateStep(3)) return
    setLoading(true)

    try {
      const supabase = createClient()
      const timestamp = Date.now()

      // 1 — رفع صور المعاينة
      const imageUrls: string[] = []
      for (const img of previewImages) {
        const ext = img.name.split('.').pop()
        const path = `products/${userId}/${timestamp}/preview_${imageUrls.length}.${ext}`
        const { error } = await supabase.storage.from('wibya-digital').upload(path, img)
        if (!error) {
          const { data } = supabase.storage.from('wibya-digital').getPublicUrl(path)
          imageUrls.push(data.publicUrl)
        }
      }

      // 2 — إنشاء المنتج في قاعدة البيانات
      const { data: product, error: productError } = await supabase
        .from('digital_products')
        .insert({
          developer_id: userId,
          title: title.trim(),
          title_fr: titleFr.trim() || null,
          description: description.trim(),
          description_fr: descriptionFr.trim() || null,
          category,
          tags,
          price: parseFloat(price),
          original_price: originalPrice ? parseFloat(originalPrice) : null,
          demo_url: demoUrl.trim() || null,
          preview_images: imageUrls,
          preview_video: previewVideo.trim() || null,
          tech_stack: techStack,
          version: version.trim(),
          requirements: requirements.trim() || null,
          installation_guide: installationGuide.trim() || null,
          support_duration: parseInt(supportDuration),
          status: 'pending',
        })
        .select('id')
        .single()

      if (productError || !product) {
        toast.error('خطأ في إنشاء المنتج: ' + productError?.message)
        setLoading(false)
        return
      }

      // 3 — رفع ملف ZIP
      if (zipFile) {
        const zipPath = `products/${userId}/${timestamp}/main.zip`
        const { error: zipError } = await supabase.storage
          .from('wibya-digital')
          .upload(zipPath, zipFile)

        if (!zipError) {
          await supabase.from('product_files').insert({
            product_id: product.id,
            file_name: zipFile.name,
            file_path: zipPath,
            file_size: zipFile.size,
            file_type: 'application/zip',
            is_main: true,
          })
        }
      }

      // 4 — رفع PDF المعاينة إن وجد
      if (previewPdf) {
        const pdfPath = `products/${userId}/${timestamp}/preview.pdf`
        const { error: pdfError } = await supabase.storage
          .from('wibya-digital')
          .upload(pdfPath, previewPdf)

        if (!pdfError) {
          const { data } = supabase.storage.from('wibya-digital').getPublicUrl(pdfPath)
          await supabase.from('digital_products')
            .update({ preview_pdf: data.publicUrl })
            .eq('id', product.id)
        }
      }

      // 5 — إشعار للأدمن
      const { data: admins } = await supabase
        .from('profiles').select('id').eq('role', 'admin')
      if (admins?.length) {
        await Promise.all(admins.map(a =>
          supabase.from('notifications').insert({
            user_id: a.id,
            title: '📦 منتج جديد بانتظار المراجعة',
            body: `"${title}" — ${category} — $${price}`,
            type: 'product',
            is_read: false,
          })
        ))
      }

      toast.success('تم رفع منتجك بنجاح! سيتم مراجعته قريباً ✅')
      router.push('/developer/products')

    } catch (err) {
      toast.error('حدث خطأ غير متوقع')
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />

      {/* Progress */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-1.5 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    step > s.id ? 'bg-green-500 text-white' :
                    step === s.id ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' :
                    'bg-neutral-200 dark:bg-neutral-700 text-neutral-400'
                  }`}>
                    {step > s.id ? <CheckCircle size={14} /> : s.id}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 transition-colors ${step > s.id ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            الخطوة {step} من {STEPS.length} — {STEPS[step - 1].label}
          </p>
        </div>
      </div>

      <div className="pb-32 pt-6 px-4 max-w-2xl mx-auto space-y-4">

        {/* ============ STEP 1 ============ */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 space-y-4">
              <h2 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Info size={16} className="text-neutral-500" aria-hidden="true" />
                المعلومات الأساسية
              </h2>

              <Field label="عنوان المنتج (عربي)" required error={errors.title} hint="يظهر للمشترين — اجعله واضحاً ومميزاً">
                <input value={title} onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })) }}
                  className={inputCls} placeholder="مثال: قالب متجر إلكتروني كامل بـ Next.js" maxLength={100} />
                <p className="text-[10px] text-neutral-400 text-end">{title.length}/100</p>
              </Field>

              <Field label="عنوان المنتج (فرنسي)" hint="اختياري — للمشترين الناطقين بالفرنسية">
                <input value={titleFr} onChange={e => setTitleFr(e.target.value)}
                  className={inputCls} placeholder="Ex: Template e-commerce complet Next.js" maxLength={100} />
              </Field>

              <Field label="وصف المنتج (عربي)" required error={errors.description} hint="اشرح ما يتضمنه المنتج، مميزاته، وكيفية استخدامه">
                <textarea value={description} onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })) }}
                  className={inputCls + ' resize-none'} rows={5}
                  placeholder="اشرح منتجك بالتفصيل — ما الذي يحتويه؟ ما المشكلة التي يحلها؟ من المستهدف منه؟" />
                <p className="text-[10px] text-neutral-400 text-end">{description.length}/2000</p>
              </Field>

              <Field label="وصف المنتج (فرنسي)" hint="اختياري">
                <textarea value={descriptionFr} onChange={e => setDescriptionFr(e.target.value)}
                  className={inputCls + ' resize-none'} rows={3}
                  placeholder="Description en français..." />
              </Field>
            </div>

            {/* الفئة */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
              <Field label="فئة المنتج" required error={errors.category}>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {CATEGORIES.map(cat => (
                    <button key={cat.key} type="button" onClick={() => { setCategory(cat.key); setErrors(p => ({ ...p, category: '' })) }}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all text-start ${
                        category === cat.key
                          ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800'
                          : 'border-neutral-100 dark:border-neutral-700 hover:border-neutral-300'
                      }`}>
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {/* التقنيات */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 space-y-3">
              <Field label="التقنيات المستخدمة" hint="اختر كل التقنيات التي بني عليها المنتج">
                <div className="flex flex-wrap gap-2 mt-1">
                  {TECH_STACK_OPTIONS.map(tech => (
                    <button key={tech} type="button" onClick={() => toggleTech(tech)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        techStack.includes(tech)
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                      }`}>
                      {tech}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Tags */}
              <Field label="الكلمات المفتاحية" hint="أضف حتى 10 كلمات مفتاحية">
                <div className="flex gap-2">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className={inputCls} placeholder="مثال: dashboard, admin, react" />
                  <button type="button" onClick={addTag}
                    className="px-4 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl text-sm font-medium shrink-0">
                    <Plus size={16} />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-xs text-neutral-700 dark:text-neutral-300">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} aria-label={`حذف ${tag}`}>
                          <X size={12} className="text-neutral-400 hover:text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          </div>
        )}

        {/* ============ STEP 2 ============ */}
        {step === 2 && (
          <div className="space-y-4">
            {/* ZIP */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
              <Field label="ملف المنتج (ZIP)" required error={errors.zipFile} hint="الملف الذي سيحمله المشتري — الحد الأقصى 500MB">
                <div
                  onClick={() => zipRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                    zipFile
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {zipFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle size={20} className="text-green-500" />
                      <div className="text-start">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{zipFile.name}</p>
                        <p className="text-xs text-neutral-400">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button type="button" onClick={e => { e.stopPropagation(); setZipFile(null) }}
                        className="ms-auto text-neutral-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={28} className="text-neutral-400 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">اضغط لرفع ملف ZIP</p>
                      <p className="text-xs text-neutral-400 mt-1">ZIP فقط — حتى 500MB</p>
                    </>
                  )}
                </div>
                <input ref={zipRef} type="file" accept=".zip" className="hidden"
                  onChange={e => e.target.files?.[0] && setZipFile(e.target.files[0])} />
              </Field>
            </div>

            {/* صور المعاينة */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
              <Field label="صور المعاينة" required error={errors.previewImages} hint="أضف 3-5 صور تظهر للمشتري قبل الشراء — الحد الأقصى 5MB لكل صورة">
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {previewImageUrls.map((url, i) => (
                    <div key={i} className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden">
                      <Image src={url} alt={`معاينة ${i + 1}`} fill className="object-cover" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                        aria-label={`حذف الصورة ${i + 1}`}>
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {previewImages.length < 5 && (
                    <button type="button" onClick={() => imagesRef.current?.click()}
                      className="aspect-video border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center hover:border-neutral-400 transition-colors">
                      <ImageIcon size={20} className="text-neutral-400 mb-1" aria-hidden="true" />
                      <span className="text-xs text-neutral-400">إضافة</span>
                    </button>
                  )}
                </div>
                <input ref={imagesRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => e.target.files && handleImagesSelect(e.target.files)} />
              </Field>
            </div>

            {/* روابط إضافية */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 space-y-4">
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Link size={15} className="text-neutral-500" aria-hidden="true" />
                روابط إضافية
              </h3>

              <Field label="رابط Demo" hint="رابط لنسخة تجريبية حية من المنتج (اختياري لكن مُنصح به)">
                <input value={demoUrl} onChange={e => setDemoUrl(e.target.value)}
                  className={inputCls} placeholder="https://demo.yourproject.com" dir="ltr" />
              </Field>

              <Field label="رابط فيديو تعريفي" hint="YouTube أو Vimeo — يزيد مبيعاتك بشكل كبير (اختياري)">
                <input value={previewVideo} onChange={e => setPreviewVideo(e.target.value)}
                  className={inputCls} placeholder="https://youtube.com/watch?v=..." dir="ltr" />
              </Field>

              <Field label="ملف PDF توضيحي" hint="وثيقة تشرح المنتج (اختياري)">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => pdfRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors">
                    <FileText size={15} aria-hidden="true" />
                    {previewPdf ? previewPdf.name : 'رفع PDF'}
                  </button>
                  {previewPdf && (
                    <button type="button" onClick={() => setPreviewPdf(null)} aria-label="حذف PDF">
                      <X size={16} className="text-neutral-400 hover:text-red-500" />
                    </button>
                  )}
                </div>
                <input ref={pdfRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => e.target.files?.[0] && setPreviewPdf(e.target.files[0])} />
              </Field>
            </div>
          </div>
        )}

        {/* ============ STEP 3 ============ */}
        {step === 3 && (
          <div className="space-y-4">
            {/* السعر */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 space-y-4">
              <h2 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <DollarSign size={16} className="text-neutral-500" aria-hidden="true" />
                السعر
              </h2>

              <Field label="السعر الحالي (USD)" required error={errors.price} hint="الحد الأدنى $5 — اختر سعراً يعكس قيمة منتجك">
                <div className="relative">
                  <span className="absolute start-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                  <input type="number" value={price} onChange={e => { setPrice(e.target.value); setErrors(p => ({ ...p, price: '' })) }}
                    className={inputCls + ' ps-8'} placeholder="49" min="5" step="1" dir="ltr" />
                </div>
              </Field>

              <Field label="السعر الأصلي (اختياري)" error={errors.originalPrice} hint="إذا كان المنتج في تخفيض — يظهر مشطوباً">
                <div className="relative">
                  <span className="absolute start-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                  <input type="number" value={originalPrice} onChange={e => { setOriginalPrice(e.target.value); setErrors(p => ({ ...p, originalPrice: '' })) }}
                    className={inputCls + ' ps-8'} placeholder="79" min="5" step="1" dir="ltr" />
                </div>
              </Field>

              {/* حساب ما يصل للمطور */}
              {price && parseFloat(price) > 0 && (
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">ملخص مالي:</p>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>سعر المنتج</span>
                    <span>${parseFloat(price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>رسوم المعالجة (9%)</span>
                    <span>-${(parseFloat(price) * 0.09).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <span>ما ستستلمه</span>
                    <span className="text-green-600">${(parseFloat(price) * 0.91).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* تفاصيل تقنية */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 space-y-4">
              <h2 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Code2 size={16} className="text-neutral-500" aria-hidden="true" />
                التفاصيل التقنية
              </h2>

              <Field label="رقم الإصدار" hint="مثال: 1.0.0">
                <input value={version} onChange={e => setVersion(e.target.value)}
                  className={inputCls} placeholder="1.0.0" dir="ltr" />
              </Field>

              <Field label="المتطلبات" hint="ما يحتاجه المشتري لتشغيل المنتج (Node.js, PHP, ...)">
                <textarea value={requirements} onChange={e => setRequirements(e.target.value)}
                  className={inputCls + ' resize-none'} rows={3}
                  placeholder="Node.js 18+, npm, حساب Supabase..." />
              </Field>

              <Field label="دليل التثبيت" hint="خطوات مختصرة لتثبيت المنتج">
                <textarea value={installationGuide} onChange={e => setInstallationGuide(e.target.value)}
                  className={inputCls + ' resize-none'} rows={4}
                  placeholder="1. npm install&#10;2. انسخ .env.example إلى .env&#10;3. npm run dev" />
              </Field>

              <Field label="مدة الدعم (أيام)" hint="كم يوماً ستقدم دعماً للمشتري بعد الشراء">
                <select value={supportDuration} onChange={e => setSupportDuration(e.target.value)} className={inputCls}>
                  <option value="0">بدون دعم</option>
                  <option value="7">7 أيام</option>
                  <option value="30">30 يوم</option>
                  <option value="60">60 يوم</option>
                  <option value="90">90 يوم</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* ============ STEP 4 — مراجعة ============ */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
              <h2 className="font-bold text-neutral-900 dark:text-white mb-4">مراجعة المنتج قبل النشر</h2>

              <div className="space-y-3">
                {[
                  { label: 'العنوان', value: title },
                  { label: 'الفئة', value: CATEGORIES.find(c => c.key === category)?.label },
                  { label: 'السعر', value: `$${price}` },
                  { label: 'الإصدار', value: version },
                  { label: 'مدة الدعم', value: `${supportDuration} يوم` },
                  { label: 'التقنيات', value: techStack.join(', ') || 'غير محدد' },
                  { label: 'ملف ZIP', value: zipFile?.name || 'غير محدد' },
                  { label: 'صور المعاينة', value: `${previewImages.length} صورة` },
                  { label: 'Demo', value: demoUrl || 'غير محدد' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm py-2 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
                    <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
                    <span className="font-medium text-neutral-900 dark:text-white text-end max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* صور المعاينة */}
            {previewImageUrls.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
                <p className="font-semibold text-sm text-neutral-900 dark:text-white mb-3">صور المعاينة</p>
                <div className="grid grid-cols-3 gap-2">
                  {previewImageUrls.map((url, i) => (
                    <div key={i} className="aspect-video relative bg-neutral-100 rounded-xl overflow-hidden">
                      <Image src={url} alt={`معاينة ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* تحذيرات */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 space-y-2">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">⚠️ قبل النشر تأكد من:</p>
              <ul className="space-y-1.5">
                {[
                  'الملف يعمل بشكل صحيح ومختبر',
                  'لا توجد بيانات حقيقية أو API keys في الكود',
                  'يوجد ملف README أو دليل تثبيت',
                  'الوصف دقيق ويطابق محتوى الملف',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                    <span aria-hidden="true">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🔍 بعد رفع المنتج سيقوم <strong>فريق Wibya</strong> بمراجعته خلال 24-48 ساعة.
                ستصلك إشعار بقرار المراجعة.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 start-0 end-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          {step > 1 && (
            <button onClick={prevStep}
              className="flex items-center gap-2 px-5 py-3.5 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-2xl text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <ArrowRight size={16} aria-hidden="true" />
              السابق
            </button>
          )}

          {step < 4 ? (
            <button onClick={nextStep}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl text-sm hover:opacity-90 transition-opacity">
              التالي
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl text-sm disabled:opacity-50 hover:opacity-90 transition-opacity">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-neutral-900/30 dark:border-t-neutral-900 rounded-full animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload size={16} aria-hidden="true" />
                  رفع المنتج للمراجعة
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}