'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

type Role = 'buyer' | 'seller' | 'advertiser'

const ROLES: { value: Role; label: string; emoji: string; desc: string }[] = [
  { value: 'buyer', label: 'مشتري', emoji: '🛍️', desc: 'تصفح واشترِ المنتجات' },
  { value: 'seller', label: 'بائع', emoji: '🏪', desc: 'أضف منتجاتك وبِع' },
  { value: 'advertiser', label: 'معلن', emoji: '📢', desc: 'انشر إعلاناتك التجارية' },
]

export default function RegisterPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'form'>('role')
  const [role, setRole] = useState<Role>('buyer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role },
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('تم إنشاء الحساب! تحقق من بريدك الإلكتروني')
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-2">
        <button
          onClick={() => step === 'form' ? setStep('role') : router.back()}
          className="p-2 rounded-xl hover:bg-neutral-100"
        >
          <ArrowRight size={20} className="text-neutral-600 rotate-180" />
        </button>
        <div className="w-8 h-8 bg-neutral-900 rounded-xl flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm">W</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pt-8">
        {step === 'role' ? (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">أنت...</h1>
            <p className="text-neutral-400 text-sm mb-8">اختر نوع حسابك</p>
            <div className="space-y-3">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => { setRole(r.value); setStep('form') }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-start ${
                    role === r.value
                      ? 'border-neutral-900 bg-neutral-50'
                      : 'border-neutral-100 hover:border-neutral-200'
                  }`}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <div>
                    <div className="font-semibold text-neutral-900">{r.label}</div>
                    <div className="text-sm text-neutral-400">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">{t('register')}</h1>
            <p className="text-neutral-400 text-sm mb-8">
              حساب {ROLES.find(r => r.value === role)?.label}
            </p>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t('name')}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="input" placeholder="محمد أمين" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t('email')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input" placeholder="example@email.com" required dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t('password')}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="input" placeholder="••••••••" required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? '...' : t('register')}
              </button>
            </form>
            <p className="text-center text-sm text-neutral-500 mt-6">
              لديك حساب؟{' '}
              <Link href="/auth/login" className="text-neutral-900 font-semibold underline underline-offset-2">
                {t('login')}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
