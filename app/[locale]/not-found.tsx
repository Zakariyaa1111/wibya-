import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Search, Home, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-8xl font-black text-neutral-200 dark:text-neutral-800 mb-6">404</p>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
          الصفحة غير موجودة
        </h1>
        <p className="text-neutral-400 text-sm mb-8 max-w-xs">
          ربما تم حذف هذه الصفحة أو تغيير رابطها
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/"
            className="flex items-center justify-center gap-2 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl text-sm">
            <Home size={16} aria-hidden="true" />
            الصفحة الرئيسية
          </Link>
          <Link href="/search"
            className="flex items-center justify-center gap-2 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-2xl text-sm">
            <Search size={16} aria-hidden="true" />
            البحث عن منتج
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}