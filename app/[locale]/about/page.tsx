import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Shield, Users, Package, Star } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-5 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-neutral-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white dark:text-neutral-900 font-bold text-2xl">W</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">من نحن</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">منصة Wibya للتسوق الإلكتروني المغربي</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4">
          <h2 className="font-bold text-neutral-900 dark:text-white mb-3">رسالتنا</h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
            Wibya منصة مغربية للتجارة الإلكترونية تهدف إلى ربط البائعين والمشترين في المغرب بطريقة سهلة وآمنة وموثوقة. نسعى إلى بناء سوق رقمي مغربي يخدم جميع فئات المجتمع.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: Users, label: 'مستخدم نشط', value: '+1000', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
            { icon: Package, label: 'منتج متاح', value: '+500', color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
            { icon: Shield, label: 'صفقة آمنة', value: '+200', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
            { icon: Star, label: 'تقييم المستخدمين', value: '4.8/5', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}>
                <Icon size={18} />
              </div>
              <div className="font-bold text-lg text-neutral-900 dark:text-white">{value}</div>
              <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
          <h2 className="font-bold text-neutral-900 dark:text-white mb-3">قيمنا</h2>
          <div className="space-y-3">
            {[
              { title: 'الأمان', desc: 'نضمن أمان جميع المعاملات على منصتنا' },
              { title: 'الشفافية', desc: 'نؤمن بالشفافية الكاملة بين البائعين والمشترين' },
              { title: 'الجودة', desc: 'نراجع جميع المنتجات للتأكد من جودتها' },
              { title: 'الدعم', desc: 'فريق دعم متاح لمساعدتك في أي وقت' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium text-sm text-neutral-900 dark:text-white">{title}: </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}