'use client'
import Image from 'next/image'
import { Phone, MessageCircle, MapPin, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import type { Database } from '@/lib/supabase/types'

type Ad = Database['public']['Tables']['ads']['Row'] & {
  profiles?: { full_name: string | null; verified: boolean }
}

export function AdCard({ ad, index = 0 }: { ad: Ad; index?: number }) {
  const t = useTranslations('ad')
  const mainImage = ad.images?.[0] ?? '/placeholder.jpg'

  return (
    <Link href={`/ad/${ad.id}`}>
      <article
        className="feed-card border-2 border-brand-100 animate-fade-up"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Sponsored badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-950 border-b border-neutral-800">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          <span className="text-[11px] font-semibold text-white tracking-wide uppercase">
            {t('sponsored')}
          </span>
        </div>

        {/* Image */}
        <div className="relative aspect-[4/3] bg-neutral-100">
          <Image
            src={mainImage}
            alt={ad.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {ad.is_vip && (
            <div className="absolute top-3 end-3">
              <span className="badge bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                VIP
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-neutral-900 text-sm line-clamp-2 mb-1.5">
            {ad.title}
          </h3>

          <div className="flex items-center justify-between mb-3">
            {ad.price ? (
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-neutral-900 text-base">
                  {ad.price.toLocaleString()}
                </span>
                <span className="text-neutral-500 text-xs">د.م.</span>
                {ad.price_negotiable && (
                  <span className="text-neutral-400 text-[11px]">(قابل للتفاوض)</span>
                )}
              </div>
            ) : (
              <span className="text-neutral-500 text-sm">اتصل للسعر</span>
            )}

            {ad.city && (
              <div className="flex items-center gap-1 text-neutral-400">
                <MapPin size={11} />
                <span className="text-[11px]">{ad.city}</span>
              </div>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex gap-2">
            {ad.whatsapp && (
              <a
                href={`https://wa.me/212${ad.whatsapp.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500 text-white text-xs font-semibold"
              >
                <MessageCircle size={13} />
                واتساب
              </a>
            )}
            {ad.phone && (
              <a
                href={`tel:${ad.phone}`}
                onClick={e => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
              >
                <Phone size={13} />
                اتصل
              </a>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
