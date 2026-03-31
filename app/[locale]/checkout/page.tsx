'use client'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { ArrowRight, ShieldCheck, Package, Check, Truck, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

const CITIES = ['الدار البيضاء','الرباط','فاس','مراكش','أكادير','طنجة','مكناس','وجدة','تطوان','سلا','أخرى']

// ✅ خارج الـ component
function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
        {label}{required && <span className="text-red-500 ms-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function CheckoutForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams.get('product')

  const [product, setProduct] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [ordered, setOrdered] = useState(false)

  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!productId) { router.push('/'); return }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      Promise.all([
        supabase.from('products').select('id, name, price, images, seller_id, profiles(id, store_name, store_image)').eq('id', productId).single(),
        supabase.from('profiles').select('phone, city').eq('id', user.id).single(),
      ]).then(([{ data: p }, { data: profile }]) => {
        if (!p) { router.push('/'); return }
        setProduct(p)
        setSeller((p as any).profiles)
        if (profile?.phone) setPhone(profile.phone)
        if (profile?.city) setCity(profile.city)
        setLoading(false)
      })
    })
  }, [productId])

  function validate() {
    const e: Record<string, string> = {}
    if (!address.trim()) e.address = 'العنوان مطلوب'
    if (!city) e.city = 'المدينة مطلوبة'
    if (!phone.trim()) e.phone = 'الهاتف مطلوب'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function submit() {
    if (!validate() || !userId || !product) return
    setOrdering(true)

    const supabase = createClient()
    const { error } = await supabase.from('orders').insert({
      buyer_id: userId,
      seller_id: product.seller_id,
      total: product.price,
      subtotal: product.price,
      status: 'pending',
      payment_method: 'cod',
      shipping_address: `${address.trim()}، ${city}`,
      items: [{ name: product.name, quantity: 1, price: product.price, total: product.price }],
    })

    if (error) {
      toast.error(error.message)
      setOrdering(false)
      return
    }

    await supabase.from('notifications').insert({
      user_id: product.seller_id,
      title: '🛍️ طلب جديد!',
      body: `"${product.name}" — ${product.price.toLocaleString()} د.م. من ${city}`,
      type: 'order',
      is_read: false,
    })

    setOrdered(true)
    setOrdering(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  if (ordered) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5">
        <Check size={36} className="text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">تم الطلب ✅</h1>
      <p className="text-neutral-400 text-sm mb-1">سيتواصل معك البائع قريباً</p>
      <p className="text-neutral-300 text-xs mb-8">الدفع عند الاستلام · حماية Wibya</p>
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={() => router.push('/')} className="flex-1 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-2xl text-sm">الرئيسية</button>
        <button onClick={() => router.push('/orders')} className="flex-1 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-2xl text-sm">طلباتي</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3 px-4 h-14">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowRight size={18} className="text-neutral-700 dark:text-neutral-300 rotate-180" />
        </button>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Wibya" width={26} height={26} className="object-contain" />
          <h1 className="font-bold text-neutral-900 dark:text-white">إتمام الطلب</h1>
        </div>
      </header>

      <div className="px-4 py-4 pb-36 max-w-lg mx-auto space-y-4">

        {/* Product */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
            {product?.images?.[0]
              ? <Image src={product.images[0]} alt={product.name} width={56} height={56} className="object-cover w-full h-full" />
              : <Package size={18} className="text-neutral-300 m-auto mt-4" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{product?.name}</p>
            <p className="text-xs text-neutral-400">{(seller as any)?.store_name || 'متجر'}</p>
          </div>
          <p className="font-bold text-neutral-900 dark:text-white shrink-0">{product?.price?.toLocaleString()} <span className="text-xs font-normal text-neutral-400">د.م.</span></p>
        </div>

        {/* Shipping */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Truck size={15} className="text-neutral-500" />
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">معلومات التسليم</h2>
          </div>

          <Field label="العنوان الكامل" required error={errors.address}>
            <input
              type="text"
              value={address}
              onChange={e => { setAddress(e.target.value); setErrors(prev => ({ ...prev, address: '' })) }}
              className={`w-full px-4 py-3 rounded-2xl text-sm bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white placeholder-neutral-400 outline-none transition-colors ${errors.address ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-500'}`}
              placeholder="الحي، الشارع، رقم البناية..."
            />
          </Field>

          <Field label="المدينة" required error={errors.city}>
            <select
              value={city}
              onChange={e => { setCity(e.target.value); setErrors(prev => ({ ...prev, city: '' })) }}
              className={`w-full px-4 py-3 rounded-2xl text-sm bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white outline-none transition-colors ${errors.city ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-500'}`}
            >
              <option value="">اختر المدينة...</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="رقم الهاتف" required error={errors.phone}>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: '' })) }}
              className={`w-full px-4 py-3 rounded-2xl text-sm bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white placeholder-neutral-400 outline-none transition-colors ${errors.phone ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-500'}`}
              placeholder="+212 6XX-XXXXXX"
              dir="ltr"
            />
          </Field>

          <Field label="ملاحظات (اختياري)">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 outline-none resize-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
              rows={2}
              placeholder="أي تفاصيل للبائع..."
            />
          </Field>
        </div>

        {/* Payment */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={15} className="text-neutral-500" />
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">طريقة الدفع</h2>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center shrink-0">
              <Package size={14} className="text-white dark:text-neutral-900" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">الدفع عند الاستلام</p>
              <p className="text-xs text-neutral-400">Cash on Delivery</p>
            </div>
            <div className="ms-auto w-5 h-5 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center">
              <Check size={11} className="text-white dark:text-neutral-900" />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white mb-3">الملخص</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">السعر</span>
              <span className="text-neutral-900 dark:text-white">{product?.price?.toLocaleString()} د.م.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">التوصيل</span>
              <span className="text-green-600">مجاناً</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-900 dark:text-white">المجموع</span>
              <span className="text-neutral-900 dark:text-white">{product?.price?.toLocaleString()} د.م.</span>
            </div>
          </div>
        </div>

        {/* Protection */}
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-3">
          <ShieldCheck size={16} className="text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-300">حماية Wibya — ضمان الاسترجاع خلال 7 أيام في حال وجود عيب</p>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 start-0 end-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 p-4">
        <button onClick={submit} disabled={ordering}
          className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
          {ordering
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><ShieldCheck size={17} /> تأكيد الطلب — {product?.price?.toLocaleString()} د.م.</>
          }
        </button>
        <p className="text-center text-xs text-neutral-400 mt-1.5">الحقول المعلمة بـ * إلزامية</p>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>}>
      <CheckoutForm />
    </Suspense>
  )
}