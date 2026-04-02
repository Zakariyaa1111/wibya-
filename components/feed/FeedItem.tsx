'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, MapPin, ShieldCheck, Flag, X, Send, ShoppingCart } from 'lucide-react'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'
import toast from 'react-hot-toast'

type Product = Database['public']['Tables']['products']['Row'] & {
  profiles?: { store_name: string | null; store_image: string | null; verified: boolean }
}

const REPORT_REASONS = [
  { key: 'misleading', label: 'إعلان مضلل أو مزيف' },
  { key: 'inappropriate', label: 'محتوى غير لائق' },
  { key: 'spam', label: 'بريد مزعج' },
  { key: 'wrong_price', label: 'سعر مبالغ فيه' },
  { key: 'other', label: 'سبب آخر' },
]

export function FeedItem({ product, index = 0 }: { product: Product; index?: number }) {
  const locale = useLocale()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [reported, setReported] = useState(false)
  const [showReportMenu, setShowReportMenu] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const mainImage = product.images?.[0] ?? '/placeholder.jpg'
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('product_id', product.id)
      setLikeCount(count ?? 0)
      if (user) {
        const { data } = await supabase.from('likes').select('id').eq('product_id', product.id).eq('user_id', user.id).single()
        setLiked(!!data)
      }
    }
    init()
  }, [product.id])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!userId) return
    const supabase = createClient()
    if (liked) {
      await supabase.from('likes').delete().eq('product_id', product.id).eq('user_id', userId)
      setLiked(false); setLikeCount(prev => prev - 1)
    } else {
      await supabase.from('likes').insert({ product_id: product.id, user_id: userId })
      setLiked(true); setLikeCount(prev => prev + 1)
    }
  }

  const handleComment = async (e: React.MouseEvent) => {
    e.preventDefault()
    setShowComments(prev => !prev)
    if (!showComments) {
      const supabase = createClient()
      const { data } = await supabase.from('comments').select('*, profiles(full_name, store_name)').eq('product_id', product.id).order('created_at', { ascending: false }).limit(10)
      setComments(data ?? [])
    }
  }

  const submitComment = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !userId || commentLoading) return
    setCommentLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('comments').insert({ product_id: product.id, user_id: userId, content: newComment.trim() }).select('*, profiles(full_name, store_name)').single()
    if (data) setComments(prev => [data, ...prev])
    setNewComment(''); setCommentLoading(false)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    if (navigator.share) navigator.share({ title: product.name, url: `/${locale}/product/${product.id}` })
  }

  const submitReport = async () => {
    if (!selectedReason || !userId) return
    const supabase = createClient()
    await supabase.from('product_reports').insert({
      product_id: product.id, reporter_id: userId,
      reason: selectedReason, details: reportDetails.trim() || null,
    })
    toast.success('تم إرسال البلاغ ✅')
    setReported(true); setShowReportMenu(false)
    setSelectedReason(''); setReportDetails('')
  }

  return (
    <div>
      <Link href={`/product/${product.id}`} aria-label={`${product.name} — ${product.price.toLocaleString()} د.م.`}>
        <article
          className="feed-card animate-fade-up"
          style={{ animationDelay: `${index * 60}ms` }}
          aria-label={product.name}
        >
          {/* Image */}
          <div className="relative aspect-[4/5] bg-neutral-100 dark:bg-neutral-800">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute top-3 start-3 flex flex-col gap-1.5" aria-hidden="true">
              {/* ✅ تباين محسّن: amber-600 بدل amber-500 */}
              {product.is_featured && (
                <span className="text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm bg-amber-600">
                  ⭐ مميز
                </span>
              )}
              {/* ✅ red-600 بدل red-500 */}
              {discount && discount > 10 && (
                <span className="text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm bg-red-600">
                  -{discount}%
                </span>
              )}
            </div>
            <div className="absolute bottom-0 start-0 end-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-white font-bold text-xl">{product.price.toLocaleString()}</span>
                    <span className="text-white/80 text-sm">د.م.</span>
                  </div>
                  {product.city && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-white/70" aria-hidden="true" />
                      <span className="text-white/80 text-xs">{product.city}</span>
                    </div>
                  )}
                </div>
                {product.original_price && (
                  <span className="text-white/50 text-sm line-through" aria-label={`السعر الأصلي ${product.original_price.toLocaleString()} درهم`}>
                    {product.original_price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-3 dark:bg-neutral-900">
            <h3 className="font-semibold text-neutral-900 dark:text-white text-sm line-clamp-2 leading-snug mb-3">
              {product.name}
            </h3>

            {/* Actions row */}
            <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-2.5">
              <div className="flex items-center gap-3">
                {/* ✅ aria-label + aria-pressed */}
                <button
                  onClick={handleLike}
                  aria-label={liked ? `إلغاء الإعجاب بـ ${product.name}` : `أعجبني ${product.name}`}
                  aria-pressed={liked}
                  className="flex items-center gap-1 text-neutral-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] justify-center"
                >
                  <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : ''} strokeWidth={1.8} aria-hidden="true" />
                  {likeCount > 0 && <span className="text-xs text-neutral-500 dark:text-neutral-400">{likeCount}</span>}
                </button>

                <button
                  onClick={handleComment}
                  aria-label={showComments ? 'إخفاء التعليقات' : 'إظهار التعليقات'}
                  aria-expanded={showComments}
                  className={`flex items-center gap-1 transition-colors min-h-[44px] min-w-[44px] justify-center ${showComments ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
                >
                  <MessageCircle size={18} strokeWidth={1.8} aria-hidden="true" />
                  {comments.length > 0 && <span className="text-xs text-neutral-500 dark:text-neutral-400">{comments.length}</span>}
                </button>

                <button
                  onClick={handleShare}
                  aria-label={`مشاركة ${product.name}`}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Share2 size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if (reported) return
                    if (!userId) { toast.error('يجب تسجيل الدخول'); return }
                    setShowReportMenu(true)
                  }}
                  disabled={reported}
                  aria-label={reported ? 'تم الإبلاغ عن هذا المنتج' : `الإبلاغ عن ${product.name}`}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${reported ? 'bg-red-50 dark:bg-red-900/20 cursor-not-allowed' : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'}`}
                >
                  <Flag size={13} className={reported ? 'text-red-400 fill-red-400' : 'text-neutral-400 dark:text-neutral-500'} strokeWidth={1.8} aria-hidden="true" />
                </button>

                <div
                  className="flex items-center gap-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold px-3 py-1.5 rounded-xl"
                  aria-hidden="true"
                >
                  <ShoppingCart size={13} aria-hidden="true" />
                  شراء
                </div>
              </div>
            </div>

            {/* Seller */}
            {product.profiles && (
              <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-neutral-50 dark:border-neutral-800">
                <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden" aria-hidden="true">
                  {product.profiles.store_image
                    ? <Image src={product.profiles.store_image} alt="" width={20} height={20} className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-neutral-500">{product.profiles.store_name?.charAt(0) || 'W'}</div>
                  }
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {product.profiles.store_name || 'متجر'}
                </span>
                {product.profiles.verified && (
                  <ShieldCheck size={11} className="text-blue-500 shrink-0" aria-label="متجر موثق" />
                )}
              </div>
            )}
          </div>
        </article>
      </Link>

      {/* Report Modal */}
      {showReportMenu && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="الإبلاغ عن منتج"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowReportMenu(false) }}
        >
          <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-neutral-900 dark:text-white">الإبلاغ عن منتج</h3>
              <button
                onClick={() => setShowReportMenu(false)}
                aria-label="إغلاق نافذة الإبلاغ"
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X size={16} className="text-neutral-500" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 truncate">{product.name}</p>
            <div className="space-y-2 mb-4" role="radiogroup" aria-label="سبب الإبلاغ">
              {REPORT_REASONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedReason(key)}
                  role="radio"
                  aria-checked={selectedReason === key}
                  className={`w-full text-right px-4 py-2.5 rounded-xl text-sm transition-colors ${selectedReason === key ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium' : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <textarea
              value={reportDetails}
              onChange={e => setReportDetails(e.target.value)}
              placeholder="تفاصيل إضافية (اختياري)..."
              aria-label="تفاصيل إضافية للبلاغ"
              className="w-full px-3 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none resize-none text-neutral-900 dark:text-white placeholder-neutral-400 mb-4"
              rows={2}
            />
            <button
              onClick={submitReport}
              disabled={!selectedReason}
              className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl disabled:opacity-40 hover:bg-red-700 text-sm transition-colors"
            >
              إرسال البلاغ
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      {showComments && (
        <div
          className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl mt-1 overflow-hidden"
          aria-label="التعليقات"
          role="region"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
            <span className="text-sm font-medium text-neutral-900 dark:text-white">التعليقات</span>
            <button
              onClick={() => setShowComments(false)}
              aria-label="إغلاق التعليقات"
              className="text-neutral-400 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto" role="list" aria-label="قائمة التعليقات">
            {comments.length === 0
              ? <p className="text-center text-neutral-500 text-xs py-6">لا توجد تعليقات — كن أول من يعلق!</p>
              : comments.map(c => (
                <div key={c.id} className="px-4 py-2.5 border-b border-neutral-50 dark:border-neutral-800 last:border-0" role="listitem">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[8px] font-bold text-neutral-500" aria-hidden="true">
                      {(c.profiles?.store_name || c.profiles?.full_name || 'W').charAt(0)}
                    </div>
                    <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                      {c.profiles?.store_name || c.profiles?.full_name || 'مستخدم'}
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 ms-auto">
                      {new Date(c.created_at).toLocaleDateString('ar-MA')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 me-7">{c.content}</p>
                </div>
              ))
            }
          </div>
          {userId ? (
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-neutral-50 dark:border-neutral-800">
              <label htmlFor={`comment-input-${product.id}`} className="sr-only">اكتب تعليقاً</label>
              <input
                id={`comment-input-${product.id}`}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="اكتب تعليقاً..."
                className="flex-1 text-sm bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2 outline-none border border-neutral-100 dark:border-neutral-700 focus:border-neutral-300 text-neutral-900 dark:text-white placeholder-neutral-400"
                onKeyDown={e => e.key === 'Enter' && submitComment(e)}
                aria-label="اكتب تعليقاً"
              />
              <button
                onClick={submitComment}
                disabled={!newComment.trim() || commentLoading}
                aria-label="إرسال التعليق"
                className="w-9 h-9 bg-neutral-900 dark:bg-white rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity"
              >
                <Send size={14} className="text-white dark:text-neutral-900" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <p className="text-center text-xs text-neutral-500 py-3">
              <Link href="/auth/login" className="text-neutral-700 dark:text-neutral-300 underline">سجل دخول</Link> لتعليق
            </p>
          )}
        </div>
      )}
    </div>
  )
}