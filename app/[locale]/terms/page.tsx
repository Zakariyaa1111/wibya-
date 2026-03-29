// ===== TERMS PAGE =====
// app/[locale]/terms/page.tsx

import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-5 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">الشروط والأحكام</h1>
        <div className="space-y-4">
          {[
            { title: '1. قبول الشروط', content: 'باستخدامك لمنصة Wibya، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.' },
            { title: '2. حساب المستخدم', content: 'أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. يجب عليك إخطارنا فوراً بأي استخدام غير مصرح به لحسابك.' },
            { title: '3. المنتجات والخدمات', content: 'جميع المنتجات المعروضة على المنصة خاضعة للمراجعة والموافقة من فريق Wibya. نحتفظ بحق رفض أو إزالة أي منتج يخالف سياساتنا.' },
            { title: '4. المعاملات المالية', content: 'جميع الأسعار معروضة بالدرهم المغربي. Wibya تأخذ عمولة على كل صفقة ناجحة وفق النسبة المتفق عليها مع كل بائع.' },
            { title: '5. حماية المستخدم', content: 'نلتزم بحماية بيانات المستخدمين وعدم مشاركتها مع أطراف ثالثة دون موافقة صريحة، وفق سياسة الخصوصية المعتمدة.' },
            { title: '6. إنهاء الحساب', content: 'يحق لـ Wibya إنهاء أو تعليق حساب أي مستخدم في حالة انتهاك هذه الشروط، دون إشعار مسبق.' },
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