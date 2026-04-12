import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { ProductActions } from '@/components/product/ProductActions'
import { ProductGallery } from '@/components/product/ProductGallery'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import {
  Shield, Star, Download, Clock, Code2,
  CheckCircle, Eye, Tag,
  BadgeCheck, AlertCircle, Package
} from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('digital_products')
    .select('title, description, preview_images')
    .eq('id', id)
    .single()

  if (!product) return { title: 'منتج غير موجود' }

  return {
    title: product.title,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description?.slice(0, 160),
      images: product.preview_images?.[0] ? [product.preview_images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id, locale } = await params
  const supabase = await createClient()

  // جلب المنتج
  const { data: product, error } = await supabase
    .from('digital_products')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (error || !product) notFound()

  // جلب المطور بشكل منفصل
  const { data: developer } = await supabase
    .from('profiles')
    .select('id, full_name, store_name, store_image, bio, verified, total_sales')
    .eq('id', product.developer_id)
    .single()

  // جلب التقييمات بشكل منفصل
  const { data: reviewsData } = await supabase
    .from('product_reviews')
    .select('id, rating, comment, created_at, profiles(full_name, store_name)')
    .eq('product_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // منتجات مشابهة
  const { data: similarProducts } = await supabase
    .from('digital_products')
    .select('id, title, price, preview_images, average_rating, sales_count, quality_badge')
    .eq('category', product.category)
    .eq('status', 'active')
    .neq('id', id)
    .limit(4)

  // تحديث عداد المشاهدات بشكل silent
  supabase
    .from('digital_products')
    .update({ views_count: (product.views_count || 0) + 1 })
    .eq('id', id)
    .then(() => {})

  // هل المستخدم اشترى هذا المنتج؟
  const { data: { user } } = await supabase.auth.getUser()
  let hasPurchased = false
  let isWishlisted = false

  if (user) {
    const [{ data: purchase }, { data: wish }] = await Promise.all([
      supabase.from('purchases')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('product_id', id)
        .in('status', ['completed', 'escrow'])
        .maybeSingle(),
      supabase.from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', id)
        .maybeSingle(),
    ])
    hasPurchased = !!purchase
    isWishlisted = !!wish
  }

  const reviews = reviewsData ?? []
  const isAr = (locale || 'ar') === 'ar'
  const title = isAr ? product.title : (product.title_fr || product.title)
  const description = isAr ? product.description : (product.description_fr || product.description)
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <div className="max-w-2xl mx-auto pb-36">

        {/* Gallery */}
        <ProductGallery
          images={product.preview_images ?? []}
          title={title}
          videoUrl={product.preview_video}
        />

        <div className="px-4 py-4 space-y-4">

          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2.5 py-1 rounded-full">
                {product.category}
              </span>
              {product.quality_badge && (
                <span className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-medium">
                  <Shield size={11} aria-hidden="true" />
                  فحص الجودة Wibya
                </span>
              )}
              {discount && discount > 0 && (
                <span className="text-xs bg-red-600 text-white px-2.5 py-1 rounded-full font-bold">
                  -{discount}%
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight mb-2">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              {product.average_rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={13} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{product.average_rating.toFixed(1)}</span>
                  <span>({product.ratings_count || 0} تقييم)</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Download size={13} aria-hidden="true" />
                <span>{product.sales_count || 0} مبيعة</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={13} aria-hidden="true" />
                <span>{product.views_count || 0} مشاهدة</span>
              </div>
              {product.version && (
                <div className="flex items-center gap-1">
                  <Clock size={13} aria-hidden="true" />
                  <span>v{product.version}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                ${product.price}
              </span>
              {product.original_price && (
                <span className="text-lg text-neutral-400 line-through">
                  ${product.original_price}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              دفعة واحدة · وصول دائم · بدون اشتراك
            </p>
          </div>

          {/* Claude Report */}
          {product.claude_report && product.claude_score !== null && (
            <div className={`rounded-2xl border p-4 ${
              product.claude_score >= 70
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : product.claude_score >= 50
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield size={16} className={product.claude_score >= 70 ? 'text-green-600' : product.claude_score >= 50 ? 'text-amber-600' : 'text-red-500'} aria-hidden="true" />
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">تقرير جودة Wibya</span>
                </div>
                <span className={`text-lg font-bold ${product.claude_score >= 70 ? 'text-green-600' : product.claude_score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                  {product.claude_score}/100
                </span>
              </div>
              {(product.claude_report as any).summary && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {(product.claude_report as any).summary}
                </p>
              )}
              {(product.claude_report as any).strengths?.length > 0 && (
                <div className="space-y-1.5">
                  {(product.claude_report as any).strengths.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">{s}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-3">
                * هذا التقرير تحليل جودة تلقائي — ليس ضماناً أمنياً كاملاً
              </p>
            </div>
          )}

          {/* Description */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">وصف المنتج</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Tech Stack */}
          {product.tech_stack?.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                <Code2 size={14} aria-hidden="true" />
                التقنيات المستخدمة
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.tech_stack.map((tech: string) => (
                  <span key={tech} className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-3 py-1.5 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">تفاصيل المنتج</h2>
            <div className="space-y-2.5">
              {([
                product.version ? { label: 'الإصدار', value: `v${product.version}`, icon: Tag } : null,
                { label: 'الدعم', value: product.support_duration ? `${product.support_duration} يوم` : 'بدون دعم', icon: Clock },
                product.tags?.length > 0 ? { label: 'Tags', value: product.tags?.join(', '), icon: Tag } : null,
              ] as any[]).filter(Boolean).map(({ label, value, icon: Icon }: any) => (
                <div key={label} className="flex justify-between items-start text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Icon size={13} aria-hidden="true" />
                    {label}
                  </span>
                  <span className="text-neutral-900 dark:text-white font-medium text-end max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          {product.requirements && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <AlertCircle size={14} aria-hidden="true" />
                المتطلبات
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                {product.requirements}
              </p>
            </div>
          )}

          {/* Installation Guide */}
          {product.installation_guide && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <Package size={14} aria-hidden="true" />
                دليل التثبيت
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line font-mono text-xs bg-neutral-50 dark:bg-neutral-800 p-3 rounded-xl">
                {product.installation_guide}
              </p>
            </div>
          )}

          {/* Demo */}
          {product.demo_url && (
            <a href={product.demo_url} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-2xl text-sm hover:border-neutral-400 transition-colors">
              <Eye size={16} aria-hidden="true" />
              مشاهدة Demo المباشر
            </a>
          )}

          {/* Developer */}
          {developer && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">المطور</h2>
              <Link href={`/developer/${developer.id}`} className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center text-lg font-bold text-neutral-500">
                  {developer.store_image
                    ? <Image src={developer.store_image} alt={developer.store_name || ''} width={48} height={48} className="object-cover w-full h-full" />
                    : (developer.store_name || developer.full_name || 'D').charAt(0)
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white group-hover:underline">
                      {developer.store_name || developer.full_name || 'مطور'}
                    </p>
                    {developer.verified && (
                      <BadgeCheck size={14} className="text-blue-500" aria-label="مطور موثق" />
                    )}
                  </div>
                  {developer.bio && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">{developer.bio}</p>
                  )}
                  <span className="text-xs text-neutral-400">
                    <Download size={11} className="inline me-1" aria-hidden="true" />
                    {developer.total_sales || 0} مبيعة
                  </span>
                </div>
              </Link>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="font-bold text-neutral-900 dark:text-white text-sm">
                  التقييمات ({reviews.length})
                </h2>
                {product.average_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">
                      {product.average_rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              {reviews.slice(0, 5).map((review: any) => (
                <div key={review.id} className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {(review.profiles as any)?.store_name || (review.profiles as any)?.full_name || 'مستخدم'}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={12} className={i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 dark:text-neutral-700'} aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{review.comment}</p>
                  )}
                  <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-1">
                    {new Date(review.created_at).toLocaleDateString('ar-MA')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Similar Products */}
          {similarProducts && similarProducts.length > 0 && (
            <div>
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">منتجات مشابهة</h2>
              <div className="grid grid-cols-2 gap-3">
                {similarProducts.map(p => (
                  <Link key={p.id} href={`/product/${p.id}`}>
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
                      <div className="aspect-video relative bg-neutral-100 dark:bg-neutral-800">
                        {p.preview_images?.[0] ? (
                          <Image src={p.preview_images[0]} alt={p.title} fill className="object-cover" sizes="50vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-neutral-300" aria-hidden="true" />
                          </div>
                        )}
                        {p.quality_badge && (
                          <div className="absolute top-1.5 start-1.5">
                            <Shield size={14} className="text-green-500" aria-label="منتج مفحوص" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-neutral-900 dark:text-white line-clamp-2 mb-1">{p.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">${p.price}</span>
                          {p.average_rating > 0 && (
                            <div className="flex items-center gap-0.5">
                              <Star size={11} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                              <span className="text-[10px] text-neutral-500">{p.average_rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <div dir="ltr">
        <ProductActions
          product={{
            id: product.id,
            title,
            price: product.price,
            originalPrice: product.original_price,
            developerId: product.developer_id,
            demoUrl: product.demo_url,
          }}
          hasPurchased={hasPurchased}
          isWishlisted={isWishlisted}
          userId={user?.id}
        />
      </div>

      <BottomNav />
    </div>
  )
}