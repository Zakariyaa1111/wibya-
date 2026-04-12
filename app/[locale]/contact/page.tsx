import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Mail, MessageCircle, Clock, HelpCircle, Bug, CreditCard, Shield } from 'lucide-react'

const TOPICS = [
  { icon: HelpCircle, title: 'سؤال عام', desc: 'استفسار عن المنصة أو كيفية الاستخدام' },
  { icon: Bug, title: 'مشكلة تقنية', desc: 'خطأ في الموقع أو مشكلة في التحميل' },
  { icon: CreditCard, title: 'مشكلة في الدفع', desc: 'نزاع أو مشكلة في معاملة مالية' },
  { icon: Shield, title: 'الإبلاغ عن منتج', desc: 'منتج مسروق أو يخالف الشروط' },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-4 max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-6 text-center">
          <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={24} className="text-neutral-700 dark:text-neutral-300" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">تواصل معنا</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            نحن هنا لمساعدتك — سنرد خلال 24 ساعة
          </p>
        </div>

        {/* وقت الرد */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-center gap-3">
          <Clock size={16} className="text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            وقت الرد المعتاد: <strong>أقل من 24 ساعة</strong> أيام الأسبوع
          </p>
        </div>

        {/* موضوعات التواصل */}
        <div>
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">بماذا يمكننا مساعدتك؟</h2>
          <div className="grid grid-cols-2 gap-3">
            {TOPICS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
                <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center mb-3">
                  <Icon size={16} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
                </div>
                <p className="font-bold text-xs text-neutral-900 dark:text-white mb-1">{title}</p>
                <p className="text-[10px] text-neutral-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* طرق التواصل */}
        <div className="space-y-3">
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm">طرق التواصل</h2>

          {/* البريد الإلكتروني */}
          <a
            href="mailto:contact@wibya.com"
            className="flex items-center gap-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors group"
          >
            <div className="w-11 h-11 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
              <Mail size={18} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-sm text-neutral-900 dark:text-white">البريد الإلكتروني</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">contact@wibya.com</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">للاستفسارات العامة والدعم</p>
            </div>
          </a>

          {/* واتساب */}
          <a
            href="https://wa.me/212600000000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 hover:border-green-300 dark:hover:border-green-700 transition-colors group"
          >
            <div className="w-11 h-11 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
              <MessageCircle size={18} className="text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-sm text-neutral-900 dark:text-white">واتساب</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">تواصل سريع ومباشر</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">للمشاكل العاجلة والدعم الفوري</p>
            </div>
          </a>
        </div>

        {/* معلومات الشركة */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">معلومات الشركة</h2>
          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between">
              <span className="text-neutral-500">المنصة</span>
              <span className="font-medium text-neutral-900 dark:text-white">Wibya</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">البلد</span>
              <span className="font-medium text-neutral-900 dark:text-white">🇲🇦 المغرب</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">البريد</span>
              <a href="mailto:contact@wibya.com" className="text-blue-600 dark:text-blue-400">contact@wibya.com</a>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600">
          Wibya © 2026 — جميع الحقوق محفوظة
        </p>

      </main>
      <BottomNav />
    </div>
  )
}