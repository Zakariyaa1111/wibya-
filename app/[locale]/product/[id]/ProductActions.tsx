'use client'
import { useState } from 'react'
import { MessageCircle, ShoppingCart, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import toast from 'react-hot-toast'

interface Props {
  product: { id: string; seller_id: string; price: number; name: string }
  locale: string
}

export function ProductActions({ product, locale }: Props) {
  const [ordering, setOrdering] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const router = useRouter()

  async function handleOrder() {
    setOrdering(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      setOrdering(false)
      return
    }
    const { error } = await supabase.from('orders').insert({
      buyer_id: user.id,
      seller_id: product.seller_id,
      product_id: product.id,
      quantity: 1,
      total: product.price,
      status: 'pending',
      payment_method: 'cod',
    })
    if (error) {
      toast.error(locale === 'ar' ? 'حدث خطأ' : 'Une erreur est survenue')
    } else {
      setOrdered(true)
      toast.success(locale === 'ar' ? '✅ تم تأكيد الطلب!' : '✅ Commande confirmée!')
    }
    setOrdering(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-neutral-100 p-4 pb-safe">
      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/messages?seller=${product.seller_id}&product=${product.id}`)}
          className="btn-outline flex-none px-4"
        >
          <MessageCircle size={18} />
        </button>
        <button
          onClick={handleOrder}
          disabled={ordering || ordered}
          className={`btn flex-1 py-3.5 font-bold text-base rounded-2xl transition-all ${
            ordered
              ? 'bg-green-500 text-white'
              : 'bg-neutral-900 text-white hover:bg-neutral-800'
          }`}
        >
          {ordered ? (
            <><Check size={18} /> {locale === 'ar' ? 'تم الطلب' : 'Commandé'}</>
          ) : ordering ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><ShoppingCart size={18} /> {locale === 'ar' ? 'اطلب الآن' : 'Commander'}</>
          )}
        </button>
      </div>
    </div>
  )
}
