import { Link } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { Shield, Star, Download, BadgeCheck, Package } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    title: string
    price: number
    original_price?: number | null
    preview_images?: string[] | null
    category?: string | null
    average_rating?: number | null
    sales_count?: number | null
    quality_badge?: boolean | null
    claude_score?: number | null
    profiles?: { full_name?: string | null; store_name?: string | null; verified?: boolean | null } | { full_name?: string | null; store_name?: string | null; verified?: boolean | null }[] | null
  }
  featured?: boolean
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  // ✅ يتعامل مع profiles كـ object أو array
  const developer = Array.isArray(product.profiles)
    ? product.profiles[0]
    : product.profiles

  const developerName = developer?.store_name || developer?.full_name || 'مطور'

  return (
    <Link href={`/product/${product.id}`} aria-label={`${product.title} — $${product.price}`}>
      <article className={`bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-600 transition-all hover:shadow-sm ${featured ? 'flex gap-3 p-3' : ''}`}>

        {/* Image */}
        <div className={`relative bg-neutral-100 dark:bg-neutral-800 overflow-hidden ${featured ? 'w-24 h-24 rounded-xl shrink-0' : 'aspect-video w-full'}`}>
          {product.preview_images?.[0] ? (
            <Image
              src={product.preview_images[0]}
              alt={product.title}
              fill
              className="object-cover"
              sizes={featured ? '96px' : '(max-width: 768px) 100vw, 50vw'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={featured ? 20 : 28} className="text-neutral-300" aria-hidden="true" />
            </div>
          )}

          {!featured && (
            <div className="absolute top-2 start-2 flex flex-col gap-1">
              {product.quality_badge && (
                <span className="flex items-center gap-1 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  <Shield size={9} aria-hidden="true" /> Wibya
                </span>
              )}
              {discount && discount > 0 && (
                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`${featured ? 'flex-1 min-w-0' : 'p-3'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{product.category}</span>
            {featured && product.quality_badge && (
              <span className="flex items-center gap-0.5 text-[9px] text-green-600 dark:text-green-400 font-medium">
                <Shield size={9} aria-hidden="true" /> مفحوص
              </span>
            )}
          </div>

          <h3 className={`font-semibold text-neutral-900 dark:text-white leading-snug ${featured ? 'text-sm line-clamp-2' : 'text-xs line-clamp-2 mb-2'}`}>
            {product.title}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            <span className="text-[10px] text-neutral-400 truncate">{developerName}</span>
            {developer?.verified && (
              <BadgeCheck size={11} className="text-blue-500 shrink-0" aria-label="موثق" />
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            {product.average_rating != null && product.average_rating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star size={11} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                <span className="text-[10px] text-neutral-500">{product.average_rating.toFixed(1)}</span>
              </div>
            )}
            {product.sales_count != null && product.sales_count > 0 && (
              <div className="flex items-center gap-0.5">
                <Download size={10} className="text-neutral-400" aria-hidden="true" />
                <span className="text-[10px] text-neutral-400">{product.sales_count}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-white text-sm">
              ${product.price}
            </span>
            {product.original_price && (
              <span className="text-xs text-neutral-400 line-through">
                ${product.original_price}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}