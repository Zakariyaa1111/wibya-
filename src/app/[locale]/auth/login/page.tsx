'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-2">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-neutral-100">
          <ArrowRight size={20} className="text-neutral-600 rotate-180" />
        </button>
        <div className="w-8 h-8 bg-neutral-900 rounded-xl flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm">W</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pt-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">{t('login')}</h1>
        <p className="text-neutral-400 text-sm mb-8">مرحباً بك في Wibya</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              {t('email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="example@email.com"
              required
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input pe-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 end-4 flex items-center text-neutral-400"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? '...' : t('login')}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          ليس لديك حساب؟{' '}
          <Link href="/auth/register" className="text-neutral-900 font-semibold underline underline-offset-2">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
