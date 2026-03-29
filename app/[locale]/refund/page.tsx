// ===== REFUND PAGE =====
// app/[locale]/refund/page.tsx

import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-5 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">سياسة الإرجاع والاسترداد</h1>
        <div className="space-y-4">
          {[
            { title: 'شروط الإرجاع', content: 'يمكن إرجاع المنتجات خلال 7 أيام من تاريخ الاستلام في حالة وجود عيب في المنتج أو عدم مطابقته للوصف المنشور.' },
            { title: 'حالات الإرجاع المقبولة', content: 'المنتج معيب أو تالف — المنتج لا يطابق الوصف — المنتج الخاطئ — المنتج لم يصل.' },
            { title: 'حالات الإرجاع المرفوضة', content: 'تغيير الرأي بعد الشراء — المنتجات المستخدمة أو التالفة من طرف المشتري — المنتجات الرقمية بعد التحميل.' },
            { title: 'إجراءات الإرجاع', content: 'تواصل مع البائع أولاً عبر المنصة. إذا لم يتم الحل خلال 48 ساعة، تواصل مع فريق Wibya لفتح نزاع.' },
            { title: 'استرداد المبلغ', content: 'بعد تأكيد الإرجاع، يتم استرداد المبلغ خلال 3-7 أيام عمل إلى نفس طريقة الدفع الأصلية.' },
          ].map(({ title, content }) => (
            <div key={title} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
              <h2 className="font-bold text-sm text-neutral-900 dark:text-white mb-2">{title}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}