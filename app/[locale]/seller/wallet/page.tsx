'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { Wallet, TrendingUp, ArrowDownLeft, Clock } from 'lucide-react'

export default function WalletPage() {
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const [{ data: p }, { data: o }] = await Promise.all([
        supabase.from('profiles').select('wallet_balance, total_sales, commission_rate').eq('id', user.id).single(),
        supabase.from('orders').select('total, status, created_at').eq('seller_id', user.id).order('created_at', { ascending: false }).limit(10),
      ])
      setProfile(p)
      setOrders(o ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="p-8 pt-20 lg:pt-8 flex justify-center"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>

  const delivered = orders.filter(o => o.status === 'delivered')
  const totalEarned = delivered.reduce((s, o) => s + (o.total || 0), 0)

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">المحفظة</h1>

      {/* Balance card */}
      <div className="bg-neutral-900 dark:bg-white rounded-3xl p-6 mb-4 text-center">
        <div className="w-12 h-12 bg-white/10 dark:bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Wallet size={24} className="text-white dark:text-neutral-900" />
        </div>
        <p className="text-white/60 dark:text-neutral-500 text-sm mb-1">الرصيد المتاح</p>
        <p className="text-white dark:text-neutral-900 text-4xl font-bold">{(profile?.wallet_balance ?? 0).toLocaleString()}</p>
        <p className="text-white/60 dark:text-neutral-500 text-sm mt-1">درهم مغربي</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'إجمالي المبيعات', value: `${(profile?.total_sales ?? 0).toLocaleString()} د.م.`, icon: TrendingUp, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
          { label: 'المكتسبات', value: `${totalEarned.toLocaleString()} د.م.`, icon: ArrowDownLeft, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { label: 'العمولة', value: `${profile?.commission_rate ?? 10}%`, icon: Clock, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 text-center">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}><Icon size={14} /></div>
            <p className="text-sm font-bold text-neutral-900 dark:text-white">{value}</p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Withdraw button */}
      <button className="w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-2xl mb-6 opacity-50 cursor-not-allowed text-sm">
        طلب سحب — قريباً
      </button>

      {/* Recent transactions */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white">آخر المعاملات</h2>
        </div>
        {delivered.length === 0
          ? <p className="text-center text-neutral-400 text-sm py-8">لا توجد معاملات بعد</p>
          : delivered.map((o, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">طلب مُسلَّم</p>
                <p className="text-xs text-neutral-400">{new Date(o.created_at).toLocaleDateString('ar-MA')}</p>
              </div>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">+{o.total?.toLocaleString()} د.م.</p>
            </div>
          ))
        }
      </div>
    </div>
  )
}