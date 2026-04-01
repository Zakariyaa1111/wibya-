'use client'
import { useState, useEffect } from 'react'
import { Cookie, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookies_accepted')
    if (!accepted) {
      setTimeout(() => setVisible(true), 1000)
    }
  }, [])

  function acceptAll() {
    localStorage.setItem('cookies_accepted', 'true')
    localStorage.setItem('cookies_date', new Date().toISOString())
    localStorage.setItem('cookies_analytics', 'true')
    localStorage.setItem('cookies_marketing', 'true')
    setVisible(false)
  }

  function acceptEssential() {
    localStorage.setItem('cookies_accepted', 'true')
    localStorage.setItem('cookies_date', new Date().toISOString())
    localStorage.setItem('cookies_analytics', 'false')
    localStorage.setItem('cookies_marketing', 'false')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 start-0 end-0 z-[100] px-4 pb-2 md:bottom-4 md:start-auto md:end-4 md:max-w-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
            <Cookie size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-neutral-900 dark:text-white">ملفات تعريف الارتباط</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">Wibya يستخدم الكوكيز</p>
          </div>
          <button onClick={acceptEssential} className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X size={15} className="text-neutral-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل الزيارات وتخصيص المحتوى.
            يمكنك قبول الكل أو الاكتفاء بالضرورية فقط.
            لمزيد من المعلومات راجع{' '}
            <Link href="/privacy" className="text-neutral-900 dark:text-white underline underline-offset-2">سياسة الخصوصية</Link>.
          </p>

          {/* Details toggle */}
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 mb-3 transition-colors">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          </button>

          {expanded && (
            <div className="space-y-2 mb-3">
              {[
                { label: 'ضرورية', desc: 'تسجيل الدخول والجلسة', required: true },
                { label: 'تحليلية', desc: 'فهم كيفية استخدام الموقع', required: false },
                { label: 'تسويقية', desc: 'تخصيص الإعلانات', required: false },
              ].map(({ label, desc, required }) => (
                <div key={label} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{label}</p>
                    <p className="text-[10px] text-neutral-400">{desc}</p>
                  </div>
                  <div className={`w-8 h-4 rounded-full flex items-center px-0.5 ${required ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-all ${required ? 'translate-x-4' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button onClick={acceptEssential}
              className="flex-1 py-2.5 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-medium rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              الضرورية فقط
            </button>
            <button onClick={acceptAll}
              className="flex-1 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
              <Check size={13} />
              قبول الكل
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}