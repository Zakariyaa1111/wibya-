'use client'
import { useCart } from '@/lib/cart/CartContext'
import { useRouter } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function CartPage() {
  const { items, removeItem, total, clearCart } = useCart()
  const router = useRouter()

  if (items.length === 0) return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <ShoppingBag size={48} className="text-neutral-300 dark:text-neutral-700 mb-4" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">السلة فارغة</h2>
        <p className="text-neutral-400 text-sm mb-6">أضف منتجات لتتمكن من الطلب</p>
        <button onClick={() => router.push('/')}
          className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-2xl text-sm">
          تصفح المنتجات
        </button>
      </div>
      <BottomNav />
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-36 pt-4 px-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">السلة ({items.length})</h1>
          <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-600">مسح الكل</button>
        </div>

        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div key={item.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                {item.image
                  ? <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover w-full h-full" />
                  : <ShoppingBag size={20} className="text-neutral-300 m-auto mt-5" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{item.seller_name}</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white mt-1">{(item.price * item.quantity).toLocaleString()} د.م.</p>
              </div>
              <button onClick={() => removeItem(item.id)}
                className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-400">المجموع الفرعي</span>
            <span className="text-neutral-900 dark:text-white">{total.toLocaleString()} د.م.</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-neutral-400">التوصيل</span>
            <span className="text-green-600">مجاناً</span>
          </div>
          <div className="flex justify-between font-bold border-t border-neutral-100 dark:border-neutral-800 pt-3">
            <span className="text-neutral-900 dark:text-white">المجموع</span>
            <span className="text-neutral-900 dark:text-white">{total.toLocaleString()} د.م.</span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-16 start-0 end-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 p-4">
        <button onClick={() => router.push(`/checkout?cart=1`)}
          className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl text-base flex items-center justify-center gap-2">
          <ShoppingBag size={18} />
          إتمام الطلب — {total.toLocaleString()} د.م.
        </button>
      </div>
      <BottomNav />
    </div>
  )
}