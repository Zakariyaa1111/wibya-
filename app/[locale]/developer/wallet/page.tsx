'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import {
  Wallet, DollarSign, ArrowDownToLine, Clock,
  CheckCircle, XCircle, AlertCircle, ArrowUpRight
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function WalletPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<any>(null)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [
        { data: w },
        { data: p },
        { data: wds },
      ] = await Promise.all([
        supabase.from('wallets').select('*').eq('developer_id', user.id).single(),
        supabase.from('profiles').select('full_name, store_name, paypal_email').eq('id', user.id).single(),
        supabase.from('withdrawal_requests').select('*').eq('developer_id', user.id).order('created_at', { ascending: false }).limit(10),
      ])

      setWallet(w)
      setProfile(p)
      setPaypalEmail(p?.paypal_email || '')
      setWithdrawals(wds ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleWithdraw() {
    const amt = parseFloat(amount)
    if (!amt || amt < 10) { toast.error('الحد الأدنى للسحب $10'); return }
    if (amt > (wallet?.balance ?? 0)) { toast.error('الرصيد غير كافٍ'); return }
    if (!paypalEmail.includes('@')) { toast.error('بريد PayPal غير صحيح'); return }

    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // تحديث paypal_email في الملف الشخصي
    await supabase.from('profiles').update({ paypal_email: paypalEmail }).eq('id', user.id)

    const { error } = await supabase.from('withdrawal_requests').insert({
      developer_id: user.id,
      amount: amt,
      paypal_email: paypalEmail,
      status: 'pending',
    })

    if (error) {
      toast.error('خطأ: ' + error.message)
    } else {
      toast.success('تم إرسال طلب السحب ✅ سيتم معالجته خلال 1-3 أيام')
      setAmount('')
      setShowForm(false)
      // تحديث الـ state
      setWithdrawals(prev => [{
        id: 'new',
        amount: amt,
        paypal_email: paypalEmail,
        status: 'pending',
        created_at: new Date().toISOString(),
      }, ...prev])
    }
    setSubmitting(false)
  }

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    pending: { label: 'انتظار', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    processing: { label: 'معالجة', icon: AlertCircle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    completed: { label: 'مكتمل', icon: CheckCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    rejected: { label: 'مرفوض', icon: XCircle, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-4 px-4 max-w-lg mx-auto space-y-4">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">المحفظة</h1>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-900 dark:bg-white rounded-2xl p-4">
            <Wallet size={18} className="text-white/70 dark:text-neutral-900/70 mb-2" aria-hidden="true" />
            <p className="text-2xl font-bold text-white dark:text-neutral-900">
              ${wallet?.balance?.toFixed(2) ?? '0.00'}
            </p>
            <p className="text-xs text-white/60 dark:text-neutral-900/60 mt-0.5">الرصيد المتاح</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 space-y-3">
            <div>
              <p className="text-xs text-neutral-400">قيد الإفراج</p>
              <p className="font-bold text-amber-600">${wallet?.pending_balance?.toFixed(2) ?? '0.00'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">إجمالي الأرباح</p>
              <p className="font-bold text-neutral-900 dark:text-white">${wallet?.total_earned?.toFixed(2) ?? '0.00'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">إجمالي المسحوب</p>
              <p className="font-bold text-neutral-900 dark:text-white">${wallet?.total_withdrawn?.toFixed(2) ?? '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={!wallet?.balance || wallet.balance < 10}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 text-white font-bold rounded-2xl text-sm disabled:opacity-40 hover:bg-green-700 transition-colors"
        >
          <ArrowDownToLine size={16} aria-hidden="true" />
          {wallet?.balance >= 10 ? `سحب الأموال — متاح $${wallet.balance.toFixed(2)}` : 'الحد الأدنى $10'}
        </button>

        {/* Withdraw Form */}
        {showForm && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 space-y-4">
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm">طلب سحب</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                المبلغ (USD) — الحد الأدنى $10
              </label>
              <div className="relative">
                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="10"
                  max={wallet?.balance ?? 0}
                  step="1"
                  placeholder="10"
                  className="w-full ps-8 pe-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white outline-none focus:border-neutral-400 transition-colors"
                  dir="ltr"
                  aria-label="مبلغ السحب"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                بريد PayPal
              </label>
              <input
                type="email"
                value={paypalEmail}
                onChange={e => setPaypalEmail(e.target.value)}
                placeholder="your@paypal.com"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white outline-none focus:border-neutral-400 transition-colors"
                dir="ltr"
                aria-label="بريد PayPal"
              />
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                ⚠️ سيتم التحويل لـ PayPal خلال 1-3 أيام عمل بعد موافقة الإدارة.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleWithdraw}
                disabled={submitting || !amount || parseFloat(amount) < 10}
                className="flex-1 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-xl text-sm disabled:opacity-40"
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Withdrawal History */}
        {withdrawals.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm">سجل السحوبات</h2>
            </div>
            {withdrawals.map(w => {
              const status = statusConfig[w.status] ?? statusConfig.pending
              const StatusIcon = status.icon
              return (
                <div key={w.id} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${status.color}`}>
                    <StatusIcon size={14} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      سحب إلى PayPal
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(w.created_at).toLocaleDateString('ar-MA')}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">${w.amount?.toFixed(2)}</p>
                    <span className={`text-[10px] font-medium ${status.color.split(' ')[0]}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">كيف يعمل الدفع؟</p>
          {[
            'مشتري يشتري منتجك → المبلغ يدخل Escrow',
            'بعد 48 ساعة بدون نزاع → يُضاف لرصيدك',
            'تطلب السحب متى تريد (حد أدنى $10)',
            'يصل PayPal خلال 1-3 أيام عمل',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-blue-700 dark:text-blue-300">{item}</p>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}