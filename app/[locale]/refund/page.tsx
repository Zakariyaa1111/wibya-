import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle, Mail } from 'lucide-react'
import Link from 'next/link'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-6 mb-6 text-center">
          <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RotateCcw size={24} className="text-neutral-700 dark:text-neutral-300" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            سياسة الإرجاع والاسترداد
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            حقوقك كمشتري محفوظة
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
            <span>وفق القانون المغربي 31.08</span>
            <span>·</span>
            <span>آخر تحديث: أبريل 2026</span>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Clock, value: '7 أيام', label: 'مدة الإرجاع' },
            { icon: CheckCircle, value: 'مجاني', label: 'الإرجاع' },
            { icon: Clock, value: '72 ساعة', label: 'معالجة النزاع' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 text-center">
              <Icon size={18} className="text-neutral-500 mx-auto mb-1.5" aria-hidden="true" />
              <p className="font-bold text-neutral-900 dark:text-white text-sm">{value}</p>
              <p className="text-[10px] text-neutral-400">{label}</p>
            </div>
          ))}
        </div>

        {/* When can you return */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4" aria-labelledby="return-conditions">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <CheckCircle size={15} className="text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <h2 id="return-conditions" className="font-bold text-neutral-900 dark:text-white text-sm">متى يحق لك الإرجاع؟</h2>
          </div>
          <ul className="space-y-2.5" role="list">
            {[
              'المنتج لا يطابق الوصف أو الصور في الإعلان',
              'المنتج وصل تالفًا أو مكسورًا',
              'استلمت منتجًا خاطئًا (غير ما طلبته)',
              'المنتج لا يعمل بشكل صحيح',
              'تراجعت عن الشراء خلال 7 أيام من الاستلام',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
                <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* When you cannot return */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4" aria-labelledby="no-return">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
              <XCircle size={15} className="text-red-500" aria-hidden="true" />
            </div>
            <h2 id="no-return" className="font-bold text-neutral-900 dark:text-white text-sm">استثناءات الإرجاع</h2>
          </div>
          <ul className="space-y-2.5" role="list">
            {[
              'المنتجات الرقمية بعد تحميلها أو استخدامها',
              'المنتجات المصممة خصيصًا حسب الطلب',
              'المنتجات سريعة التلف (مواد غذائية...)',
              'مرور أكثر من 7 أيام من تاريخ الاستلام',
              'المنتج تعرض لتلف بسبب الاستخدام الخاطئ',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
                <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* How to return */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4" aria-labelledby="how-to-return">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
              <RotateCcw size={15} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
            </div>
            <h2 id="how-to-return" className="font-bold text-neutral-900 dark:text-white text-sm">كيف تطلب الإرجاع؟</h2>
          </div>
          <ol className="space-y-3" role="list">
            {[
              { step: '1', text: 'افتح صفحة "طلباتي" واختر الطلب المراد إرجاعه' },
              { step: '2', text: 'اضغط على "فتح نزاع" وحدد سبب الإرجاع' },
              { step: '3', text: 'أرفق صور المنتج كدليل (إلزامي)' },
              { step: '4', text: 'سيتواصل معك فريق Wibya خلال 24 ساعة' },
              { step: '5', text: 'عند الموافقة: أرسل المنتج للبائع وسيتم رد المبلغ خلال 72 ساعة' },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" aria-hidden="true">
                  {step}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Refund timing */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4" aria-labelledby="refund-timing">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
              <Clock size={15} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
            </div>
            <h2 id="refund-timing" className="font-bold text-neutral-900 dark:text-white text-sm">آجال الاسترداد</h2>
          </div>
          <div className="space-y-2">
            {[
              { method: 'الدفع عند الاستلام (COD)', time: 'لا ينطبق الاسترداد النقدي — رصيد في المتجر' },
              { method: 'رصيد المنصة', time: 'فوري بعد الموافقة' },
              { method: 'تحويل بنكي', time: '3-5 أيام عمل بعد الموافقة' },
            ].map(({ method, time }) => (
              <div key={method} className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2.5">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{method}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            ⚠️ إساءة استخدام سياسة الإرجاع (طلبات وهمية متكررة) قد يؤدي إلى تعليق الحساب.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
              <Mail size={15} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm">تواصل معنا</h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            إذا واجهت أي مشكلة في عملية الإرجاع:
          </p>
          <Link href="/contact"
            className="block w-full text-center py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-2xl text-sm hover:opacity-90 transition-opacity">
            تواصل مع الدعم
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