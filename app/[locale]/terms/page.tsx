import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Scale, Shield, CreditCard, RotateCcw, AlertTriangle, Building2, Code2 } from 'lucide-react'

const SECTIONS = [
  {
    id: 1, icon: Shield,
    title: '1. مقدمة',
    content: 'تشكل هذه الشروط اتفاقًا قانونيًا ملزمًا بين المستخدم (مشتري أو مطور) ومنصة Wibya لسوق المنتجات الرقمية، وتخضع للقوانين المغربية، خصوصًا القانون 31.08 (حماية المستهلك) والقانون 53.05 (التبادل الإلكتروني) والقانون 09-08 (حماية البيانات).',
  },
  {
    id: 2, icon: Code2,
    title: '2. المنتجات الرقمية',
    items: [
      'Wibya سوق للمنتجات الرقمية فقط: قوالب، أدوات، دورات تعليمية، وUI Kits.',
      'كل منتج يخضع لفحص جودة تلقائي بواسطة Claude AI قبل النشر.',
      'المنتجات التي تحصل على 70/100 أو أكثر تحصل على شارة "جودة Wibya".',
      'الشارة تقرير جودة — وليست ضماناً أمنياً كاملاً.',
      'المطور مسؤول عن دقة الوصف ومطابقته للمنتج الفعلي.',
    ],
  },
  {
    id: 3, icon: Shield,
    title: '3. التسجيل والحسابات',
    items: [
      'يلتزم المستخدم بتقديم معلومات صحيحة وكاملة.',
      'الأدوار المتاحة: مشتري، مطور، أدمن.',
      'المطورون يوافقون على شروط البائع عند التسجيل.',
      'يحق للمنصة تعليق أي حساب مخالف للشروط.',
    ],
  },
  {
    id: 4, icon: CreditCard,
    title: '4. المدفوعات ونظام Escrow',
    items: [
      'الدفع عبر PayPal فقط بالدولار الأمريكي.',
      'عمولة المنصة 9% تشمل رسوم معالجة الدفع — لا ربح للمنصة.',
      'المبلغ يُحتجز في Escrow لمدة 48 ساعة بعد الشراء.',
      'بعد 48 ساعة بدون نزاع يُحول المبلغ تلقائياً للمطور.',
      'في حالة نزاع: يُجمد المبلغ حتى الفصل فيه.',
    ],
  },
  {
    id: 5, icon: RotateCcw,
    title: '5. سياسة الاسترداد',
    items: [
      'لا يوجد استرداد للمنتجات الرقمية بعد التحميل — وفق القانون 31.08.',
      'المنتج مفحوص مسبقاً بـ Claude AI مما يقلل مخاطر الشراء.',
      'يمكن فتح نزاع خلال 48 ساعة من الشراء إذا كان المنتج لا يعمل.',
      'يفصل الأدمن في النزاع خلال 4 أيام عمل.',
    ],
  },
  {
    id: 6, icon: AlertTriangle,
    title: '6. حقوق الملكية الفكرية',
    items: [
      'المطور يضمن أن المنتج من إنتاجه الأصلي أو لديه حق توزيعه.',
      'المشتري يحصل على ترخيص استخدام شخصي أو تجاري حسب ما يحدده المطور.',
      'يُمنع إعادة بيع أو توزيع المنتج بدون إذن صريح من المطور.',
      'المنصة غير مسؤولة عن انتهاكات حقوق الملكية من طرف المطورين.',
    ],
  },
  {
    id: 7, icon: Shield,
    title: '7. روابط التحميل',
    items: [
      'روابط التحميل آمنة ومؤقتة (صالحة 24 ساعة).',
      'الحد الأقصى 3 تحميلات لكل مشتري لكل منتج.',
      'الرابط مرتبط بحساب المشتري فقط — لا يمكن مشاركته.',
      'في حالة فقدان الرابط: تواصل مع الدعم.',
    ],
  },
  {
    id: 8, icon: AlertTriangle,
    title: '8. مكافحة الاحتيال',
    items: [
      'يُمنع رفع منتجات مسروقة أو منتهكة لحقوق الملكية.',
      'يُمنع فتح نزاعات كاذبة أو بدون مبرر.',
      'يُمنع التلاعب في نظام التقييمات.',
      'المخالفات تؤدي لتعليق الحساب أو حذفه نهائياً.',
    ],
  },
  {
    id: 9, icon: Scale,
    title: '9. حدود المسؤولية',
    content: 'Wibya وسيط تقني بين المطور والمشتري. لا تتحمل المنصة مسؤولية جودة المنتجات أو أخطاء المطورين أو الخسائر غير المباشرة. تقرير Claude هو تحليل جودة تلقائي وليس ضماناً.',
  },
  {
    id: 10, icon: Scale,
    title: '10. القانون الواجب التطبيق',
    items: [
      'تخضع هذه الشروط للقانون المغربي.',
      'قانون 31.08 — حماية المستهلك.',
      'قانون 53.05 — العقود الإلكترونية.',
      'قانون 09-08 — حماية البيانات الشخصية.',
      'تختص المحاكم المغربية بالنظر في النزاعات.',
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-4 max-w-2xl mx-auto">

        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-6 mb-6 text-center">
          <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale size={24} className="text-neutral-700 dark:text-neutral-300" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">شروط الاستخدام</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            Wibya — سوق المنتجات الرقمية
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 flex-wrap">
            <span>آخر تحديث: أبريل 2026</span>
            <span>·</span>
            <span>الإصدار 2.0</span>
            <span>·</span>
            <span>القانون المغربي</span>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            باستخدامك لمنصة Wibya فإنك توافق على هذه الشروط. يُرجى قراءتها بعناية.
          </p>
        </div>

        <div className="space-y-4">
          {SECTIONS.map(({ id, icon: Icon, title, content, items }) => (
            <section key={id}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5"
              aria-labelledby={`section-${id}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
                </div>
                <h2 id={`section-${id}`} className="font-bold text-neutral-900 dark:text-white text-sm">
                  {title}
                </h2>
              </div>
              {content && <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">{content}</p>}
              {items && (
                <ul className="space-y-2" role="list">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0 mt-2" aria-hidden="true" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
              <Building2 size={15} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm">معلومات الشركة</h2>
          </div>
          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <p><span className="font-medium text-neutral-900 dark:text-white">المنصة:</span> Wibya — سوق المنتجات الرقمية</p>
            <p>
              <span className="font-medium text-neutral-900 dark:text-white">البريد:</span>{' '}
              <a href="mailto:wibya2026@gmail.com" className="text-blue-600 dark:text-blue-400 underline">
                wibya2026@gmail.com
              </a>
            </p>
            <p className="text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 mt-2">
              ⚠️ سيتم إضافة ICE/RC بعد التسجيل الرسمي.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-6">
          Wibya © 2026 — جميع الحقوق محفوظة
        </p>
      </main>
      <BottomNav />
    </div>
  )
}