'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { useRouter } from '@/lib/i18n/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
      setProducts(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function deleteProduct(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    toast.success('تم حذف المنتج')
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const statusLabel: Record<string, { label: string; color: string }> = {
    active: { label: 'نشط', color: 'bg-green-50 text-green-600' },
    pending: { label: 'قيد المراجعة', color: 'bg-amber-50 text-amber-600' },
    rejected: { label: 'مرفوض', color: 'bg-red-50 text-red-600' },
    sold: { label: 'مباع', color: 'bg-neutral-100 text-neutral-500' },
  }

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900">منتجاتي</h1>
        <Link href="/seller/products/new" className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <Plus size={16} /> إضافة منتج
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm mb-4">لا توجد منتجات بعد</p>
          <Link href="/seller/products/new" className="btn-primary px-6 py-2.5 text-sm">إضافة أول منتج</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => {
            const s = statusLabel[p.status] ?? { label: p.status, color: 'bg-neutral-100 text-neutral-500' }
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-neutral-100 p-4 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt={p.name} width={56} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-neutral-300" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-neutral-900 truncate">{p.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{p.price?.toLocaleString()} د.م.</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                    <span className="text-[10px] text-neutral-300">{new Date(p.created_at).toLocaleDateString('ar-MA')}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/product/${p.id}`} className="w-8 h-8 bg-neutral-100 rounded-xl flex items-center justify-center hover:bg-neutral-200 transition-colors">
                    <Eye size={14} className="text-neutral-500" />
                  </Link>
                  <button onClick={() => deleteProduct(p.id)} className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}