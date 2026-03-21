'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import {
  ArrowRight, Heart, Share2, Flag, ShieldCheck, MapPin,
  Star, ChevronLeft, ChevronRight, MessageCircle, Phone,
  Package, Clock, CheckCircle2, Store
} from 'lucide-react'
import { useRouter } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { FeedItem } from '@/components/feed/FeedItem'
import toast from 'react-hot-toast'

interface Props {
  product: any
  related: any[]
  reviews: any[]
  qa: any[]
}

export function ProductDetail({ product, related, reviews, qa }: Props) {
  const t = useTranslations('product')
  const locale = useLocale()
  const router = useRouter()
  const [imgIdx, setImgIdx] = useState(0)
  const [liked, setLiked] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [tab, setTab] = useState<'desc'|'reviews'|'qa'>('desc')
  const [question, setQuestion] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [qty, setQty] = useState(1)

  const images: string[] = product.images ?? []
  const seller = product.profiles
  const avgRating = reviews.length
    ? (reviews.reduce((s: number, r: any) => s + r.stars, 0) / reviews.length).toFixed(1)
    : null

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault()
    setOrdering(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('يجب تسجيل الدخول أولاً'); setOrdering(false); return }
    const { error } = await supabase.from('orders').insert({
      buyer_id: user.id,
      seller_id: product.seller_id,
      product_id: product.id,
      quantity: qty,
      total: product.price * qty,
      status: 'pending',
      payment_method: 'cod',
      shipping_address: { name, phone, address },
    })
    if (error) { toast.error('حدث خطأ'); } 
    else { toast.success('✅ تم إرسال طلبك!'); setShowOrderForm(false) }
    setOrdering(false)
  }

  async function submitQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('product_qa').insert({
      product_id: product.id,
      seller_id: product.seller_id,
      user_id: user?.id ?? null,
      question,
    })
    toast.success('تم إرسال سؤالك')
    setQuestion('')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Image carousel */}
      <div className="relative aspect-square bg-neutral-100">
        {images.length > 0 ? (
          <Image src={images[imgIdx]} alt={product.name} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}

        {/* Top bar */}
        <div className="absolute top-0 start-0 end-0 flex items-center justify-between p-4 pt-safe">
          <button onClick={() => router.back()}
            className="w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
            <ArrowRight size={18} className="text-neutral-700 rotate-180" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setLiked(p => !p)}
              className="w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
              <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : 'text-neutral-700'} />
            </button>
            <button className="w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
              <Share2 size={18} className="text-neutral-700" />
            </button>
          </div>
        </div>

        {/* Image nav */}
        {images.length > 1 && (
          <>
            <button onClick={() => setImgIdx(p => Math.max(0, p - 1))}
              className="absolute start-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setImgIdx(p => Math.min(images.length - 1, p + 1))}
              className="absolute end-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-3 start-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-16 start-3 flex flex-col gap-1.5">
          {product.condition && (
            <span className="badge badge-brand text-[11px]">
              {product.condition === 'new' ? 'جديد' : product.condition === 'used' ? 'مستعمل' : 'مُجدَّد'}
            </span>
          )}
          {discount && discount > 5 && (
            <span className="badge bg-red-500 text-white text-[11px] px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-5 pb-32">
        {/* Price & name */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-neutral-900 leading-tight mb-1">{product.name}</h1>
            {product.city && (
              <div className="flex items-center gap-1 text-neutral-400">
                <MapPin size={13} />
                <span className="text-sm">{product.city}</span>
              </div>
            )}
          </div>
          <div className="text-end">
            <div className="text-2xl font-bold text-neutral-900">
              {product.price.toLocaleString()}
              <span className="text-base font-medium text-neutral-500 ms-1">د.م.</span>
            </div>
            {product.original_price && (
              <div className="text-sm text-neutral-400 line-through">
                {product.original_price.toLocaleString()} د.م.
              </div>
            )}
          </div>
        </div>

        {/* Protection */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-2xl p-3 mb-4">
          <ShieldCheck size={16} className="text-green-600 shrink-0" />
          <span className="text-xs text-green-700 font-medium">{t('protection')}</span>
        </div>

        {/* Delivery */}
        <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-2xl p-3 mb-5">
          <Package size={16} className="text-brand-600 shrink-0" />
          <span className="text-xs text-brand-700 font-medium">{t('delivery')}</span>
        </div>

        {/* Seller card */}
        {seller && (
          <div className="flex items-center gap-3 bg-neutral-50 rounded-2xl p-3 mb-5 border border-neutral-100">
            <div className="w-12 h-12 rounded-xl bg-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
              {seller.store_image
                ? <Image src={seller.store_image} alt="" width={48} height={48} className="object-cover" />
                : <Store size={20} className="text-neutral-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-neutral-900 truncate">{seller.store_name || 'متجر'}</span>
                {seller.verified && <ShieldCheck size={13} className="text-blue-500 shrink-0" />}
              </div>
              {seller.city && <span className="text-xs text-neutral-400">{seller.city}</span>}
              {seller.total_sales > 0 && (
                <span className="text-xs text-neutral-400"> · {seller.total_sales} مبيعة</span>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {seller.whatsapp && (
                <a href={`https://wa.me/212${seller.whatsapp.replace(/^0/,'')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
                  <MessageCircle size={16} className="text-white" />
                </a>
              )}
              {seller.phone && (
                <a href={`tel:${seller.phone}`}
                  className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
                  <Phone size={16} className="text-white" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-neutral-100 rounded-2xl p-1">
          {(['desc','reviews','qa'] as const).map(t_ => (
            <button key={t_} onClick={() => setTab(t_)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t_ ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
              }`}>
              {t_ === 'desc' ? 'الوصف' : t_ === 'reviews' ? `التقييمات (${reviews.length})` : `أسئلة (${qa.length})`}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'desc' && (
          <p className="text-neutral-600 text-sm leading-relaxed">
            {product.description || 'لا يوجد وصف لهذا المنتج.'}
          </p>
        )}

        {tab === 'reviews' && (
          <div className="space-y-3">
            {avgRating && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl font-bold text-neutral-900">{avgRating}</span>
                <div>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} className={parseFloat(avgRating) >= s ? 'fill-brand-400 text-brand-400' : 'text-neutral-200'} />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400">{reviews.length} تقييم</span>
                </div>
              </div>
            )}
            {reviews.length === 0
              ? <p className="text-neutral-400 text-sm text-center py-6">لا توجد تقييمات بعد</p>
              : reviews.map((r: any) => (
                <div key={r.id} className="border-b border-neutral-50 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-neutral-800">{r.profiles?.full_name || 'مجهول'}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={11} className={r.stars >= s ? 'fill-brand-400 text-brand-400' : 'text-neutral-200'} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-neutral-500">{r.comment}</p>}
                </div>
              ))
            }
          </div>
        )}

        {tab === 'qa' && (
          <div className="space-y-4">
            <form onSubmit={submitQuestion} className="flex gap-2">
              <input value={question} onChange={e => setQuestion(e.target.value)}
                className="input flex-1 text-sm" placeholder="اطرح سؤالاً..." />
              <button type="submit" className="btn-primary px-4 py-2 text-sm">إرسال</button>
            </form>
            {qa.length === 0
              ? <p className="text-neutral-400 text-sm text-center py-4">لا توجد أسئلة بعد</p>
              : qa.map((q: any) => (
                <div key={q.id} className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-brand-500 text-sm font-bold shrink-0">س:</span>
                    <span className="text-sm text-neutral-700">{q.question}</span>
                  </div>
                  {q.answer && (
                    <div className="flex items-start gap-2 ms-4">
                      <span className="text-green-600 text-sm font-bold shrink-0">ج:</span>
                      <span className="text-sm text-neutral-600">{q.answer}</span>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-neutral-900 mb-4">منتجات مشابهة</h3>
            <div className="grid grid-cols-1 gap-4">
              {related.slice(0,3).map((p, i) => <FeedItem key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 start-0 end-0 bg-white border-t border-neutral-100 p-4 pb-safe z-50">
        {!showOrderForm ? (
          <div className="flex gap-3">
            {seller?.whatsapp && (
              <a href={`https://wa.me/212${seller.whatsapp.replace(/^0/,'')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-green-500 text-green-600 font-semibold text-sm">
                <MessageCircle size={16} /> واتساب
              </a>
            )}
            <button onClick={() => setShowOrderForm(true)}
              className="flex-1 btn-primary py-3.5 text-sm">
              {t('buy')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleOrder} className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-neutral-900 text-sm">تأكيد الطلب</h3>
              <button type="button" onClick={() => setShowOrderForm(false)}
                className="text-neutral-400 text-xs">إلغاء</button>
            </div>
            <input value={name} onChange={e => setName(e.target.value)}
              className="input text-sm" placeholder="الاسم الكامل" required />
            <input value={phone} onChange={e => setPhone(e.target.value)}
              className="input text-sm" placeholder="رقم الهاتف" required dir="ltr" />
            <input value={address} onChange={e => setAddress(e.target.value)}
              className="input text-sm" placeholder="العنوان الكامل" required />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-neutral-200 rounded-xl">
                <button type="button" onClick={() => setQty(p => Math.max(1,p-1))}
                  className="w-9 h-9 flex items-center justify-center text-neutral-600">−</button>
                <span className="w-8 text-center text-sm font-medium">{qty}</span>
                <button type="button" onClick={() => setQty(p => Math.min(product.quantity,p+1))}
                  className="w-9 h-9 flex items-center justify-center text-neutral-600">+</button>
              </div>
              <button type="submit" disabled={ordering} className="btn-primary flex-1 py-3 text-sm">
                {ordering ? '...' : `تأكيد — ${(product.price * qty).toLocaleString()} د.م.`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
