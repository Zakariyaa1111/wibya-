'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import Image from 'next/image'
import Link from 'next/link'
import {
  Download, Clock, Shield, Star, Package,
  AlertCircle, CheckCircle, Flag, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('purchases')
        .select(`
          *,
          digital_products (
            id, title, preview_images, category,
            version, quality_badge, developer_id,
            profiles (full_name, store_name)
          ),
          product_reviews (id)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      setPurchases(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleDownload(purchase: any) {
    if (downloading) return
    setDownloading(purchase.id)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      // جلب أو إنشاء رابط تحميل آمن
      const { data: existingLink } = await supabase
        .from('download_links')
        .select('*')
        .eq('purchase_id', purchase.id)
        .eq('buyer_id', user.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .lt('download_count', 3)
        .single()

      let token = existingLink?.token

      if (!token) {
        // إنشاء رابط جديد
        const { data } = await supabase.rpc('generate_download_token', {
          p_purchase_id: purchase.id,
          p_buyer_id: user.id,
        })
        token = data
      }

      if (!token) {
        toast.error('خطأ في إنشاء رابط التحميل')
        setDownloading(null)
        return
      }

      // جلب الملف من Supabase Storage
      const { data: fileData } = await supabase
        .from('product_files')
        .select('file_path, file_name')
        .eq('product_id', purchase.product_id)
        .eq('is_main', true)
        .single()

      if (!fileData) {
        toast.error('الملف غير موجود')
        setDownloading(null)
        return
      }

      // إنشاء Signed URL (صالح لساعة واحدة)
      const { data: signedUrl } = await supabase.storage
        .from('wibya-digital')
        .createSignedUrl(fileData.file_path, 3600)

      if (!signedUrl?.signedUrl) {
        toast.error('خطأ في تحميل الملف')
        setDownloading(null)
        return
      }

      // تحديث عداد التحميل
      await supabase
        .from('download_links')
        .update({ download_count: (existingLink?.download_count || 0) + 1 })
        .eq('purchase_id', purchase.id)
        .eq('buyer_id', user.id)

      // فتح رابط التحميل
      const a = document.createElement('a')
      a.href = signedUrl.signedUrl
      a.download = fileData.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast.success('جاري التحميل...')

    } catch (err) {
      toast.error('خطأ غير متوقع')
      console.error(err)
    }

    setDownloading(null)
  }

  async function submitReview(purchase: any) {
    if (rating === 0) { toast.error('اختر تقييماً'); return }
    setSubmittingReview(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('product_reviews').insert({
      product_id: purchase.product_id,
      buyer_id: user.id,
      purchase_id: purchase.id,
      rating,
      comment: comment.trim() || null,
    })

    if (error) {
      toast.error('خطأ في إرسال التقييم')
    } else {
      toast.success('تم إرسال تقييمك ✅')
      setReviewingId(null)
      setRating(0)
      setComment('')
      // تحديث الـ state
      setPurchases(prev => prev.map(p =>
        p.id === purchase.id
          ? { ...p, product_reviews: [{ id: 'new' }] }
          : p
      ))
    }
    setSubmittingReview(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-4 px-4 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">مشترياتي</h1>

        {purchases.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-8 text-center">
            <Package size={40} className="text-neutral-300 mx-auto mb-3" aria-hidden="true" />
            <p className="font-semibold text-neutral-900 dark:text-white mb-1">لا توجد مشتريات بعد</p>
            <p className="text-neutral-400 text-sm mb-4">ابدأ باستكشاف المنتجات الرقمية</p>
            <Link href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl text-sm">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map(purchase => {
              const product = purchase.digital_products
              const isEscrow = purchase.status === 'escrow'
              const isCompleted = purchase.status === 'completed'
              const hasReview = purchase.product_reviews?.length > 0
              const escrowHours = isEscrow
                ? Math.max(0, Math.ceil((new Date(purchase.escrow_until).getTime() - Date.now()) / 3600000))
                : 0

              return (
                <div key={purchase.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                  {/* Product Info */}
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 relative">
                      {product?.preview_images?.[0] ? (
                        <Image src={product.preview_images[0]} alt={product.title} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-neutral-300" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${product?.id}`}>
                        <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate hover:underline">
                          {product?.title}
                        </p>
                      </Link>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {product?.profiles?.store_name || product?.profiles?.full_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neutral-400">v{product?.version}</span>
                        {product?.quality_badge && (
                          <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
                            <Shield size={10} aria-hidden="true" /> مفحوص
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="font-bold text-sm text-neutral-900 dark:text-white">${purchase.amount?.toFixed(2)}</p>
                      <p className="text-[10px] text-neutral-400">
                        {new Date(purchase.created_at).toLocaleDateString('ar-MA')}
                      </p>
                    </div>
                  </div>

                  {/* Escrow Notice */}
                  {isEscrow && escrowHours > 0 && (
                    <div className="mx-4 mb-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2">
                      <Clock size={14} className="text-amber-500 shrink-0" aria-hidden="true" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        نظام الحماية: متبقي {escrowHours} ساعة قبل تحويل المبلغ للمطور
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-4 pb-4 space-y-2">
                    {/* Download */}
                    <button
                      onClick={() => handleDownload(purchase)}
                      disabled={downloading === purchase.id}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-xl text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                      {downloading === purchase.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-neutral-900/30 dark:border-t-neutral-900 rounded-full animate-spin" />
                      ) : (
                        <Download size={16} aria-hidden="true" />
                      )}
                      {downloading === purchase.id ? 'جاري التحميل...' : 'تحميل المنتج'}
                    </button>

                    {/* Row: Demo + Dispute + Review */}
                    <div className="flex gap-2">
                      {/* فتح نزاع */}
                      {(isEscrow || isCompleted) && (
                        <Link
                          href={`/disputes/new?purchase=${purchase.id}`}
                          className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <Flag size={12} aria-hidden="true" />
                          نزاع
                        </Link>
                      )}

                      {/* تقييم */}
                      {isCompleted && !hasReview && reviewingId !== purchase.id && (
                        <button
                          onClick={() => setReviewingId(purchase.id)}
                          className="flex items-center gap-1.5 px-3 py-2 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 rounded-xl text-xs hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                          <Star size={12} aria-hidden="true" />
                          قيّم
                        </button>
                      )}

                      {hasReview && (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl text-xs">
                          <CheckCircle size={12} aria-hidden="true" />
                          قيّمت
                        </div>
                      )}
                    </div>

                    {/* Review Form */}
                    {reviewingId === purchase.id && (
                      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4 space-y-3">
                        <p className="font-semibold text-sm text-neutral-900 dark:text-white">قيّم المنتج</p>

                        <div className="flex justify-center gap-2">
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              aria-label={`${star} نجوم`}
                              aria-pressed={rating === star}
                            >
                              <Star
                                size={32}
                                className={`transition-colors ${
                                  star <= rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-neutral-300 dark:text-neutral-600'
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          placeholder="شاركنا رأيك في المنتج (اختياري)..."
                          className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 outline-none resize-none"
                          rows={2}
                          aria-label="تعليقك على المنتج"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => submitReview(purchase)}
                            disabled={submittingReview || rating === 0}
                            className="flex-1 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-xl text-sm disabled:opacity-40"
                          >
                            {submittingReview ? '...' : 'إرسال التقييم'}
                          </button>
                          <button
                            onClick={() => { setReviewingId(null); setRating(0); setComment('') }}
                            className="px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl text-sm"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Security Note */}
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                      <Shield size={10} className="text-green-500" aria-hidden="true" />
                      <span>رابط تحميل آمن · صالح 24 ساعة · حد أقصى 3 تحميلات</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}