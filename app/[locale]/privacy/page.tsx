import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Shield, Eye, Database, Share2, Lock, UserX, Mail, AlertTriangle, Cookie } from 'lucide-react'

const SECTIONS = [
  {
    id: 1,
    icon: Shield,
    title: '1. مقدمة',
    content: `تلتزم منصة Wibya بحماية خصوصية مستخدميها وفق أحكام القانون المغربي رقم 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي، والمرسوم رقم 2-09-165 الصادر بتطبيقه. تصف هذه السياسة كيفية جمع بياناتك، استخدامها، وحمايتها.`,
  },
  {
    id: 2,
    icon: Database,
    title: '2. البيانات التي نجمعها',
    content: 'نجمع الأنواع التالية من البيانات:',
    subsections: [
      {
        subtitle: 'أ — بيانات الحساب',
        items: [
          'الاسم الكامل وعنوان البريد الإلكتروني',
          'رقم الهاتف والمدينة',
          'صورة الملف الشخصي أو المتجر',
          'دور الحساب (مشتري / بائع)',
        ],
      },
      {
        subtitle: 'ب — بيانات التحقق (للبائعين فقط)',
        items: [
          'رقم البطاقة الوطنية — مشفر بـ AES-256',
          'رقم الحساب البنكي RIB — مشفر بـ AES-256',
          'لا يمكن لأي موظف الاطلاع على هذه البيانات بشكل مباشر',
        ],
      },
      {
        subtitle: 'ج — بيانات الاستخدام',
        items: [
          'المنتجات التي تشاهدها وتعجبك',
          'سجل الطلبات والمعاملات',
          'الرسائل بين المستخدمين',
          'عنوان IP وبيانات المتصفح',
        ],
      },
      {
        subtitle: 'د — بيانات Google OAuth (إذا سجلت بـ Google)',
        items: [
          'الاسم والبريد الإلكتروني من حساب Google',
          'صورة الملف الشخصي',
          'لا نحصل على كلمة مرور Google أبدًا',
        ],
      },
    ],
  },
  {
    id: 3,
    icon: Eye,
    title: '3. كيف نستخدم بياناتك',
    items: [
      'تشغيل المنصة وتوفير خدماتها الأساسية',
      'التحقق من هوية البائعين وضمان الأمان',
      'معالجة الطلبات والمدفوعات',
      'إرسال إشعارات عن طلباتك ورسائلك',
      'تحسين تجربة الاستخدام وتخصيص المحتوى',
      'مكافحة الاحتيال والحفاظ على أمان المنصة',
      'الامتثال للالتزامات القانونية',
    ],
  },
  {
    id: 4,
    icon: Share2,
    title: '4. مشاركة البيانات مع أطراف ثالثة',
    content: 'لا نبيع بياناتك أبدًا. نشاركها فقط في الحالات التالية:',
    items: [
      'Supabase (قاعدة البيانات وخدمة المصادقة) — مستضاف في الاتحاد الأوروبي',
      'Google OAuth — لتسهيل تسجيل الدخول فقط',
      'Vercel — لاستضافة الموقع',
      'السلطات القانونية المغربية عند الضرورة القانونية',
      'البائع أو المشتري الطرف الآخر في المعاملة (الاسم والمدينة فقط)',
    ],
  },
  {
    id: 5,
    icon: Lock,
    title: '5. أمان البيانات',
    items: [
      'تشفير HTTPS لكل البيانات المنقولة',
      'تشفير AES-256 للبيانات الحساسة (بطاقة وطنية، RIB)',
      'مصادقة ثنائية متاحة عبر Google',
      'Row Level Security (RLS) على قاعدة البيانات',
      'لا يمكن لأي مستخدم الوصول لبيانات مستخدم آخر',
      'سجلات المراقبة للعمليات الحساسة',
    ],
  },
  {
    id: 6,
    icon: Cookie,
    title: '6. ملفات تعريف الارتباط (Cookies)',
    content: 'نستخدم الأنواع التالية من الكوكيز:',
    subsections: [
      {
        subtitle: 'كوكيز ضرورية (لا يمكن تعطيلها)',
        items: [
          'جلسة تسجيل الدخول',
          'إعدادات اللغة والوضع الليلي',
          'سلة التسوق',
        ],
      },
      {
        subtitle: 'كوكيز الأداء (اختيارية)',
        items: [
          'Vercel Analytics — إحصائيات مجهولة الهوية',
          'لا نستخدم Google Analytics أو أي أداة تتبع إعلاني',
        ],
      },
    ],
  },
  {
    id: 7,
    icon: UserX,
    title: '7. حقوقك (وفق القانون 09-08)',
    content: 'لديك الحقوق التالية فيما يخص بياناتك الشخصية:',
    items: [
      'حق الاطلاع: طلب نسخة من بياناتك الشخصية',
      'حق التصحيح: تصحيح البيانات الخاطئة أو الناقصة',
      'حق الحذف: طلب حذف حسابك وبياناتك نهائيًا',
      'حق الاعتراض: الاعتراض على معالجة بياناتك لأغراض التسويق',
      'حق نقل البيانات: الحصول على بياناتك بصيغة قابلة للقراءة',
      'لممارسة هذه الحقوق: راسلنا على wibya2026@gmail.com',
    ],
  },
  {
    id: 8,
    icon: Database,
    title: '8. مدة الاحتفاظ بالبيانات',
    items: [
      'بيانات الحساب: طوال مدة النشاط + 3 أشهر بعد الحذف',
      'سجلات المعاملات: 5 سنوات (الزام قانوني)',
      'الرسائل: سنة واحدة من تاريخ الإرسال',
      'بيانات التحقق (بطاقة/RIB): حتى طلب الحذف',
      'بيانات الاستخدام المجهولة: سنتان',
    ],
  },
  {
    id: 9,
    icon: Shield,
    title: '9. حماية القاصرين',
    content: 'منصة Wibya موجهة للأشخاص الذين تجاوزوا سن 18 سنة. لا نجمع بيانات القاصرين عن قصد. إذا اكتشفنا أن مستخدمًا دون 18 سنة قد سجل، سنحذف حسابه فورًا.',
  },
  {
    id: 10,
    icon: AlertTriangle,
    title: '10. التغييرات على هذه السياسة',
    content: 'قد نحدث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار داخل التطبيق قبل 15 يوم من تطبيقها. استمرار استخدامك للمنصة بعد التحديث يُعدّ قبولاً للسياسة الجديدة.',
  },
  {
    id: 11,
    icon: Mail,
    title: '11. التواصل بخصوص الخصوصية',
    content: 'لأي استفسار أو طلب متعلق بخصوصيتك:',
    items: [
      'البريد الإلكتروني: wibya2026@gmail.com',
      'سنرد خلال 48 ساعة في أيام العمل',
      'يمكنك أيضًا التقدم بشكوى إلى اللجنة الوطنية لمراقبة حماية المعطيات الشخصية (CNDP)',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-6 mb-6 text-center">
          <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-neutral-700 dark:text-neutral-300" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            سياسة الخصوصية
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            كيف نجمع بياناتك ونحميها
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 flex-wrap">
            <span>آخر تحديث: أبريل 2026</span>
            <span>·</span>
            <span>الإصدار 1.0</span>
            <span>·</span>
            <span>وفق القانون المغربي 09-08</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: Lock, title: 'لا نبيع بياناتك', desc: 'أبدًا لأي طرف ثالث' },
            { icon: Shield, title: 'تشفير AES-256', desc: 'للبيانات الحساسة' },
            { icon: UserX, title: 'حق الحذف', desc: 'احذف حسابك متى شئت' },
            { icon: Eye, title: 'شفافية كاملة', desc: 'نخبرك بكل شيء' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 text-center">
              <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Icon size={16} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
              </div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">{title}</p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map(({ id, icon: Icon, title, content, items, subsections }) => (
            <section
              key={id}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5"
              aria-labelledby={`privacy-section-${id}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
                </div>
                <h2
                  id={`privacy-section-${id}`}
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
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0 mt-2" aria-hidden="true" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {subsections && (
                <div className="space-y-4">
                  {subsections.map((sub, si) => (
                    <div key={si}>
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 bg-neutral-50 dark:bg-neutral-800 px-3 py-1.5 rounded-xl inline-block">
                        {sub.subtitle}
                      </p>
                      <ul className="space-y-1.5 mt-2" role="list">
                        {sub.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0 mt-2" aria-hidden="true" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* CNDP note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mt-4">
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            <span className="font-bold">ℹ️ CNDP:</span> منصة Wibya تعمل على التسجيل لدى اللجنة الوطنية لمراقبة حماية المعطيات الشخصية وفق المتطلبات القانونية المغربية.
          </p>
        </div>

        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-6">
          Wibya © 2026 — جميع الحقوق محفوظة
        </p>
      </main>
      <BottomNav />
    </div>
  )
}