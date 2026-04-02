'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Shield, AlertTriangle } from 'lucide-react'
import { useRouter } from '@/lib/i18n/navigation'
import Image from 'next/image'

const TERMS = [
  { icon: Shield, text: 'يجب أن تكون المنتجات المعروضة حقيقية ومطابقة للوصف' },
  { icon: Shield, text: 'ممنوع بيع المنتجات المقلدة أو المحظورة قانونياً' },
  { icon: Shield, text: 'يجب الرد على الطلبات خلال 24 ساعة' },
  { icon: Shield, text: 'عمولة Wibya تُطبق على كل عملية بيع حسب مستواك' },
  { icon: Shield, text: 'يجب احترام آداب التعامل مع المشترين' },
  { icon: Shield, text: 'ممنوع التواصل خارج المنصة لإتمام الصفقات' },
  { icon: Shield, text: 'Wibya تحتفظ بحق إيقاف الحساب عند مخالفة الشروط' },
  { icon: AlertTriangle, text: 'البيانات الشخصية (البطاقة الوطنية وRIB) مشفرة وسرية تماماً' },
]

export function SellerTermsModal() {
  const [show, setShow] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, seller_terms_accepted')
        .eq('id', user.id)
        .single()

      // أظهر البطاقة فقط للبائعين الجدد
      if (profile?.role === 'seller' && !profile?.seller_terms_accepted) {
        setShow(true)
      }
    }
    check()
  }, [])

  async function handleAccept() {
    if (!accepted) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      seller_terms_accepted: true,
      seller_terms_date: new Date().toISOString(),
    }).eq('id', user.id)

    setShow(false)
    setLoading(false)
  }

  async function handleReject() {
    // إذا رفض — نرجعه للرئيسية ونغير الـ role لـ buyer
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ role: 'buyer' }).eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <Image src="/logo.png" alt="Wibya" width={36} height={36} className="object-contain" />
          <div>
            <h2 className="font-bold text-neutral-900 dark:text-white">شروط البائع</h2>
            <p className="text-xs text-neutral-400">يجب الموافقة قبل البدء بالبيع</p>
          </div>
        </div>

        {/* Terms */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            مرحباً بك كبائع في Wibya! قبل البدء، يجب الاطلاع والموافقة على الشروط التالية:
          </p>
          {TERMS.map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-3">
              <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={13} className="text-neutral-600 dark:text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{text}</p>
            </div>
          ))}

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mt-2">
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              ⚖️ بالموافقة على هذه الشروط تقر بأنك قرأتها وفهمتها وتوافق على الالتزام بها.
              مخالفة أي من هذه الشروط قد تؤدي إلى إيقاف حسابك.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3 shrink-0">
          <label className="flex items-start gap-3 cursor-pointer">
            <div
              onClick={() => setAccepted(!accepted)}
              className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                accepted ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white' : 'border-neutral-300 dark:border-neutral-600'
              }`}>
              {accepted && <Check size={12} className="text-white dark:text-neutral-900" strokeWidth={3} />}
            </div>
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              أقر بأنني قرأت وفهمت جميع شروط البائع وأوافق على الالتزام بها <span className="text-red-500">*</span>
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              disabled={!accepted || loading}
              className="flex-1 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl text-sm disabled:opacity-40 flex items-center justify-center gap-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Check size={16} /> أوافق وأبدأ البيع</>
              }
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-3.5 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-2xl text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <X size={16} />
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600 text-center">
            رفض الشروط سيحول حسابك لحساب مشتري
          </p>
        </div>
      </div>
    </div>
  )
}