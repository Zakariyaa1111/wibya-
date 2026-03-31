'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, Plus, Eye, Pencil, Trash2, X, Save } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { useRouter } from '@/lib/i18n/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'

const CATEGORIES = ['إلكترونيات','ملابس وأزياء','أحذية','أثاث ومنزل','سيارات','عقارات','رياضة','ألعاب','أغذية','جمال وعناية','أخرى']
const CITIES = ['الدار البيضاء','الرباط','فاس','مراكش','أكادير','طنجة','مكناس','وجدة','تطوان','سلا','أخرى']

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false })
      setProducts(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function deleteProduct(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { toast.error('خطأ في الحذف'); return }
    toast.success('تم حذف المنتج')
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function startEdit(p: any) {
    setEditingId(p.id)
    setEditData({ name: p.name, price: p.price, original_price: p.original_price || '', category: p.category || '', city: p.city || '', description: p.description || '' })
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('products').update({
      name: editData.name,
      price: parseFloat(editData.price),
      original_price: editData.original_price ? parseFloat(editData.original_price) : null,
      category: editData.category,
      city: editData.city,
      description: editData.description,
      status: 'pending', // إعادة للمراجعة بعد التعديل
    }).eq('id', editingId)
    if (error) { toast.error('خطأ في الحفظ'); setSaving(false); return }
    toast.success('تم حفظ التغييرات — سيُعاد مراجعة المنتج')
    setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...editData, status: 'pending' } : p))
    setEditingId(null)
    setSaving(false)
  }

  const statusLabel: Record<string, { label: string; color: string }> = {
    active: { label: 'نشط', color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
    pending: { label: 'قيد المراجعة', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
    rejected: { label: 'مرفوض', color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
    sold: { label: 'مباع', color: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400' },
  }

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">منتجاتي</h1>
        <Link href="/seller/products/new" className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <Plus size={16} /> إضافة منتج
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />)}</div>
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
            const isEditing = editingId === p.id
            return (
              <div key={p.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                {/* Product row */}
                <div className="flex items-center gap-3 p-4">
                  <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                    {p.images?.[0]
                      ? <Image src={p.images[0]} alt={p.name} width={56} height={56} className="object-cover w-full h-full" />
                      : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-neutral-300" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{p.price?.toLocaleString()} د.م.</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                      <span className="text-[10px] text-neutral-300 dark:text-neutral-600">{new Date(p.created_at).toLocaleDateString('ar-MA')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/product/${p.id}`} className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                      <Eye size={14} className="text-neutral-500 dark:text-neutral-400" />
                    </Link>
                    <button onClick={() => isEditing ? setEditingId(null) : startEdit(p)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isEditing ? 'bg-neutral-200 dark:bg-neutral-700' : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}>
                      {isEditing ? <X size={14} className="text-neutral-500" /> : <Pencil size={14} className="text-blue-500" />}
                    </button>
                    <button onClick={() => deleteProduct(p.id)}
                      className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div className="px-4 pb-4 border-t border-neutral-50 dark:border-neutral-800 pt-3 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">اسم المنتج</label>
                      <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })}
                        className="input text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">السعر (د.م.)</label>
                        <input type="number" value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })}
                          className="input text-sm" dir="ltr" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">السعر الأصلي</label>
                        <input type="number" value={editData.original_price} onChange={e => setEditData({ ...editData, original_price: e.target.value })}
                          className="input text-sm" dir="ltr" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">الفئة</label>
                        <select value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })} className="input text-sm">
                          <option value="">اختر...</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">المدينة</label>
                        <select value={editData.city} onChange={e => setEditData({ ...editData, city: e.target.value })} className="input text-sm">
                          <option value="">اختر...</option>
                          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">الوصف</label>
                      <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })}
                        className="input text-sm resize-none" rows={2} />
                    </div>
                    <button onClick={saveEdit} disabled={saving}
                      className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                      <Save size={15} />
                      {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}