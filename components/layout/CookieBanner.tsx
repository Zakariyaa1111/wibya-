'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Shield, Cookie, X, ChevronDown, ChevronUp, Check } from 'lucide-react'

type ConsentState = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
}

export function CookieBanner() {
  const [show, setShow] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('wibya_consent')
    if (!saved) {
      // تأخير قصير لتجنب flash
      const timer = setTimeout(() => setShow(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  async function saveConsent(acceptAll = false) {
    setSaving(true)
    const finalConsent: ConsentState = acceptAll
      ? { necessary: true, analytics: true, marketing: true }
      : consent

    // حفظ محلياً
    localStorage.setItem('wibya_consent', JSON.stringify({
      ...finalConsent,
      date: new Date().toISOString(),
      version: '1.0',
    }))

    // حفظ في Supabase إذا كان المستخدم مسجلاً
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const types: Array<'gdpr' | 'cndp' | 'cookies' | 'marketing'> = ['cookies', 'gdpr', 'cndp']
        if (finalConsent.marketing) types.push('marketing')
        await Promise.all(types.map(type =>
          supabase.from('gdpr_consents').insert({
            user_id: user.id,
            consent_type: type,
            accepted: true,
            version: '1.0',
          })
        ))
      }
    } catch { /* تجاهل الأخطاء */ }

    setSaving(false)
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center shrink-0">
            <Cookie size={18} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 id="cookie-banner-title" className="font-bold text-neutral-900 dark:text-white text-sm">
              نحن نحترم خصوصيتك
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              وفق القانون المغربي 09-08 و GDPR
            </p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            نستخدم كوكيز ضرورية لتشغيل الموقع، وكوكيز اختيارية لتحسين تجربتك.
            يمكنك قبول الكل أو تخصيص اختياراتك.
          </p>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            aria-expanded={showDetails}
          >
            {showDetails ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
            {showDetails ? 'إخفاء التفاصيل' : 'تخصيص الاختيارات'}
          </button>

          {showDetails && (
            <div className="space-y-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4">

              {/* Necessary */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">كوكيز ضرورية</p>
                  <p className="text-xs text-neutral-400">تسجيل الدخول، اللغة، الإعدادات</p>
                </div>
                <div className="w-10 h-6 bg-neutral-300 dark:bg-neutral-600 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">كوكيز الأداء</p>
                  <p className="text-xs text-neutral-400">إحصائيات مجهولة الهوية — Vercel Analytics</p>
                </div>
                <button
                  onClick={() => setConsent(p => ({ ...p, analytics: !p.analytics }))}
                  aria-label={consent.analytics ? 'تعطيل كوكيز الأداء' : 'تفعيل كوكيز الأداء'}
                  aria-pressed={consent.analytics}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                    consent.analytics ? 'bg-neutral-900 dark:bg-white justify-end' : 'bg-neutral-200 dark:bg-neutral-700 justify-start'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full shadow-sm ${
                    consent.analytics ? 'bg-white dark:bg-neutral-900' : 'bg-white'
                  }`} />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">كوكيز التسويق</p>
                  <p className="text-xs text-neutral-400">تخصيص المحتوى — لا إعلانات خارجية</p>
                </div>
                <button
                  onClick={() => setConsent(p => ({ ...p, marketing: !p.marketing }))}
                  aria-label={consent.marketing ? 'تعطيل كوكيز التسويق' : 'تفعيل كوكيز التسويق'}
                  aria-pressed={consent.marketing}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                    consent.marketing ? 'bg-neutral-900 dark:bg-white justify-end' : 'bg-neutral-200 dark:bg-neutral-700 justify-start'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full shadow-sm ${
                    consent.marketing ? 'bg-white dark:bg-neutral-900' : 'bg-white'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* Legal Links */}
          <div className="flex items-center gap-3 text-[10px] text-neutral-400">
            <Shield size={11} className="text-green-500 shrink-0" aria-hidden="true" />
            <span>
              بالموافقة تقبل{' '}
              <Link href="/privacy" className="underline hover:text-neutral-600">سياسة الخصوصية</Link>
              {' '}و{' '}
              <Link href="/cookies" className="underline hover:text-neutral-600">سياسة الكوكيز</Link>
              {' '}و{' '}
              <Link href="/terms" className="underline hover:text-neutral-600">شروط الاستخدام</Link>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col gap-2">
          <button
            onClick={() => saveConsent(true)}
            disabled={saving}
            className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl text-sm disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Check size={15} aria-hidden="true" />
            قبول الكل
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => saveConsent(false)}
              disabled={saving}
              className="flex-1 py-2.5 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {showDetails ? 'حفظ الاختيارات' : 'الضروري فقط'}
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 text-neutral-500 rounded-xl text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              aria-label="تخصيص"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}