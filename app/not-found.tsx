import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center px-6 text-center">
      <Image src="/logo.png" alt="Wibya" width={64} height={64} className="object-contain mb-6 opacity-50" />
      <h1 className="text-8xl font-bold text-neutral-200 dark:text-neutral-800 mb-4">404</h1>
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">الصفحة غير موجودة</h2>
      <p className="text-neutral-400 dark:text-neutral-500 text-sm mb-8 max-w-xs">
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها
      </p>
      <div className="flex gap-3">
        <Link href="/"
          className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-2xl text-sm hover:opacity-90 transition-opacity">
          العودة للرئيسية
        </Link>
        <Link href="/search"
          className="px-6 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-2xl text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          البحث
        </Link>
      </div>
    </div>
  )
}