'use client'
import { useState, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
// تعريف نوع grecaptcha لأن TypeScript لا يعرفه
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}
function LoginForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  // توليد رمز reCAPTCHA
  async function getRecaptchaToken(action: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject('reCAPTCHA not loaded')
        return
      }
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action })
          .then(resolve)
          .catch(reject)
      })
    })
  }

  // ✅ دالة التوجيه الصحيحة — بدون /ar/ar
  function redirectByRole(role: string) {
    if (role === 'admin') {
      window.location.href = '/ar/admin'
    } else if (role === 'developer') {
      window.location.href = '/ar/developer/dashboard'
    } else {
      window.location.href = '/ar'
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // الخطوة 1: توليد رمز reCAPTCHA
    let recaptchaToken = ''
    try {
      recaptchaToken = await getRecaptchaToken('login')
    } catch {
      toast.error('فشل التحقق الأمني، أعد تحميل الصفحة')
      setLoading(false)
      return
    }

    // الخطوة 2: التحقق من الرمز في السيرفر
    const verifyResponse = await fetch('/api/recaptcha/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: recaptchaToken,
        action: 'login',
      }),
    })

    const verifyData = await verifyResponse.json()

    if (!verifyData.success) {
      toast.error('فشل التحقق الأمني')
      setLoading(false)
      return
    }

    // الخطوة 3: تسجيل الدخول
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    redirectByRole(profile?.role ?? 'buyer')
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // ✅ الـ callback يتولى التوجيه الصحيح
        redirectTo: `${window.location.origin}/ar/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="رجوع">
          <ArrowRight size={20} className="text-neutral-600 dark:text-neutral-400 rotate-180" aria-hidden="true" />
        </button>
        <Image src="/logo.png" alt="Wibya" width={36} height={36} className="object-contain" />
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pt-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{t('login')}</h1>
        <p className="text-neutral-400 text-sm mb-8">مرحباً بك في Wibya</p>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-sm font-semibold text-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors mb-4 disabled:opacity-50"
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
          {googleLoading ? 'جاري التوجيه...' : 'تسجيل الدخول بـ Google'}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
          <span className="text-xs text-neutral-400">أو</span>
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                className="input pe-12" placeholder="••••••••" required
              />
              <button
                type="button" onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 end-4 flex items-center text-neutral-400"
                aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPass ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? '...' : t('login')}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          ليس لديك حساب؟{' '}
          <Link href="/auth/register" className="text-neutral-900 dark:text-white font-semibold underline underline-offset-2">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}