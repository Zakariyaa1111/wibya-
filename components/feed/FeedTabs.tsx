'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

const TABS = ['forYou', 'new', 'nearby', 'trending'] as const

interface FeedTabsProps {
  onChange?: (tab: typeof TABS[number]) => void
}

export function FeedTabs({ onChange }: FeedTabsProps) {
  const t = useTranslations('feed')
  const [active, setActive] = useState<typeof TABS[number]>('forYou')

  return (
    <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => { setActive(tab); onChange?.(tab) }}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
            active === tab
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
          }`}
        >
          {t(tab)}
        </button>
      ))}
    </div>
  )
}
