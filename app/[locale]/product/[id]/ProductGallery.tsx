'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props { images: string[]; name: string }

export function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)
  const list = images.length > 0 ? images : ['/placeholder.jpg']

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-square bg-neutral-100 overflow-hidden">
        <Image
          src={list[active]}
          alt={name}
          fill
          className="object-cover transition-opacity duration-200"
          sizes="100vw"
          priority
        />
        {/* Dots */}
        {list.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === active ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === active ? 'border-neutral-900' : 'border-transparent'
              }`}
            >
              <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
