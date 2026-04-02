import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Cookie, Shield, BarChart2, Settings, X } from 'lucide-react'
import Link from 'next/link'

const COOKIE_TYPES = [
  {
    icon: Shield,
    name: 'كوكيز ضرورية',
    required: true,
    color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    description: 'هذه الكوكيز ضرورية لعمل الموقع ولا يمكن تعطيلها.',
    cookies: [
      { name: 'sb-auth-token', purpose: 'جلسة تسجيل الدخول', duration: 'حتى تسجيل الخروج' },
      { name: 'theme', purpose: 'إعداد الوضع الليلي/النهاري', duration: 'دائم' },
      { name: 'cookies_accepted', purpose: 'تذكر موافقتك على الكوكيز', duration: 'سنة' },
      { name: 'locale', purpose: 'اللغة المختارة (عربي/فرنسي)', duration: 'دائم' },
    ],
  },
  {
    icon: BarChart2,
    name: 'كوكيز الأداء',
    required: false,
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    description: 'تساعدنا على فهم كيفية استخدام الموقع لتحسينه. البيانات مجهولة الهوية.',
    cookies: [
      { name: 'va-*', purpose: 'Vercel Analytics — إحصائيات مجهولة', duration: 'سنة' },
    ],
  },
  {
    icon: Settings,
    name: 'كوكيز الوظائف',
    required: false,
    color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    description: 'تحفظ تفضيلاتك لتحسين تجربتك.',
    cookies: [
      { name: 'cart', purpose: 'محتوى سلة التسوق', duration: '7 أيام' },
      { name: 'role-cache', purpose: 'دور الحساب (بائع/مشتري) لتسريع التنقل', duration: '10 دقائق' },
    ],
  },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-6 mb-6 text-center">
          <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Cookie size={24} className="text-neutral-700 dark:text-neutral-300" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            سياسة الكوكيز
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            ما هي الكوكيز التي نستخدمها ولماذا
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
            <span>آخر تحديث: أبريل 2026</span>
            <span>·</span>
            <span>الإصدار 1.0</span>
          </div>
        </div>

        {/* What are cookies */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4">
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">ما هي الكوكيز؟</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            الكوكيز (Cookies) هي ملفات نصية صغيرة تُحفظ في متصفحك عند زيارة موقعنا.
            تساعد على تذكر تفضيلاتك وتحسين تجربتك. لا تحتوي على معلومات شخصية حساسة.
          </p>
        </div>

        {/* Cookie types */}
        <div className="space-y-4 mb-6">
          {COOKIE_TYPES.map(({ icon: Icon, name, required, color, iconColor, description, cookies }) => (
            <section
              key={name}
              className={`rounded-2xl border p-5 ${color}`}
              aria-labelledby={`cookie-${name}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/50 dark:bg-white/5 rounded-xl flex items-center justify-center">
                    <Icon size={15} className={iconColor} aria-hidden="true" />
                  </div>
                  <h2 id={`cookie-${name}`} className="font-bold text-neutral-900 dark:text-white text-sm">
                    {name}
                  </h2>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${required ? 'bg-green-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}>
                  {required ? 'ضروري' : 'اختياري'}
                </span>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                {description}
              </p>

              <div className="space-y-2">
                {cookies.map(c => (
                  <div key={c.name} className="bg-white/60 dark:bg-white/5 rounded-xl px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <code className="text-xs font-mono text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                          {c.name}
                        </code>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{c.purpose}</p>
                      </div>
                      <span className="text-[10px] text-neutral-400 shrink-0 mt-1">{c.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* No advertising cookies */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
              <X size={15} className="text-red-500" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm">لا نستخدم كوكيز إعلانية</h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            لا نستخدم Google Analytics ولا Facebook Pixel ولا أي أداة تتبع إعلاني.
            منصة Wibya لا تعرض إعلانات خارجية ولا تتتبع سلوكك لأغراض تسويقية لأطراف ثالثة.
          </p>
        </div>

        {/* How to control */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4">
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">كيف تتحكم في الكوكيز؟</h2>
          <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <p className="leading-relaxed">يمكنك التحكم في الكوكيز من خلال:</p>
            <div className="space-y-2">
              {[
                'إعدادات متصفحك — يمكنك حذف أو تعطيل الكوكيز',
                'Chrome: الإعدادات ← الخصوصية والأمان ← ملفات تعريف الارتباط',
                'Firefox: الإعدادات ← الخصوصية والأمان ← الكوكيز',
                'Safari: التفضيلات ← الخصوصية',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0 mt-2" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mt-2">
              ⚠️ تعطيل الكوكيز الضرورية قد يؤثر على عمل الموقع وقد لا تتمكن من تسجيل الدخول.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
          <Link href="/privacy"
            className="flex-1 text-center py-2.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 transition-colors">
            سياسة الخصوصية
          </Link>
          <Link href="/terms"
            className="flex-1 text-center py-2.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 transition-colors">
            شروط الاستخدام
          </Link>
        </div>

        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-6">
          Wibya © 2026 — جميع الحقوق محفوظة
        </p>
      </main>
      <BottomNav />
    </div>
  )
}