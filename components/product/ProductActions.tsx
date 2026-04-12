'use client'
import { useState } from 'react'
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
  const [wishlisted, setWishlisted] = useState(isWishlisted)
  const [loadingWishlist, setLoadingWishlist] = useState(false)

  async function handleWishlist() {
    if (!userId) { window.location.href = '/ar/auth/login'; return }
    setLoadingWishlist(true)
    const supabase = createClient()
    if (wishlisted) {
      await supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', product.id)
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
    window.location.href = '/ar/purchases'
  }

  return (
    <>
      <div className="h-28" />
      <div
        className="bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800"
        style={{
          position: 'fixed',
          top: 'auto',
          bottom: '64px',
          left: '0',
          right: '0',
          zIndex: 40,
          padding: '10px 16px',
          direction: 'ltr',
          WebkitTransform: 'translate3d(0,0,0)',
          transform: 'translate3d(0,0,0)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>

          {/* زر الشراء */}
          {hasPurchased ? (
            <button
              onClick={handleDownload}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 12px',
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '16px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                minWidth: 0,
              }}
            >
              <Download size={18} />
              تحميل المنتج
            </button>
          ) : (
            <button
              onClick={handleBuy}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 12px',
                backgroundColor: '#171717',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '16px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                minWidth: 0,
              }}
            >
              <ShoppingBag size={18} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                شراء — ${product.price}
              </span>
            </button>
          )}

          {/* Demo */}
          {product.demoUrl && (
            <a
              href={product.demoUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                border: '1px solid #e5e5e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                textDecoration: 'none',
              }}
            >
              <Eye size={20} color="#737373" />
            </a>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={loadingWishlist}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              border: wishlisted ? '1px solid #fecaca' : '1px solid #e5e5e5',
              backgroundColor: wishlisted ? '#fff1f2' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            <Heart size={20} color={wishlisted ? '#ef4444' : '#737373'} fill={wishlisted ? '#ef4444' : 'none'} />
          </button>

        </div>

        {!hasPurchased && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '6px' }}>
            {['دفعة واحدة', 'وصول دائم', 'بدون اشتراك'].map(item => (
              <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#a3a3a3' }}>
                <Check size={10} color="#22c55e" />
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}