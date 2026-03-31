'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ store_name: '', store_desc: '', phone: '', whatsapp: '', city: '' })
  const router = useRouter()

  const CITIES = ['الدار البيضاء','الرباط','فاس','مراكش','أكادير','طنجة','مكناس','وجدة','تطوان','سلا','أخرى']

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setForm({
        store_name: data?.store_name || '',
        store_desc: data?.store_desc || '',
        phone: data?.phone || '',
        whatsapp: data?.whatsapp || '',
        city: data?.city || '',
      })
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update(form).eq('id', user.id)
    if (error) { toast.error('خطأ في الحفظ'); setSaving(false); return }
    toast.success('تم حفظ الإعدادات ✅')
    setSaving(false)
  }

  if (loading) return <div className="p-8 pt-20 lg:pt-8 flex justify-center"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 max-w-lg">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">إعدادات المتجر</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 space-y-4">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">معلومات المتجر</h2>
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">اسم المتجر</label>
            <input value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} className="input" placeholder="اسم متجرك..." />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">وصف المتجر</label>
            <textarea value={form.store_desc} onChange={e => setForm({ ...form, store_desc: e.target.value })} className="input resize-none" rows={3} placeholder="وصف مختصر عن متجرك..." />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">المدينة</label>
            <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input">
              <option value="">اختر المدينة...</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 space-y-4">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">معلومات التواصل</h2>
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">رقم الهاتف</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+212..." dir="ltr" />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">واتساب</label>
            <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className="input" placeholder="+212..." dir="ltr" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
          <Save size={16} />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  )
}