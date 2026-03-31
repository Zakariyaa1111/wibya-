'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter as useNextRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { ArrowRight, ShieldCheck, MapPin, Package, Check, Truck, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams.get('product')

  const [product, setProduct] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [ordered, setOrdered] = useState(false)

  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')

  const CITIES = ['الدار البيضاء','الرباط','فاس','مراكش','أكادير','طنجة','مكناس','وجدة','تطوان','سلا','أخرى']

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth/login'); return }
      setUser(u)

      if (!productId) { router.push('/'); return }

      const { data: p } = await supabase
        .from('products')
        .select('*, profiles(id, store_name, store_image, verified, city, phone)')
        .eq('id', productId)
        .single()

      if (!p) { router.push('/'); return }
      setProduct(p)
      setSeller(p.profiles)

      // جلب معلومات المستخدم
      const { data: profile } = await supabase.from('profiles').select('phone, city').eq('id', u.id).single()
      if (profile?.phone) setPhone(profile.phone)
      if (profile?.city) setCity(profile.city)

      setLoading(false)
    }
    load()
  }, [productId])

  async function handleOrder() {
    if (!address.trim()) { toast.error('يجب إدخال العنوان'); return }
    if (!city) { toast.error('يجب اختيار المدينة'); return }
    if (!phone.trim()) { toast.error('يجب إدخال رقم الهاتف'); return }

    setOrdering(true)
    const supabase = createClient()

    const { error } = await supabase.from('orders').insert({
      buyer_id: user.id,
      seller_id: product.seller_id,
      total: product.price,
      subtotal: product.price,
      status: 'pending',
      payment_method: 'cod',
      shipping_address: `${address}, ${city}`,
      items: [{ name: product.name, quantity: 1, price: product.price, total: product.price }],
    })

    if (error) { toast.error('حدث خطأ: ' + error.message); setOrdering(false); return }

    // إشعار للبائع
    await supabase.from('notifications').insert({
      user_id: product.seller_id,
      title: 'طلب جديد! 🛍️',
      body: `طلب جديد على منتج "${product.name}"`,
      type: 'order', is_read: false,
    })

    setOrdered(true)
    setOrdering(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  if (ordered) return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
        <Check size={40} className="text-green-600 dark:text-green-400" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">تم تأكيد الطلب! ✅</h1>
      <p className="text-neutral-400 dark:text-neutral-500 text-sm mb-2">سيتواصل معك البائع قريباً لتأكيد التسليم</p>
      <p className="text-neutral-300 dark:text-neutral-600 text-xs mb-8">الدفع عند الاستلام · حماية Wibya</p>
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={() => router.push('/')} className="flex-1 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-2xl text-sm">
          الرئيسية
        </button>
        <button onClick={() => router.push('/orders')} className="flex-1 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-2xl text-sm">
          طلباتي
        </button>
      </div>
    </div>
  )

  const commission = Math.round(product.price * 0.06)
  const total = product.price

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3 px-4 h-14">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowRight size={18} className="text-neutral-700 dark:text-neutral-300 rotate-180" />
        </button>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Wibya" width={28} height={28} className="object-contain" />
          <h1 className="font-bold text-neutral-900 dark:text-white">إتمام الطلب</h1>
        </div>
      </header>

      <div className="px-4 py-5 pb-36 max-w-lg mx-auto space-y-4">

        {/* Product summary */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
            {product.images?.[0]
              ? <Image src={product.images[0]} alt={product.name} width={64} height={64} className="object-cover w-full h-full" />
              : <Package size={24} className="text-neutral-300 m-auto" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{product.name}</p>
            {seller && (
              <p className="text-xs text-neutral-400 mt-0.5">{seller.store_name || 'متجر'}</p>
            )}
          </div>
          <div className="text-end shrink-0">
            <p className="font-bold text-neutral-900 dark:text-white">{product.price.toLocaleString()}</p>
            <p className="text-xs text-neutral-400">د.م.</p>
          </div>
        </div>

        {/* Shipping info */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck size={16} className="text-neutral-500" />
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">معلومات التسليم</h2>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">العنوان الكامل *</label>
            <input value={address} onChange={e => setAddress(e.target.value)}
              className="input" placeholder="الحي، الشارع، رقم البناية..." />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">المدينة *</label>
            <select value={city} onChange={e => setCity(e.target.value)} className="input">
              <option value="">اختر المدينة...</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">رقم الهاتف *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              className="input" placeholder="+212..." dir="ltr" />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">ملاحظات (اختياري)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="input resize-none" rows={2} placeholder="أي تفاصيل إضافية للتسليم..." />
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-neutral-500" />
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">طريقة الدفع</h2>
          </div>
          <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 border-2 border-neutral-900 dark:border-white">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center shrink-0">
              <Package size={16} className="text-white dark:text-neutral-900" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">الدفع عند الاستلام</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">Cash on Delivery (COD)</p>
            </div>
            <div className="ms-auto w-5 h-5 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center shrink-0">
              <Check size={12} className="text-white dark:text-neutral-900" />
            </div>
          </div>
        </div>

        {/* Price summary */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white mb-3">ملخص الطلب</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400 dark:text-neutral-500">سعر المنتج</span>
              <span className="text-neutral-900 dark:text-white">{product.price.toLocaleString()} د.م.</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400 dark:text-neutral-500">التوصيل</span>
              <span className="text-green-600 dark:text-green-400">مجاناً</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-neutral-100 dark:border-neutral-800 pt-2 mt-2">
              <span className="text-neutral-900 dark:text-white">المجموع</span>
              <span className="text-neutral-900 dark:text-white">{total.toLocaleString()} د.م.</span>
            </div>
          </div>
        </div>

        {/* Protection */}
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-3">
          <ShieldCheck size={18} className="text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-800 dark:text-green-300">حماية Wibya مضمونة</p>
            <p className="text-xs text-green-600 dark:text-green-500">ضمان استرجاع في حال وجود عيب · فحص خلال 24 ساعة</p>
          </div>
        </div>
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 start-0 end-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 p-4">
        <button onClick={handleOrder} disabled={ordering}
          className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl text-base disabled:opacity-50 flex items-center justify-center gap-2">
          {ordering
            ? <div className="w-5 h-5 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin" />
            : <><ShieldCheck size={18} /> تأكيد الطلب — {total.toLocaleString()} د.م.</>
          }
        </button>
        <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-2">الدفع عند الاستلام · آمن ومضمون</p>
      </div>
    </div>
  )
}