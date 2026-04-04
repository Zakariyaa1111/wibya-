import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import {
  Code2, Shield, DollarSign, Users, Zap,
  CheckCircle, ArrowLeft, Star, Package, TrendingUp
} from 'lucide-react'

const STEPS = [
  { num: '01', title: 'سجل كمطور', desc: 'أنشئ حسابك واملأ ملفك الشخصي بمهاراتك وروابط مشاريعك' },
  { num: '02', title: 'ارفع منتجك', desc: 'أضف ملف ZIP مع صور معاينة ووصف واضح وسعر مناسب' },
  { num: '03', title: 'فحص الجودة', desc: 'Claude AI يفحص منتجك تلقائياً ويصدر تقرير جودة للأدمن' },
  { num: '04', title: 'ابدأ البيع', desc: 'بعد الموافقة يظهر منتجك لآلاف المشترين العرب فوراً' },
]

const FEATURES = [
  { icon: Shield, title: 'فحص جودة مجاني', desc: 'Claude AI يفحص كل منتج ويصدر تقرير احترافي يزيد ثقة المشترين' },
  { icon: DollarSign, title: 'عمولة شفافة 9%', desc: 'تغطي رسوم الدفع فقط — لا ربح للمنصة على حسابك' },
  { icon: Zap, title: 'دفع فوري', desc: 'المبلغ يصل محفظتك بعد 48 ساعة من كل بيعة عبر PayPal' },
  { icon: Users, title: 'جمهور عربي', desc: 'مطورون ورجال أعمال يبحثون عن حلول رقمية باللغة العربية' },
  { icon: Star, title: 'نظام تقييمات', desc: 'ابن سمعتك من خلال تقييمات حقيقية من مشترين حقيقيين' },
  { icon: TrendingUp, title: 'إحصائيات مفصلة', desc: 'تتبع مشاهداتك، مبيعاتك، وأرباحك من لوحة تحكم احترافية' },
]

const PRICING = [
  {
    name: 'مجاني',
    price: '$0',
    period: 'للأبد',
    features: [
      'رفع منتجات غير محدودة',
      'فحص جودة تلقائي',
      'لوحة تحكم كاملة',
      'دعم PayPal',
      'إحصائيات أساسية',
    ],
    cta: 'ابدأ مجاناً',
    highlighted: false,
  },
]

