'use client'
import { useState, useEffect } from 'react'
import { Search, Bell, User, Menu, X, Moon, Sun, Info, FileText, Shield, Star, Store, ChevronLeft } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'

export function TopBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  function toggleDark() {
    const newDark = !dark
    setDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  const menuLinks = [
    { icon: Store, label: 'المتاجر', href: '/stores' },
    { icon: Star, label: 'قيّم موقعنا', href: '/rate' },
    { icon: Info, label: 'من نحن', href: '/about' },
    { icon: FileText, label: 'الشروط والأحكام', href: '/terms' },
    { icon: Shield, label: 'سياسة الخصوصية', href: '/privacy' },
    { icon: FileText, label: 'سياسة الإرجاع', href: '/refund' },
    { icon: Info, label: 'تواصل معنا', href: '/contact' },
  ]

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800/60"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Menu size={20} className="text-neutral-600 dark:text-neutral-300" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-xl flex items-center justify-center">
                <span className="text-white dark:text-neutral-900 font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">Wibya</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <Link href="/search" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <Search size={20} className="text-neutral-600 dark:text-neutral-300" />
            </Link>
            <Link href="/notifications" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative">
              <Bell size={20} className="text-neutral-600 dark:text-neutral-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
            <Link href="/profile" className="p-2">
              <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                <User size={16} className="text-neutral-500 dark:text-neutral-300" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-neutral-900 z-50 shadow-2xl transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-xl flex items-center justify-center">
              <span className="text-white dark:text-neutral-900 font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-neutral-900 dark:text-white">Wibya</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={16} className="text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        {/* Dark mode toggle — مستقل واضح */}
        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
          <button
            onClick={toggleDark}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${dark ? 'bg-neutral-800 dark:bg-neutral-700' : 'bg-amber-50'}`}>
                {dark
                  ? <Moon size={16} className="text-blue-400" />
                  : <Sun size={16} className="text-amber-500" />
                }
              </div>
              <div className="text-start">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {dark ? 'الوضع الليلي' : 'الوضع النهاري'}
                </p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  {dark ? 'انقر للتحويل للنهاري' : 'انقر للتحويل لليلي'}
                </p>
              </div>
            </div>
            {/* Toggle switch */}
            <div className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${dark ? 'bg-blue-500' : 'bg-neutral-200 dark:bg-neutral-600'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${dark ? 'right-1' : 'left-1'}`} />
            </div>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuLinks.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                  <Icon size={15} className="text-neutral-500 dark:text-neutral-400" />
                </div>
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</span>
              </div>
              <ChevronLeft size={14} className="text-neutral-300 dark:text-neutral-600 rotate-180" />
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 dark:text-neutral-600 text-center">Wibya © 2026</p>
        </div>
      </aside>
    </>
  )
}