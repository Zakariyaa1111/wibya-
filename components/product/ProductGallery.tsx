'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Package } from 'lucide-react'

interface Props {
  images: string[]
  title: string
  videoUrl?: string | null
}

export function ProductGallery({ images, title, videoUrl }: Props) {
  const [current, setCurrent] = useState(0)
  const [showVideo, setShowVideo] = useState(false)

  const allItems = videoUrl
    ? ['video', ...images]
    : images

  if (allItems.length === 0) {
    return (
      <div className="w-full aspect-video bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <Package size={48} className="text-neutral-300" aria-hidden="true" />
      </div>
    )
  }

  const currentItem = allItems[current]
  const isVideo = currentItem === 'video'

  function getYouTubeId(url: string) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/)
    return match ? match[1] : null
  }

  return (
    <div className="relative">
      {/* Main Display */}
      <div className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        {isVideo && videoUrl ? (
          <>
            {showVideo ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="فيديو المنتج"
              />
            ) : (
              <button
                className="w-full h-full flex flex-col items-center justify-center gap-3 bg-neutral-900"
                onClick={() => setShowVideo(true)}
                aria-label="تشغيل الفيديو"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Play size={28} className="text-white ms-1" aria-hidden="true" />
                </div>
                <p className="text-white/70 text-sm">مشاهدة الفيديو التعريفي</p>
              </button>
            )}
          </>
        ) : (
          currentItem && (
            <Image
              src={currentItem}
              alt={`${title} — صورة ${current + 1}`}
              fill
              className="object-cover"
              priority={current === 0}
              sizes="100vw"
            />
          )
        )}

        {/* Navigation Arrows */}
        {allItems.length > 1 && (
          <>
            <button
              onClick={() => setCurrent(p => (p - 1 + allItems.length) % allItems.length)}
              className="absolute start-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="الصورة السابقة"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            <button
              onClick={() => setCurrent(p => (p + 1) % allItems.length)}
              className="absolute end-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="الصورة التالية"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
          </>
        )}

        {/* Counter */}
        {allItems.length > 1 && (
          <div className="absolute bottom-3 end-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {current + 1}/{allItems.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allItems.length > 1 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {allItems.map((item, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setShowVideo(false) }}
              className={`relative shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-colors ${
                current === i ? 'border-neutral-900 dark:border-white' : 'border-transparent'
              }`}
              aria-label={item === 'video' ? 'الفيديو' : `الصورة ${i + 1}`}
              aria-current={current === i}
            >
              {item === 'video' ? (
                <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                  <Play size={16} className="text-white" aria-hidden="true" />
                </div>
              ) : (
                <Image src={item} alt={`مصغرة ${i}`} fill className="object-cover" sizes="64px" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}