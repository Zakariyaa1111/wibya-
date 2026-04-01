'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Check } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

type Role = 'buyer' | 'seller'

const ROLES: { value: Role; label: string; emoji: string; desc: string }[] = [
  { value: 'buyer', label: 'مشتري', emoji: '🛍️', desc: 'تصفح واشترِ المنتجات وأضف إعلانات' },
  { value: 'seller', label: 'بائع', emoji: '🏪', desc: 'أضف منتجاتك وبِع + إعلانات' },
]

function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div onClick={onChange}
        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
          checked ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white' : 'border-neutral-300 dark:border-neutral-600 group-hover:border-neutral-400'
        }`}>
        {checked && <Check size={12} className="text-white dark:text-neutral-900" strokeWidth={3} />}
      </div>
      <span className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{children}</span>
    </label>
  )
}

export default function RegisterPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'form'>('role')
  const [role, setRole] = useState<Role>('buyer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptCookies, setAcceptCookies] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!acceptTerms) { toast.error('يجب الموافقة على شروط الاستخدام وسياسة الخصوصية'); return }
    if (!acceptCookies) { toast.error('يجب الموافقة على استخدام ملفات تعريف الارتباط'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role,
          terms_accepted: true,
          terms_date: new Date().toISOString(),
          cookies_accepted: true,
        },
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      localStorage.setItem('cookies_accepted', 'true')
      localStorage.setItem('cookies_date', new Date().toISOString())
      toast.success('تم إنشاء الحساب! تحقق من بريدك الإلكتروني')
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button onClick={() => step === 'form' ? setStep('role') : router.back()}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowRight size={20} className="text-neutral-600 dark:text-neutral-400 rotate-180" />
        </button>
        <Image src="/logo.png" alt="Wibya" width={36} height={36} className="object-contain" />
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pt-6 pb-10">
        {step === 'role' ? (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">أنت...</h1>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm mb-8">اختر نوع حسابك</p>
            <div className="space-y-3">
              {ROLES.map(r => (
                <button key={r.value} onClick={() => { setRole(r.value); setStep('form') }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-start ${
                    role === r.value
                      ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800'
                      : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}>
                  <span className="text-2xl">{r.emoji}</span>
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">{r.label}</div>
                    <div className="text-sm text-neutral-400 dark:text-neutral-500">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{t('register')}</h1>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm mb-6">
              حساب {ROLES.find(r => r.value === role)?.label}
            </p>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">{t('name')}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="input" placeholder="محمد أمين" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">{t('email')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input" placeholder="example@email.com" required dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">{t('password')}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="input" placeholder="••••••••" required minLength={6} />
              </div>

              <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <Checkbox checked={acceptTerms} onChange={() => setAcceptTerms(!acceptTerms)}>
                  أوافق على{' '}
                  <Link href="/terms" className="text-neutral-900 dark:text-white font-medium underline underline-offset-2">شروط الاستخدام</Link>
                  {' '}و{' '}
                  <Link href="/privacy" className="text-neutral-900 dark:text-white font-medium underline underline-offset-2">سياسة الخصوصية</Link>
                  <span className="text-red-500 ms-1">*</span>
                </Checkbox>
                <Checkbox checked={acceptCookies} onChange={() => setAcceptCookies(!acceptCookies)}>
                  أوافق على استخدام{' '}
                  <span className="text-neutral-900 dark:text-white font-medium">ملفات تعريف الارتباط</span>
                  {' '}لتحسين تجربة الاستخدام
                  <span className="text-red-500 ms-1">*</span>
                </Checkbox>
              </div>

              <button type="submit" disabled={loading || !acceptTerms || !acceptCookies}
                className="btn-primary w-full mt-2 disabled:opacity-40">
                {loading ? '...' : t('register')}
              </button>
            </form>
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
              لديك حساب؟{' '}
              <Link href="/auth/login" className="text-neutral-900 dark:text-white font-semibold underline underline-offset-2">
                {t('login')}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}