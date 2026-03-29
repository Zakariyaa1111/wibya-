'use client'
import { useState, useEffect } from 'react'
import { Search, Bell, User, Menu, X, Moon, Sun, Info, FileText, Shield, Star, Store, ChevronLeft } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { useRouter } from '@/lib/i18n/navigation'

export function TopBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const router = useRouter()

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

  const menuItems = [
    { icon: Moon, label: 'الوضع الليلي', action: toggleDark, toggle: true },
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
        className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <Menu size={20} className="text-neutral-600 dark:text-neutral-400" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-xl flex items-center justify-center">
                <span className="text-white dark:text-neutral-900 font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">Wibya</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/search" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <Search size={20} className="text-neutral-600 dark:text-neutral-400" />
            </Link>
            <Link href="/notifications" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative">
              <Bell size={20} className="text-neutral-600 dark:text-neutral-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
            </Link>
            <Link href="/profile" className="p-2">
              <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                <User size={16} className="text-neutral-500 dark:text-neutral-400" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-neutral-900 z-50 shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-xl flex items-center justify-center">
              <span className="text-white dark:text-neutral-900 font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-neutral-900 dark:text-white">Wibya</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X size={18} className="text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map(({ icon: Icon, label, href, action, toggle }) => (
            toggle ? (
              <button key={label} onClick={() => { action?.(); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-start">
                <div className="flex items-center gap-3">
                  {dark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-neutral-500" />}
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {dark ? 'الوضع النهاري' : 'الوضع الليلي'}
                  </span>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${dark ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200'} relative`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-transform bg-white dark:bg-neutral-900 ${dark ? 'translate-x-1' : 'translate-x-5'}`} />
                </div>
              </button>
            ) : (
              <Link key={label} href={href!} onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-neutral-500 dark:text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</span>
                </div>
                <ChevronLeft size={16} className="text-neutral-300 dark:text-neutral-600 rotate-180" />
              </Link>
            )
          ))}
        </nav>
      </aside>
    </>
  )
}