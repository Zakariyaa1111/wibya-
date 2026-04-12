'use client'
import { useState } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Heart, Eye, Download, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  product: {
    id: string
    title: string
    price: number
    originalPrice?: number | null
    developerId: string
    demoUrl?: string | null
  }
  hasPurchased: boolean
  isWishlisted: boolean
  userId?: string
}

export function ProductActions({ product, hasPurchased, isWishlisted, userId }: Props) {
  const router = useRouter()
  const [wishlisted, setWishlisted] = useState(isWishlisted)
  const [loadingWishlist, setLoadingWishlist] = useState(false)

  async function handleWishlist() {
    if (!userId) { window.location.href = '/ar/auth/login'; return }
    setLoadingWishlist(true)
    const supabase = createClient()

    if (wishlisted) {
      await supabase.from('wishlist').delete()
        .eq('user_id', userId).eq('product_id', product.id)
      setWishlisted(false)
      toast.success('تم الإزالة من المحفوظات')
    } else {
      await supabase.from('wishlist').insert({ user_id: userId, product_id: product.id })
      setWishlisted(true)
      toast.success('تم الحفظ ❤️')
    }
    setLoadingWishlist(false)
  }

  function handleBuy() {
    if (!userId) { window.location.href = '/ar/auth/login'; return }
    window.location.href = `/ar/checkout?product=${product.id}`
  }

  function handleDownload() {
    router.push(`/purchases`)
  }

  return (
    <div className="fixed bottom-16 start-0 end-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 p-4 z-40">
      <div className="max-w-2xl mx-auto flex gap-3">
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          disabled={loadingWishlist}
          aria-label={wishlisted ? 'إزالة من المحفوظات' : 'حفظ للاحقاً'}
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors shrink-0 ${
            wishlisted
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <Heart
            size={20}
            className={wishlisted ? 'text-red-500 fill-red-500' : 'text-neutral-500'}
            aria-hidden="true"
          />
        </button>

        {/* Demo */}
        {product.demoUrl && (
          <a
            href={product.demoUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="مشاهدة Demo"
            className="w-12 h-12 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shrink-0"
          >
            <Eye size={20} className="text-neutral-500" aria-hidden="true" />
          </a>
        )}

        {/* Main CTA */}
        {hasPurchased ? (
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 text-white font-bold rounded-2xl text-sm hover:bg-green-700 transition-colors"
          >
            <Download size={18} aria-hidden="true" />
            تحميل المنتج
          </button>
        ) : (
          <button
            onClick={handleBuy}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl text-sm hover:opacity-90 transition-opacity"
          >
            <ShoppingBag size={18} aria-hidden="true" />
            شراء الآن — ${product.price}
          </button>
        )}
      </div>

      {!hasPurchased && (
        <div className="max-w-2xl mx-auto mt-2 flex items-center justify-center gap-4">
          {[
            'دفعة واحدة',
            'وصول دائم',
            'بدون اشتراك',
          ].map(item => (
            <span key={item} className="flex items-center gap-1 text-[10px] text-neutral-400">
              <Check size={10} className="text-green-500" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}