import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Shield, Scale, CreditCard, RotateCcw, AlertTriangle, Building2 } from 'lucide-react'

const SECTIONS = [
  {
    id: 1,
    icon: Shield,
    title: '1. مقدمة',
    content: `تشكل هذه الشروط اتفاقًا قانونيًا ملزمًا بين المستخدم (مشتري أو بائع) ومنصة Wibya، وتخضع لأحكام القوانين المغربية، خصوصًا القانون رقم 31.08 المتعلق بحماية المستهلك، والقانون رقم 53.05 المتعلق بالتبادل الإلكتروني للمعطيات القانونية.`,
  },
  {
    id: 2,
    icon: Shield,
    title: '2. التسجيل والحساب',
    items: [
      'يلتزم المستخدم بتقديم معلومات صحيحة وكاملة.',
      'يحق للمنصة التحقق من الهوية (KYC) وفق مبدأ "العناية الواجبة".',
      'يمكن تعليق الحساب في حالة الاشتباه في نشاط احتيالي أو مخالف للقانون.',
    ],
  },
  {
    id: 3,
    icon: Scale,
    title: '3. الشروط العامة للبيع',
    content: 'يجب على البائع:',
    items: [
      'تقديم معلومات واضحة وصحيحة حول المنتج (السعر، المواصفات، الصور).',
      'احترام مبدأ الشفافية وحق الإعلام المنصوص عليه في القانون 31.08.',
      'عدم بيع منتجات مقلدة أو غير قانونية.',
      'الالتزام بآجال الشحن المحددة داخل المنصة.',
    ],
  },
  {
    id: 4,
    icon: RotateCcw,
    title: '4. حق التراجع (الإرجاع والاسترداد)',
    content: 'وفقًا للقانون 31.08، يتمتع المستهلك بحق التراجع خلال مدة 7 أيام على الأقل في العقود المبرمة عن بعد. تطبيقًا لذلك:',
    items: [
      'يحق للمشتري إرجاع المنتج خلال 7 أيام من الاستلام.',
      'يتحمل البائع مسؤولية إرجاع المبلغ بعد استلام المنتج.',
      'لا ينطبق الإرجاع على المنتجات الرقمية بعد تحميلها.',
      'لا ينطبق على المنتجات المصممة حسب الطلب أو سريعة التلف.',
    ],
  },
  {
    id: 5,
    icon: CreditCard,
    title: '5. المدفوعات ونظام الحماية',
    content: 'تعتمد Wibya نظام وسيط (Escrow) لحماية الطرفين:',
    items: [
      'يتم الاحتفاظ بالمبلغ بعد الدفع.',
      'يتم تحويله للبائع بعد تأكيد الاستلام من طرف المشتري أو تلقائيًا بعد 7 أيام.',
      'في حالة النزاع: يتم تجميد المبلغ حتى الفصل فيه.',
    ],
  },
  {
    id: 6,
    icon: AlertTriangle,
    title: '6. نظام النزاعات',
    items: [
      'يمكن للمشتري فتح نزاع خلال مدة 7 أيام.',
      'يتم طلب أدلة (صور، رسائل، إثباتات).',
      'تقوم المنصة بدور وسيط للفصل خلال مدة لا تتجاوز 72 ساعة.',
      'القرار النهائي ملزم للطرفين.',
    ],
  },
  {
    id: 7,
    icon: CreditCard,
    title: '7. العمولات والرسوم',
    items: [
      'تفرض المنصة عمولة تتراوح بين 5% و10% على كل عملية بيع.',
      'يمكن فرض رسوم إضافية على السحب السريع والترويج داخل المنصة.',
      'يتم خصم العمولة تلقائيًا قبل تحويل المبلغ للبائع.',
    ],
  },
  {
    id: 8,
    icon: AlertTriangle,
    title: '8. الدفع عند الاستلام (COD)',
    items: [
      'يتحمل المشتري مسؤولية تأكيد الطلب.',
      'في حالة رفض الاستلام يمكن حظر الحساب مؤقتًا.',
      'قد يُطلب من المستخدمين الجدد دفع عربون لتفعيل COD.',
    ],
  },
  {
    id: 9,
    icon: Shield,
    title: '9. المحتوى الخاص بالمستخدم',
    content: 'المستخدم مسؤول عن كل محتوى ينشره. يمنع نشر:',
    items: [
      'محتوى غير قانوني.',
      'منتجات مزيفة أو مقلدة.',
      'معلومات مضللة أو كاذبة.',
    ],
  },
  {
    id: 10,
    icon: Shield,
    title: '10. حماية البيانات الشخصية',
    content: 'تتم معالجة البيانات وفق القوانين المغربية المتعلقة بحماية المعطيات الشخصية. يتم اتخاذ تدابير أمنية لحماية المعلومات.',
  },
  {
    id: 11,
    icon: Scale,
    title: '11. حدود المسؤولية',
    content: 'لا تتحمل المنصة:',
    items: [
      'جودة المنتجات المباعة.',
      'أخطاء البائع في الوصف أو الشحن.',
      'الخسائر غير المباشرة.',
    ],
  },
  {
    id: 12,
    icon: AlertTriangle,
    title: '12. مكافحة الاحتيال',
    content: 'تحتفظ المنصة بحق:',
    items: [
      'مراقبة العمليات المشبوهة.',
      'إلغاء الطلبات المشبوهة.',
      'تجميد الأموال عند الاشتباه.',
    ],
  },
  {
    id: 13,
    icon: Scale,
    title: '13. مخالفة الشروط',
    items: [
      'تعليق الحساب مؤقتًا.',
      'حذف الحساب نهائيًا.',
      'اتخاذ إجراءات قانونية عند الاقتضاء.',
    ],
  },
  {
    id: 14,
    icon: Scale,
    title: '14. القانون الواجب التطبيق',
    content: 'تخضع هذه الشروط للقانون المغربي، خصوصًا:',
    items: [
      'قانون 31.08 المتعلق بحماية المستهلك.',
      'قانون 53.05 المتعلق بالعقود الإلكترونية.',
    ],
  },
  {
    id: 15,
    icon: Scale,
    title: '15. الاختصاص القضائي',
    content: 'تختص المحاكم المغربية بالنظر في النزاعات الناشئة عن استخدام المنصة.',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-6 mb-6 text-center">
          <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale size={24} className="text-neutral-700 dark:text-neutral-300" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            الشروط العامة للاستخدام
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            سوق Wibya — للمشترين والبائعين
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
            <span>آخر تحديث: أبريل 2026</span>
            <span>·</span>
            <span>يخضع للقانون المغربي</span>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            باستخدامك لمنصة Wibya فإنك توافق على هذه الشروط. يُرجى قراءتها بعناية قبل التسجيل.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map(({ id, icon: Icon, title, content, items }) => (
            <section
              key={id}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5"
              aria-labelledby={`section-${id}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
                </div>
                <h2
                  id={`section-${id}`}
                  className="font-bold text-neutral-900 dark:text-white text-sm"
                >
                  {title}
                </h2>
              </div>
              {content && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                  {content}
                </p>
              )}
              {items && (
                <ul className="space-y-2" role="list">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 shrink-0 mt-2" aria-hidden="true" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Company info */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
              <Building2 size={15} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm">معلومات الشركة</h2>
          </div>
          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <p><span className="font-medium text-neutral-900 dark:text-white">اسم المشروع:</span> Wibya</p>
            <p>
              <span className="font-medium text-neutral-900 dark:text-white">البريد الإلكتروني:</span>{' '}
              <a href="mailto:wibya2026@gmail.com" className="text-blue-600 dark:text-blue-400 underline">
                wibya2026@gmail.com
              </a>
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
              ⚠️ سيتم إضافة المعلومات القانونية الكاملة (ICE / RC / العنوان) بعد التسجيل الرسمي لدى السلطات المغربية المختصة.
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