export default function ForDevelopersPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />

      <main className="pb-24">

        {/* Hero */}
        <div className="bg-neutral-900 px-4 pt-10 pb-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-32 -translate-y-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -translate-x-24 translate-y-24" />
          </div>
          <div className="relative max-w-lg mx-auto">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Code2 size={28} className="text-white" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
              بيع منتجاتك الرقمية<br />لآلاف المطورين العرب
            </h1>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              قوالب، أدوات، دورات تعليمية — ابن دخلاً مستداراً من كودك
            </p>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link
                href="/auth/register?role=developer"
                className="flex items-center justify-center gap-2 py-3.5 bg-white text-neutral-900 font-bold rounded-2xl text-sm hover:bg-neutral-100 transition-colors"
              >
                <Code2 size={16} aria-hidden="true" />
                ابدأ البيع مجاناً
              </Link>
              <Link
                href="/search"
                className="flex items-center justify-center gap-2 py-3 border border-white/20 text-white/80 rounded-2xl text-sm hover:bg-white/5 transition-colors"
              >
                استكشف المنتجات
                <ArrowLeft size={14} aria-hidden="true" />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-8 pt-8 border-t border-white/10">
              {[
                { value: '9%', label: 'عمولة فقط' },
                { value: '48h', label: 'دفع سريع' },
                { value: '100%', label: 'مفحوص بـ AI' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-white font-bold text-xl">{value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 max-w-2xl mx-auto">

          {/* How it works */}
          <section className="py-8" aria-labelledby="how-it-works">
            <h2 id="how-it-works" className="text-lg font-bold text-neutral-900 dark:text-white text-center mb-6">
              كيف تبدأ؟
            </h2>
            <div className="space-y-3">
              {STEPS.map(({ num, title, desc }) => (
                <div key={num} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-start gap-4">
                  <span className="text-2xl font-black text-neutral-200 dark:text-neutral-700 shrink-0 leading-none mt-0.5">
                    {num}
                  </span>
                  <div>
                    <p className="font-bold text-sm text-neutral-900 dark:text-white mb-1">{title}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="pb-8" aria-labelledby="features">
            <h2 id="features" className="text-lg font-bold text-neutral-900 dark:text-white text-center mb-6">
              لماذا Wibya؟
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
                  <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center mb-3">
                    <Icon size={16} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
                  </div>
                  <p className="font-bold text-xs text-neutral-900 dark:text-white mb-1">{title}</p>
                  <p className="text-[10px] text-neutral-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What can you sell */}
          <section className="pb-8" aria-labelledby="products">
            <h2 id="products" className="text-lg font-bold text-neutral-900 dark:text-white text-center mb-6">
              ماذا يمكنك بيعه؟
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { emoji: '🛍️', label: 'قوالب متاجر' },
                { emoji: '🔧', label: 'أدوات' },
                { emoji: '🎓', label: 'دورات' },
                { emoji: '🎨', label: 'UI Kits' },
                { emoji: '⚡', label: 'SaaS Templates' },
                { emoji: '📦', label: 'أخرى' },
              ].map(({ emoji, label }) => (
                <div key={label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 text-center">
                  <span className="text-2xl block mb-1" aria-hidden="true">{emoji}</span>
                  <p className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Commission */}
          <section className="pb-8">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">ماذا تأخذ من كل بيعة؟</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">سعر منتجك</span>
                  <span className="font-bold text-neutral-900 dark:text-white">$100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">رسوم المعالجة (9%)</span>
                  <span className="text-red-500">-$9</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-900 dark:text-white">ما يصلك</span>
                  <span className="text-green-600 text-lg">$91</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mt-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                💡 الـ 9% تغطي رسوم PayPal و Payoneer فقط — Wibya لا تأخذ ربحاً من مبيعاتك.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="pb-8" aria-labelledby="faq">
            <h2 id="faq" className="text-lg font-bold text-neutral-900 dark:text-white text-center mb-4">
              أسئلة شائعة
            </h2>
            <div className="space-y-3">
              {[
                {
                  q: 'هل التسجيل مجاني؟',
                  a: 'نعم — التسجيل والرفع مجانيان تماماً. لا رسوم شهرية ولا رسوم إخفاء.',
                },
                {
                  q: 'كيف أستلم أموالي؟',
                  a: 'عبر PayPal مباشرة. تطلب السحب من لوحتك والحد الأدنى $10. يصل خلال 1-3 أيام عمل.',
                },
                {
                  q: 'ما هو فحص Claude AI؟',
                  a: 'تحليل تلقائي لجودة منتجك (0-100). المنتجات 70+ تحصل على شارة "جودة Wibya" تزيد ثقة المشترين.',
                },
                {
                  q: 'هل يمكن بيع منتجات غير تقنية؟',
                  a: 'حالياً المنصة متخصصة في المنتجات الرقمية التقنية فقط: قوالب، أدوات، دورات برمجية.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500 shrink-0" aria-hidden="true" />
                    {q}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed ms-5">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-neutral-900 dark:bg-neutral-800 rounded-3xl p-6 text-center mb-6">
            <Package size={28} className="text-white/80 mx-auto mb-3" aria-hidden="true" />
            <h2 className="font-bold text-white text-lg mb-2">جاهز تبدأ؟</h2>
            <p className="text-white/60 text-sm mb-5">
              انضم للمطورين العرب على Wibya وابدأ بتحقيق دخل من كودك اليوم
            </p>
            <Link
              href="/auth/register?role=developer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 font-bold rounded-2xl text-sm hover:bg-neutral-100 transition-colors"
            >
              <Code2 size={16} aria-hidden="true" />
              سجل كمطور مجاناً
            </Link>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}