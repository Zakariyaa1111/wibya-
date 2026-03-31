import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/lib/i18n/navigation'
import {
  ArrowRight, ShieldCheck, MapPin, Package,
  Heart, Share2, Flag, Store
} from 'lucide-react'
import { ProductActions } from './ProductActions'
import { ProductGallery } from './ProductGallery'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('name,description').eq('id', id).single<{ name: string; description: string }>()
  return {
    title: data?.name ?? 'منتج',
    description: data?.description ?? '',
  }
}

export default async function ProductPage({ params }: Props) {
  const { id, locale } = await params
  const t = await getTranslations('product')
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`*, profiles(id, store_name, store_image, city, verified, is_premium, total_sales)`)
    .eq('id', id)
    .single<any>()

  if (!product) notFound()

  await supabase.from('products').update({ views_count: (product.views_count ?? 0) + 1 } as any).eq('id', id)

  const { data: similar } = await supabase
    .from('products')
    .select('id, name, price, images, city')
    .eq('category', product.category)
    .eq('status', 'active')
    .neq('id', id)
    .limit(6)
    .returns<any[]>()

  const images: string[] = Array.isArray(product.images) ? product.images as string[] : []
  const seller = product.profiles as any

  const conditionMap: Record<string, string> = {
    new: locale === 'ar' ? 'جديد' : 'Neuf',
    used: locale === 'ar' ? 'مستعمل' : 'Occasion',
    refurbished: locale === 'ar' ? 'مُجدَّد' : 'Reconditionné',
  }
  const conditionLabel = conditionMap[product.condition] ?? product.condition

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800">
        <Link href="/" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <ArrowRight size={20} className="text-neutral-700 dark:text-neutral-300 rotate-180" />
        </Link>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Heart size={20} className="text-neutral-500 dark:text-neutral-400" strokeWidth={1.8} />
          </button>
          <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Share2 size={20} className="text-neutral-500 dark:text-neutral-400" strokeWidth={1.8} />
          </button>
          <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Flag size={20} className="text-neutral-400 dark:text-neutral-500" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <ProductGallery images={images} name={product.name} />

      <div className="px-4 pt-5 pb-32">

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`badge ${product.condition === 'new' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
            {conditionLabel}
          </span>
          {product.is_featured && <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">⭐ مميز</span>}
          {product.city && (
            <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
              <MapPin size={11} />{product.city}
            </span>
          )}
        </div>

        {/* Name */}
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-snug mb-3">{product.name}</h1>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-neutral-900 dark:text-white">{product.price.toLocaleString()}</span>
          <span className="text-neutral-500 dark:text-neutral-400 font-medium">{locale === 'ar' ? 'د.م.' : 'DH'}</span>
          {product.original_price && product.original_price > product.price && (
            <>
              <span className="text-neutral-400 line-through text-base">{product.original_price.toLocaleString()}</span>
              <span className="badge bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs">
                -{Math.round((1 - product.price / product.original_price) * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Protection */}
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-3 mb-5">
          <ShieldCheck size={20} className="text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              {locale === 'ar' ? 'حماية Wibya' : 'Protection Wibya'}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">
              {locale === 'ar' ? 'فحص خلال 24 ساعة · الدفع عند الاستلام' : 'Vérification sous 24h · Paiement à la livraison'}
            </p>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mb-5">
            <h2 className="font-semibold text-neutral-900 dark:text-white mb-2 text-sm">
              {locale === 'ar' ? 'الوصف' : 'Description'}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-4 mb-5 space-y-3">
          {[
            { label: locale === 'ar' ? 'الفئة' : 'Catégorie', value: product.category ?? '—' },
            { label: locale === 'ar' ? 'الكمية' : 'Quantité', value: product.quantity },
            { label: locale === 'ar' ? 'المشاهدات' : 'Vues', value: (product.views_count ?? 0) + 1 },
            { label: locale === 'ar' ? 'الدفع' : 'Paiement', value: locale === 'ar' ? 'عند الاستلام' : 'À la livraison' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{value}</span>
            </div>
          ))}
        </div>

        {/* Seller card — ✅ إصلاح: يروح لصفحة المتاجر */}
        {seller && (
          <Link href={`/stores`}>
            <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 mb-5 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                {seller.store_image ? (
                  <Image src={seller.store_image} alt="" width={48} height={48} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500 text-lg">
                    {seller.store_name?.charAt(0) || 'W'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-900 dark:text-white text-sm truncate">
                    {seller.store_name ?? 'متجر'}
                  </span>
                  {seller.verified && <ShieldCheck size={14} className="text-blue-500 shrink-0" />}
                  {seller.is_premium && <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full">⭐</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {seller.city && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                      <MapPin size={10} />{seller.city}
                    </span>
                  )}
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {seller.total_sales?.toLocaleString() ?? 0} {locale === 'ar' ? 'مبيعة' : 'ventes'}
                  </span>
                </div>
              </div>
              <Store size={16} className="text-neutral-400 shrink-0" />
            </div>
          </Link>
        )}

        {/* Similar products */}
        {similar && similar.length > 0 && (
          <div>
            <h2 className="font-semibold text-neutral-900 dark:text-white mb-3 text-sm">
              {locale === 'ar' ? 'منتجات مشابهة' : 'Produits similaires'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {similar.map(p => (
                <Link key={p.id} href={`/product/${p.id}`}>
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800">
                    <div className="aspect-square relative bg-neutral-100 dark:bg-neutral-800">
                      {(p.images as string[])?.[0] && (
                        <Image src={(p.images as string[])[0]} alt={p.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 line-clamp-1">{p.name}</p>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                        {p.price.toLocaleString()} {locale === 'ar' ? 'د.م.' : 'DH'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProductActions product={product as any} locale={locale} />
    </div>
  )
}