'use client'
import Image from 'next/image'
import { MapPin, Phone, Tag, Megaphone } from 'lucide-react'
import { useRouter } from '@/lib/i18n/navigation'

interface AdCardProps {
  ad: {
    id: string
    title: string
    headline?: string
    description?: string
    price?: number
    city?: string
    phone?: string
    images?: string[]
    category?: string
    is_vip?: boolean
  }
  index?: number
}

export function AdCard({ ad, index = 0 }: AdCardProps) {
  const router = useRouter()
  const image = ad.images?.[0]

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
      {/* Ad badge */}
      <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
        <Megaphone size={12} className="text-neutral-400" />
        <span className="text-[10px] text-neutral-400 font-medium">إعلان</span>
        {ad.is_vip && (
          <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium ms-1">VIP</span>
        )}
      </div>

      {/* Image */}
      {image && (
        <div className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden mx-0">
          <Image src={image} alt={ad.title} fill className="object-cover" sizes="100vw" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-neutral-900 dark:text-white text-base leading-snug mb-1">{ad.title}</h3>
        {(ad.headline || ad.description) && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
            {ad.headline || ad.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
          {ad.price && (
            <span className="flex items-center gap-1 font-bold text-neutral-900 dark:text-white text-sm">
              <Tag size={12} />
              {ad.price.toLocaleString()} د.م.
            </span>
          )}
          {ad.city && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {ad.city}
            </span>
          )}
          {ad.category && (
            <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
              {ad.category}
            </span>
          )}
        </div>

        {ad.phone && (
          <a href={`tel:${ad.phone}`}
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl text-sm font-semibold">
            <Phone size={15} />
            اتصل الآن
          </a>
        )}
      </div>
    </div>
  )
}