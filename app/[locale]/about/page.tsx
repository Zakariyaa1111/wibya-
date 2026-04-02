import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Shield, Users, TrendingUp, Heart, Star, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const VALUES = [
  { icon: Shield, title: 'الأمان أولاً', desc: 'نحمي بياناتك وأموالك بأحدث تقنيات التشفير' },
  { icon: Users, title: 'مجتمع موثوق', desc: 'نظام تحقق صارم لضمان بائعين حقيقيين وموثوقين' },
  { icon: Heart, title: 'تجربة مغربية', desc: 'منصة مصممة خصيصًا للسوق والمستهلك المغربي' },
  { icon: TrendingUp, title: 'نمو مستمر', desc: 'نطور المنصة باستمرار بناءً على آراء المستخدمين' },
]

const STATS = [
  { value: '2026', label: 'سنة التأسيس' },
  { value: '🇲🇦', label: 'صنع في المغرب' },
  { value: '2', label: 'لغتان' },
  { value: '24/7', label: 'دعم متواصل' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24">

        {/* Hero */}
        <div className="bg-neutral-900 dark:bg-neutral-950 text-white px-6 pt-10 pb-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24" />
          </div>
          <div className="relative">
            <Image src="/logo.png" alt="شعار Wibya" width={64} height={64} className="object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3">من نحن</h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm mx-auto">
              Wibya هي منصة تجارة إلكترونية مغربية تجمع البائعين والمشترين في فضاء آمن وموثوق
            </p>
          </div>
        </div>

        <div className="px-4 max-w-2xl mx-auto">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 -mt-6 mb-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 text-center shadow-sm">
                <p className="font-bold text-neutral-900 dark:text-white text-sm">{value}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* Mission */}
          <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4" aria-labelledby="mission">
            <h2 id="mission" className="font-bold text-neutral-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <Star size={15} className="text-amber-500" aria-hidden="true" />
              مهمتنا
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              نؤمن بأن كل مغربي يستحق الوصول إلى سوق رقمي آمن وعادل. نهدف إلى تمكين البائعين الصغار والمتوسطين من بيع منتجاتهم بكل ثقة، وتوفير تجربة شراء مريحة وموثوقة للمشترين.
            </p>
          </section>

          {/* Values */}
          <section className="mb-4" aria-labelledby="values">
            <h2 id="values" className="font-bold text-neutral-900 dark:text-white text-sm mb-3 px-1">قيمنا</h2>
            <div className="grid grid-cols-2 gap-3">
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
                  <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center mb-3">
                    <Icon size={16} className="text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white text-xs mb-1">{title}</h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Technology */}
          <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 mb-4" aria-labelledby="tech">
            <h2 id="tech" className="font-bold text-neutral-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <Package size={15} className="text-neutral-500" aria-hidden="true" />
              التقنية التي نعتمد عليها
            </h2>
            <div className="flex flex-wrap gap-2">
              {['Next.js 14', 'Supabase', 'Vercel', 'Tailwind CSS', 'AES-256', 'Google OAuth'].map(tech => (
                <span key={tech} className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-3 py-1.5 rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/contact"
              className="text-center py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-2xl text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              تواصل معنا
            </Link>
            <Link href="/"
              className="text-center py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-2xl text-sm hover:opacity-90 transition-opacity">
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}