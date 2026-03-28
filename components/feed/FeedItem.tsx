'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, MapPin, ShieldCheck, Flag } from 'lucide-react'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row'] & {
  profiles?: {
    store_name: string | null
    store_image: string | null
    verified: boolean
  }
}

interface FeedItemProps {
  product: Product
  index?: number
}

export function FeedItem({ product, index = 0 }: FeedItemProps) {
  const locale = useLocale()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [reported, setReported] = useState(false)

  const mainImage = product.images?.[0] ?? '/placeholder.jpg'
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: `/${locale}/product/${product.id}`,
      })
    }
  }

  const handleReport = (e: React.MouseEvent) => {
    e.preventDefault()
    if (reported) return
    setReported(true)
  }

  return (
    <Link href={`/product/${product.id}`}>
      <article
        className="feed-card animate-fade-up"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] bg-neutral-100">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Top badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-1.5">
            {product.is_featured && (
              <span className="badge bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                ⭐ مميز
              </span>
            )}
            {discount && discount > 10 && (
              <span className="badge bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                -{discount}%
              </span>
            )}
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-0 start-0 end-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white font-bold text-xl">
                    {product.price.toLocaleString()}
                  </span>
                  <span className="text-white/80 text-sm font-medium">
                    {'د.م.'}
                  </span>
                </div>
                {product.city && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-white/70" />
                    <span className="text-white/80 text-xs">{product.city}</span>
                  </div>
                )}
              </div>
              {product.original_price && (
                <span className="text-white/60 text-sm line-through">
                  {product.original_price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-3">
          <h3 className="font-semibold text-neutral-900 text-sm line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-3">
            <ShieldCheck size={12} className="text-green-500 shrink-0" />
            <span>{'حماية Wibya'}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-neutral-50 pt-2.5">
            <div className="flex items-center gap-3">

              {/* إعجاب */}
              <button
                onClick={handleLike}
                className="flex items-center gap-1 text-neutral-400 hover:text-red-500 transition-colors"
              >
                <Heart
                  size={18}
                  className={liked ? 'fill-red-500 text-red-500' : ''}
                  strokeWidth={1.8}
                />
                {likeCount > 0 && (
                  <span className="text-xs text-neutral-500">{likeCount}</span>
                )}
              </button>

              {/* تعليق */}
              <button
                onClick={handleComment}
                className="flex items-center gap-1 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <MessageCircle size={18} strokeWidth={1.8} />
              </button>

              {/* مشاركة */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <Share2 size={18} strokeWidth={1.8} />
              </button>

              {/* إبلاغ */}
              <button
                onClick={handleReport}
                className={`flex items-center gap-1 transition-colors ${
                  reported
                    ? 'text-red-400 cursor-not-allowed'
                    : 'text-neutral-400 hover:text-red-500'
                }`}
                title={reported ? 'تم الإبلاغ' : 'إبلاغ'}
              >
                <Flag
                  size={16}
                  strokeWidth={1.8}
                  className={reported ? 'fill-red-400 text-red-400' : ''}
                />
              </button>

            </div>

            {/* Seller */}
            {product.profiles && (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-neutral-200 overflow-hidden">
                  {product.profiles.store_image ? (
                    <Image
                      src={product.profiles.store_image}
                      alt=""
                      width={20}
                      height={20}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-neutral-500">
                      {product.profiles.store_name?.charAt(0) || 'W'}
                    </div>
                  )}
                </div>
                {product.profiles.verified && (
                  <ShieldCheck size={12} className="text-blue-500" />
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}