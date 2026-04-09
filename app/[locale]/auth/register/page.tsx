'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Check } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (key: string, opts: { action: string }) => Promise<string>
    }
  }
}

type Role = 'buyer' | 'developer'

const ROLES: { value: Role; label: string; emoji: string; desc: string }[] = [
  { value: 'buyer', label: 'مشتري', emoji: '🛍️', desc: 'تصفح واشترِ المنتجات الرقمية' },
  { value: 'developer', label: 'مطور', emoji: '💻', desc: 'ارفع وبِع قوالبك وأدواتك ودوراتك' },
]

function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div onClick={onChange}
        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${checked ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white' : 'border-neutral-300 dark:border-neutral-600'}`}>
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
  const [googleLoading, setGoogleLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptCookies, setAcceptCookies] = useState(false)

  async function getRecaptchaToken(action: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) { reject('reCAPTCHA not loaded'); return }
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action })
          .then(resolve).catch(reject)
      })
    })
  }

  async function handleGoogleRegister() {
    if (!acceptTerms) { toast.error('يجب الموافقة على الشروط'); return }
    if (!acceptCookies) { toast.error('يجب الموافقة على الكوكيز'); return }
    setGoogleLoading(true)

    try {
      const recaptchaToken = await getRecaptchaToken('google_register')
      const verifyRes = await fetch('/api/recaptcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken, action: 'google_register' }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        toast.error('فشل التحقق الأمني')
        setGoogleLoading(false)
        return
      }
    } catch {
      toast.error('فشل التحقق الأمني')
      setGoogleLoading(false)
      return
    }

    const supabase = createClient()
    localStorage.setItem('pending_role', role)
    localStorage.setItem('cookies_accepted', 'true')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/ar/auth/callback?role=${role}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!acceptTerms) { toast.error('يجب الموافقة على شروط الاستخدام'); return }
    if (!acceptCookies) { toast.error('يجب الموافقة على الكوكيز'); return }
    if (password.length < 8) { toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }
    setLoading(true)

    try {
      const recaptchaToken = await getRecaptchaToken('register')
      const verifyRes = await fetch('/api/recaptcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken, action: 'register' }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        toast.error('فشل التحقق الأمني')
        setLoading(false)
        return
      }
    } catch {
      toast.error('فشل التحقق الأمني')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name: name,
          role,
          terms_accepted: true,
          cookies_accepted: true,
        },
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      localStorage.setItem('cookies_accepted', 'true')
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ role }).eq('id', user.id)
      }
      toast.success('تم إنشاء الحساب! تحقق من بريدك الإلكتروني ✅')
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button onClick={() => step === 'form' ? setStep('role') : router.back()}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="رجوع">
          <ArrowRight size={20} className="text-neutral-600 dark:text-neutral-400 rotate-180" aria-hidden="true" />
        </button>
        <Image src="/logo.png" alt="Wibya" width={36} height={36} className="object-contain" />
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pt-6 pb-10">
        {step === 'role' ? (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">أنت...</h1>
            <p className="text-neutral-400 text-sm mb-8">اختر نوع حسابك</p>
            <div className="space-y-3">
              {ROLES.map(r => (
                <button key={r.value} onClick={() => { setRole(r.value); setStep('form') }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-start ${
                    role === r.value
                      ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800'
                      : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-300'
                  }`}>
                  <span className="text-2xl" aria-hidden="true">{r.emoji}</span>
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">{r.label}</div>
                    <div className="text-sm text-neutral-400">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* CTA للمطورين */}
            <div className="mt-6 bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                💡 كمطور يمكنك رفع قوالبك وأدواتك ودوراتك التعليمية وبيعها لآلاف المشترين العرب.
                عمولة <strong className="text-neutral-900 dark:text-white">9% فقط</strong> تغطي رسوم الدفع.
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {t('register')}
            </h1>
            <p className="text-neutral-400 text-sm mb-6">
              حساب {ROLES.find(r => r.value === role)?.label}{' '}
              {ROLES.find(r => r.value === role)?.emoji}
            </p>

            {/* Checkboxes */}
            <div className="space-y-3 mb-6 bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-4">
              <Checkbox checked={acceptTerms} onChange={() => setAcceptTerms(!acceptTerms)}>
                أوافق على{' '}
                <Link href="/terms" className="text-neutral-900 dark:text-white font-medium underline underline-offset-2">
                  شروط الاستخدام
                </Link>
                {' '}و{' '}
                <Link href="/privacy" className="text-neutral-900 dark:text-white font-medium underline underline-offset-2">
                  سياسة الخصوصية
                </Link>
                <span className="text-red-500 ms-1">*</span>
              </Checkbox>
              <Checkbox checked={acceptCookies} onChange={() => setAcceptCookies(!acceptCookies)}>
                أوافق على استخدام{' '}
                <span className="text-neutral-900 dark:text-white font-medium">ملفات تعريف الارتباط</span>
                <span className="text-red-500 ms-1">*</span>
              </Checkbox>
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleRegister}
              disabled={googleLoading || !acceptTerms || !acceptCookies}
              className="w-full flex items-center justify-center gap-3 py-3.5 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-sm font-semibold text-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors mb-4 disabled:opacity-40"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {googleLoading ? 'جاري التوجيه...' : 'التسجيل بـ Google (موصى به)'}
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
              <span className="text-xs text-neutral-400">أو بالبريد الإلكتروني</span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  {t('name')}
                </label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  className="input" placeholder="محمد أمين" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  {t('email')}
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input" placeholder="example@email.com" required dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  {t('password')}
                </label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="input" placeholder="••••••••" required minLength={8}
                />
                <p className="text-[10px] text-neutral-400 mt-1">8 أحرف على الأقل</p>
              </div>
              <button
                type="submit"
                disabled={loading || !acceptTerms || !acceptCookies}
                className="btn-primary w-full mt-2 disabled:opacity-40"
              >
                {loading ? '...' : t('register')}
              </button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
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