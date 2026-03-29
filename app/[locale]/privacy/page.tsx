import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-5 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">سياسة الخصوصية</h1>
        <div className="space-y-4">
          {[
            { title: 'جمع البيانات', content: 'نجمع المعلومات التي تقدمها عند إنشاء حسابك، مثل الاسم والبريد الإلكتروني ورقم الهاتف. كما نجمع بيانات استخدام المنصة لتحسين تجربتك.' },
            { title: 'استخدام البيانات', content: 'نستخدم بياناتك لتشغيل المنصة، معالجة الطلبات، إرسال الإشعارات، وتحسين خدماتنا. لا نبيع بياناتك لأطراف ثالثة.' },
            { title: 'حماية البيانات', content: 'نستخدم تقنيات تشفير متقدمة لحماية بياناتك. يتم تخزين البيانات على خوادم آمنة مع إجراءات حماية صارمة.' },
            { title: 'ملفات تعريف الارتباط', content: 'نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربة التصفح وحفظ تفضيلاتك. يمكنك تعطيلها من إعدادات المتصفح.' },
            { title: 'حقوقك', content: 'يحق لك الوصول إلى بياناتك، تصحيحها، أو حذفها في أي وقت عبر إعدادات حسابك أو التواصل مع فريق الدعم.' },
            { title: 'التواصل معنا', content: 'لأي استفسار حول سياسة الخصوصية، تواصل معنا عبر البريد الإلكتروني: privacy@wibya.com' },
          ].map(({ title, content }) => (
            <div key={title} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
              <h2 className="font-bold text-sm text-neutral-900 dark:text-white mb-2">{title}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-600 text-center mt-6">آخر تحديث: مارس 2026</p>
      </main>
      <BottomNav />
    </div>
  )
}