'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ProductCard } from '@/components/product/ProductCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('wishlist')
        .select('digital_products(id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles(full_name, store_name, is_verified))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const items = data?.map((w: any) => w.digital_products).filter(Boolean) ?? []
      setProducts(items)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-4 px-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <Heart size={20} className="text-red-500" aria-hidden="true" />
          المحفوظات
        </h1>

        {products.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-10 text-center">
            <Heart size={40} className="text-neutral-300 mx-auto mb-3" aria-hidden="true" />
            <p className="font-semibold text-neutral-900 dark:text-white mb-1">لا توجد منتجات محفوظة</p>
            <p className="text-neutral-400 text-sm mb-4">احفظ المنتجات التي تعجبك لتجدها هنا</p>
            <Link href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl text-sm">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map(product => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}