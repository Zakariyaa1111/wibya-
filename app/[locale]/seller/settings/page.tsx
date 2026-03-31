'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { Save, Lock, AlertTriangle, CheckCircle, Building2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { encryptStrong } from '@/lib/crypto/encrypt'

const CITIES = ['الدار البيضاء','الرباط','فاس','مراكش','أكادير','طنجة','مكناس','وجدة','تطوان','سلا','أخرى']
const BANKS = ['Attijariwafa Bank', 'Banque Populaire', 'CIH Bank', 'BMCE Bank', 'Société Générale Maroc', 'BMCI', 'Crédit Agricole Maroc', 'CDM', 'Al Barid Bank', 'CFG Bank', 'Autre']

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [bankAccount, setBankAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingRib, setSavingRib] = useState(false)
  const [showRib, setShowRib] = useState(false)
  const [changeRequested, setChangeRequested] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({
    store_name: '', store_desc: '', phone: '', whatsapp: '', city: ''
  })
  const [ribForm, setRibForm] = useState({
    rib: '', bank_name: ''
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: p }, { data: bank }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('seller_bank_accounts').select('*').eq('seller_id', user.id).single(),
      ])

      setProfile(p)
      setBankAccount(bank)
      setChangeRequested(!!bank?.change_requested_at && !bank?.change_approved_by)
      setForm({
        store_name: p?.store_name || '',
        store_desc: p?.store_desc || '',
        phone: p?.phone || '',
        whatsapp: p?.whatsapp || '',
        city: p?.city || '',
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

  async function handleSaveRib(e: React.FormEvent) {
    e.preventDefault()
    if (!ribForm.rib.trim()) { toast.error('يجب إدخال رقم RIB'); return }
    // التحقق من صحة RIB المغربي (24 رقم)
    if (!/^\d{24}$/.test(ribForm.rib.replace(/\s/g, ''))) {
      toast.error('RIB غير صحيح — يجب أن يكون 24 رقماً')
      return
    }
    setSavingRib(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const encryptedRib = await encryptStrong(ribForm.rib.replace(/\s/g, ''))

      const { error } = await supabase.from('seller_bank_accounts').upsert({
        seller_id: user.id,
        rib_encrypted: encryptedRib,
        bank_name: ribForm.bank_name,
        is_locked: true,
        updated_at: new Date().toISOString(),
      })

      if (error) { toast.error('خطأ في الحفظ'); setSavingRib(false); return }

      setBankAccount({ rib_encrypted: encryptedRib, bank_name: ribForm.bank_name, is_locked: true })
      setRibForm({ rib: '', bank_name: '' })
      toast.success('تم حفظ RIB بشكل مشفر وآمن 🔒')
    } catch {
      toast.error('حدث خطأ')
    }
    setSavingRib(false)
  }

  async function requestRibChange() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('seller_bank_accounts').update({
      change_requested_at: new Date().toISOString(),
    }).eq('seller_id', user.id)

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'تم إرسال طلب تغيير RIB 📋',
      body: 'طلبك قيد المراجعة من الإدارة، سيتم التواصل معك قريباً',
      type: 'product', is_read: false,
    })

    setChangeRequested(true)
    toast.success('تم إرسال طلب التغيير للإدارة ✅')
  }

  if (loading) return (
    <div className="p-8 pt-20 lg:pt-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 max-w-lg">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">الإعدادات</h1>

      {/* معلومات المتجر */}
      <form onSubmit={handleSave} className="space-y-4 mb-6">
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

      {/* RIB البنكي */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={16} className="text-neutral-500" />
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">الحساب البنكي (RIB)</h2>
          <Lock size={13} className="text-neutral-400 ms-auto" />
        </div>

        {bankAccount ? (
          // RIB موجود ومقفل
          <div className="space-y-3">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">رقم RIB</span>
                <button onClick={() => setShowRib(!showRib)} className="text-neutral-400 hover:text-neutral-600">
                  {showRib ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-sm font-mono text-neutral-900 dark:text-white" dir="ltr">
                {showRib ? '🔒 مشفر — لا يمكن عرضه' : '•••• •••• •••• •••• •••• ••••'}
              </p>
              {bankAccount.bank_name && (
                <p className="text-xs text-neutral-400 mt-1">{bankAccount.bank_name}</p>
              )}
            </div>

            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              <CheckCircle size={14} className="text-green-600 dark:text-green-400 shrink-0" />
              <p className="text-xs text-green-700 dark:text-green-300">RIB محفوظ ومشفر بشكل آمن 🔒</p>
            </div>

            {changeRequested ? (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">طلب التغيير قيد المراجعة من الإدارة</p>
              </div>
            ) : (
              <button onClick={requestRibChange}
                className="w-full py-2.5 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-medium rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
                <AlertTriangle size={13} />
                طلب تغيير RIB من الإدارة
              </button>
            )}
          </div>
        ) : (
          // إضافة RIB جديد
          <form onSubmit={handleSaveRib} className="space-y-3">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mb-2">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                ⚠️ بعد حفظ RIB لا يمكن تغييره إلا بطلب مباشر للإدارة
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">البنك</label>
              <select value={ribForm.bank_name} onChange={e => setRibForm({ ...ribForm, bank_name: e.target.value })} className="input">
                <option value="">اختر البنك...</option>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">رقم RIB (24 رقم)</label>
              <input
                value={ribForm.rib}
                onChange={e => setRibForm({ ...ribForm, rib: e.target.value })}
                className="input font-mono"
                placeholder="000000000000000000000000"
                dir="ltr"
                maxLength={24}
              />
              <p className="text-[10px] text-neutral-400 mt-1">{ribForm.rib.replace(/\s/g, '').length}/24 رقم</p>
            </div>
            <button type="submit" disabled={savingRib || !ribForm.rib || !ribForm.bank_name}
              className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-xl disabled:opacity-40 text-sm flex items-center justify-center gap-2">
              <Lock size={14} />
              {savingRib ? 'جاري التشفير...' : 'حفظ RIB بشكل مشفر'}
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
        🔒 جميع البيانات البنكية مشفرة بـ AES-256
      </p>
    </div>
  )
}