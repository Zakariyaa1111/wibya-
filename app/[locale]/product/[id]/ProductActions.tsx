'use client'
import { MessageCircle, ShoppingCart } from 'lucide-react'
import { useRouter } from '@/lib/i18n/navigation'

interface Props {
  product: { id: string; seller_id: string; price: number; name: string }
  locale: string
}

export function ProductActions({ product, locale }: Props) {
  const router = useRouter()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 p-4 pb-safe">
      <div className="flex gap-3 max-w-lg mx-auto">
        {/* زر الرسائل — يروح لصفحة /messages */}
        <button
          onClick={() => router.push(`/messages?seller=${product.seller_id}&product=${product.id}`)}
          className="flex items-center justify-center gap-2 px-4 py-3.5 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium text-sm shrink-0"
        >
          <MessageCircle size={18} />
          <span>{locale === 'ar' ? 'رسالة' : 'Message'}</span>
        </button>

        {/* زر الطلب — يروح لصفحة /checkout */}
        <button
          onClick={() => router.push(`/checkout?product=${product.id}`)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-base rounded-2xl hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <ShoppingCart size={18} />
          {locale === 'ar' ? 'اطلب الآن' : 'Commander'}
        </button>
      </div>
    </div>
  )
}