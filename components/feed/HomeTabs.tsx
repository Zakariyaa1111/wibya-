'use client'
import { useState } from 'react'
import { ProductCard } from '@/components/product/ProductCard'

interface Props {
  newest: any[]
  topSelling: any[]
}

const TABS = [
  { key: 'newest', label: '🆕 الأحدث' },
  { key: 'top', label: '🔥 الأكثر مبيعاً' },
] as const

export function HomeTabs({ newest, topSelling }: Props) {
  const [active, setActive] = useState<'newest' | 'top'>('newest')
  const products = active === 'newest' ? newest : topSelling

  return (
    <section className="px-4" aria-labelledby="products-tabs">
      <div className="flex gap-2 mb-4" role="tablist" aria-label="تصنيف المنتجات">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            role="tab"
            aria-selected={active === tab.key}
            aria-controls={`panel-${tab.key}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active === tab.key
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`panel-${active}`}
        role="tabpanel"
        className="grid grid-cols-2 gap-3"
      >
        {products.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-neutral-400 text-sm">
            لا توجد منتجات بعد
          </div>
        ) : (
          products.map(product => (
            <ProductCard key={product.id} product={product as any} />
          ))
        )}
      </div>
    </section>
  )
}

export { HomeTabs as FeedTabs }