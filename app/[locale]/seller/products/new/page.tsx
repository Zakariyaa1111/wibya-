'use client'
import { useState, useRef } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Image as ImageIcon, X } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['إلكترونيات','ملابس وأزياء','أحذية','أثاث ومنزل','سيارات','عقارات','رياضة','ألعاب','أغذية','جمال وعناية','أخرى']
const CITIES = ['الدار البيضاء','الرباط','فاس','مراكش','أكادير','طنجة','مكناس','وجدة','تطوان','سلا','أخرى']

export default function AddProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [origPrice, setOrigPrice] = useState('')
  const [qty, setQty] = useState('1')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState<'new'|'used'|'refurbished'>('new')
  const [city, setCity] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadImages(files: FileList) {
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${user?.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('wibya-media').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('wibya-media').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setImages(prev => [...prev, ...urls].slice(0, 6))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !price) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Moderate content
    const modRes = await fetch('/api/ai/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `${name} ${desc}`, userId: user?.id }),
    }).then(r => r.json()).catch(() => ({ safe: true }))

    const { error } = await supabase.from('products').insert({
      seller_id: user!.id,
      name, description: desc,
      price: parseFloat(price),
      original_price: origPrice ? parseFloat(origPrice) : null,
      quantity: parseInt(qty),
      category, condition, city,
      images,
      status: modRes.safe ? 'pending' : 'rejected',
    })
    if (error) { toast.error('حدث خطأ'); setSaving(false); return }
    toast.success(modRes.safe ? '✅ تم إضافة المنتج للمراجعة' : '⚠️ تم رفض المنتج لمخالفة الشروط')
    router.push('/seller')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-100 flex items-center gap-3 px-4 h-14">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-neutral-100">
          <ArrowRight size={18} className="text-neutral-700 rotate-180" />
        </button>
        <h1 className="font-semibold text-neutral-900">إضافة منتج</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-5 pb-24 space-y-5 max-w-lg mx-auto">
        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">الصور ({images.length}/6)</label>
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
                <img src={url} className="w-full h-full object-cover" alt="" />
                <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 end-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {images.length < 6 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:border-neutral-400 transition-colors">
                {uploading ? <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                  : <><ImageIcon size={20} /><span className="text-[10px]">إضافة</span></>}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
            onChange={e => e.target.files && uploadImages(e.target.files)} />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">اسم المنتج *</label>
          <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="اسم واضح ومفصل..." required />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">الوصف</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)}
            className="input resize-none" rows={4} placeholder="وصف تفصيلي للمنتج..." />
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">السعر (د.م.) *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)}
              className="input" placeholder="0.00" required min="0" step="0.01" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">السعر الأصلي</label>
            <input type="number" value={origPrice} onChange={e => setOrigPrice(e.target.value)}
              className="input" placeholder="للتخفيضات" min="0" step="0.01" dir="ltr" />
          </div>
        </div>

        {/* Qty & Condition */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">الكمية</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)}
              className="input" min="1" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">الحالة</label>
            <select value={condition} onChange={e => setCondition(e.target.value as any)} className="input">
              <option value="new">جديد</option>
              <option value="used">مستعمل</option>
              <option value="refurbished">مُجدَّد</option>
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">الفئة</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input">
            <option value="">اختر الفئة...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">المدينة</label>
          <select value={city} onChange={e => setCity(e.target.value)} className="input">
            <option value="">اختر المدينة...</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Submit */}
        <div className="fixed bottom-0 start-0 end-0 bg-white border-t border-neutral-100 p-4 pb-safe">
          <button type="submit" disabled={saving || uploading} className="btn-primary w-full py-3.5">
            {saving ? 'جاري الإضافة...' : 'إضافة المنتج للمراجعة'}
          </button>
        </div>
      </form>
    </div>
  )
}
