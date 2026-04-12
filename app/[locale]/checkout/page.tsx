'use client'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
// TODO: استبدال PayPal ببوابة AmanPay
import Image from 'next/image'
import {
  ArrowRight, Shield, Check, Lock,
  Package, Tag, Clock, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

function CheckoutForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams.get('product')

  const [product, setProduct] = useState<any>(null)
  const [developer, setDeveloper] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<any>(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [purchaseId, setPurchaseId] = useState<string>('')

  useEffect(() => {
    if (!productId) { router.push('/'); return }
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data: p } = await supabase
        .from('digital_products')
        .select('*, profiles(id, full_name, store_name, store_image, is_verified, paypal_email)')
        .eq('id', productId)
        .eq('status', 'active')
        .single()

      if (!p) { toast.error('المنتج غير موجود'); router.push('/'); return }

      // هل اشترى من قبل؟
      const { data: existing } = await supabase
        .from('purchases')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('product_id', productId)
        .in('status', ['completed', 'escrow'])
        .single()

      if (existing) {
        toast('اشتريت هذا المنتج مسبقاً', { icon: 'ℹ️' })
        router.push('/purchases')
        return
      }

      setProduct(p)
      setDeveloper(p.profiles)
      setLoading(false)
    })
  }, [productId])

  async function applyCoupon() {
    if (!couponCode.trim() || !productId) return
    setCheckingCoupon(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('product_id', productId)
      .eq('is_active', true)
      .single()

    if (!data) {
      toast.error('كود الخصم غير صحيح أو منتهي')
      setCoupon(null)
    } else if (data.used_count >= data.max_uses) {
      toast.error('كود الخصم استُنفد')
      setCoupon(null)
    } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error('كود الخصم منتهي الصلاحية')
      setCoupon(null)
    } else {
      setCoupon(data)
      toast.success(`تم تطبيق خصم ${data.discount_percent}% ✅`)
    }
    setCheckingCoupon(false)
  }

  const finalPrice = coupon
    ? product?.price * (1 - coupon.discount_percent / 100)
    : product?.price

  const platformFee = finalPrice * 0.09
  const developerAmount = finalPrice - platformFee

  async function createOrder() {
    return `${finalPrice.toFixed(2)}`
  }

  async function onApprove(data: any) {
    const supabase = createClient()
    try {
      // إنشاء الشراء في قاعدة البيانات
      const { data: purchase, error } = await supabase
        .from('purchases')
        .insert({
          buyer_id: userId,
          product_id: productId,
          developer_id: product.developer_id,
          amount: finalPrice,
          platform_fee: platformFee,
          developer_amount: developerAmount,
          currency: 'USD',
          payment_method: 'card',
          payment_id: data.orderID,
          status: 'escrow',
          escrow_until: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          coupon_id: coupon?.id || null,
          coupon_discount: coupon ? product.price * (coupon.discount_percent / 100) : 0,
        })
        .select('id')
        .single()

      if (error || !purchase) throw error

      setPurchaseId(purchase.id)

      // تحديث استخدام الكوبون
      if (coupon) {
        await supabase.from('coupons')
          .update({ used_count: coupon.used_count + 1 })
          .eq('id', coupon.id)
      }

      // تحديث إحصائيات المنتج
      await supabase.from('digital_products')
        .update({ sales_count: (product.sales_count || 0) + 1 })
        .eq('id', productId)

      // إشعار للمطور
      await supabase.from('notifications').insert({
        user_id: product.developer_id,
        title: '🎉 بيعة جديدة!',
        body: `تم شراء "${product.title}" مقابل $${finalPrice.toFixed(2)}`,
        type: 'product',
        is_read: false,
      })

      // إنشاء رابط التحميل
      await supabase.rpc('generate_download_token', {
        p_purchase_id: purchase.id,
        p_buyer_id: userId,
      })

      setOrderComplete(true)

    } catch (err) {
      toast.error('خطأ في معالجة الدفع — تواصل مع الدعم')
      console.error(err)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  if (orderComplete) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5">
        <Check size={36} className="text-green-600" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
        تم الشراء بنجاح! 🎉
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-1">
        يمكنك تحميل المنتج الآن من صفحة مشترياتي
      </p>
      <p className="text-neutral-400 text-xs mb-8">
        سيتم تحويل المبلغ للمطور بعد 48 ساعة
      </p>
      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={() => router.push('/purchases')}
          className="flex-1 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl text-sm"
        >
          تحميل المنتج
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex-1 py-3.5 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-2xl text-sm"
        >
          الرئيسية
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3 px-4 h-14">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="رجوع"
        >
          <ArrowRight size={18} className="text-neutral-700 dark:text-neutral-300 rotate-180" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-green-500" aria-hidden="true" />
          <h1 className="font-bold text-neutral-900 dark:text-white">إتمام الشراء</h1>
        </div>
      </header>

      <div className="px-4 py-4 pb-10 max-w-lg mx-auto space-y-4">

        {/* Product Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 relative">
            {product?.preview_images?.[0] ? (
              <Image src={product.preview_images[0]} alt={product.title} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={24} className="text-neutral-300" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{product?.title}</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {developer?.store_name || developer?.full_name || 'مطور'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-full">
                {product?.category}
              </span>
              {product?.quality_badge && (
                <span className="text-[10px] bg-green-50 dark:bg-green-900/20 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield size={9} aria-hidden="true" /> مفحوص
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Coupon */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
            <Tag size={14} aria-hidden="true" />
            كود الخصم
          </p>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && applyCoupon()}
              placeholder="أدخل كود الخصم"
              className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white outline-none focus:border-neutral-400 transition-colors"
              dir="ltr"
              aria-label="كود الخصم"
            />
            <button
              onClick={applyCoupon}
              disabled={checkingCoupon || !couponCode.trim()}
              className="px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl text-sm disabled:opacity-40"
            >
              {checkingCoupon ? '...' : 'تطبيق'}
            </button>
          </div>
          {coupon && (
            <div className="flex items-center gap-2 mt-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
              <Check size={14} className="text-green-500" aria-hidden="true" />
              <p className="text-xs text-green-700 dark:text-green-300">
                خصم {coupon.discount_percent}% مطبق!
              </p>
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">ملخص الطلب</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">سعر المنتج</span>
              <span className="text-neutral-900 dark:text-white">${product?.price?.toFixed(2)}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-green-600">
                <span>خصم {coupon.discount_percent}%</span>
                <span>-${(product?.price * coupon.discount_percent / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 font-bold">
              <span className="text-neutral-900 dark:text-white">المجموع</span>
              <span className="text-neutral-900 dark:text-white text-lg">${finalPrice?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Guarantees */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Shield, text: 'دفع آمن' },
            { icon: Clock, text: 'وصول دائم' },
            { icon: Check, text: 'بدون اشتراك' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-3 text-center">
              <Icon size={16} className="text-green-500 mx-auto mb-1" aria-hidden="true" />
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{text}</p>
            </div>
          ))}
        </div>

        {/* Escrow Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <strong>نظام الحماية Escrow:</strong> مبلغك محمي لمدة 48 ساعة. إذا واجهت مشكلة يمكنك فتح نزاع خلال هذه المدة.
          </p>
        </div>

        {/* زر الدفع - سيتم استبداله ببوابة AmanPay */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock size={14} className="text-green-500" aria-hidden="true" />
            الدفع الآمن
          </p>

          {/* TODO: تكامل AmanPay هنا */}
          <button
            disabled
            className="w-full py-4 bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 font-bold rounded-2xl text-sm cursor-not-allowed"
          >
            الدفع قريباً — جاري تفعيل بوابة الدفع
          </button>

          <p className="text-[10px] text-neutral-400 text-center mt-3">
            بالضغط على "Pay Now" توافق على شروط الاستخدام وسياسة عدم الاسترداد
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  )
}