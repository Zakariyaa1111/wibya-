'use client'
import { useState, useEffect } from 'react'
import { Bell, Menu, X, Moon, Sun, Info, FileText, Shield, Code2, ChevronLeft, ShoppingBag, Heart } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { createClient } from '@/lib/supabase/client'

export function TopBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const { unreadCount } = useNotifications()

  useEffect(() => {
    // Dark mode
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
    // Role
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => setRole(data?.role ?? null))
    })
  }, [])

  function toggleDark() {
    const newDark = !dark
    setDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  const menuLinks = [
    { icon: Code2, label: 'للمطورين', href: '/for-developers' },
    { icon: ShoppingBag, label: 'مشترياتي', href: '/purchases' },
    { icon: Heart, label: 'المحفوظات', href: '/wishlist' },
    { icon: Info, label: 'من نحن', href: '/about' },
    { icon: FileText, label: 'شروط الاستخدام', href: '/terms' },
    { icon: Shield, label: 'سياسة الخصوصية', href: '/privacy' },
    { icon: FileText, label: 'سياسة الكوكيز', href: '/cookies' },
    { icon: Info, label: 'تواصل معنا', href: '/contact' },
  ]

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800/60"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        role="banner"
      >
        <div className="flex items-center justify-between px-4 h-14 max-w-3xl mx-auto">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="فتح القائمة"
              aria-expanded={sidebarOpen}
              aria-controls="sidebar-nav"
            >
              <Menu size={20} className="text-neutral-600 dark:text-neutral-300" aria-hidden="true" />
            </button>
            <Link href="/" aria-label="الصفحة الرئيسية لـ Wibya" className="flex items-center gap-2">
              <Image src="/logo.png" alt="شعار Wibya" width={32} height={32} className="object-contain" />
              <span className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">Wibya</span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            {/* زر بيع منتج للمطورين */}
            {(role === 'developer' || role === 'admin') && (
              <Link
                href="/developer/products/new"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity me-1"
                aria-label="رفع منتج جديد"
              >
                <Code2 size={13} aria-hidden="true" />
                <span>بيع منتج</span>
              </Link>
            )}

            {/* إشعارات */}
            <Link
              href="/notifications"
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
              aria-label={unreadCount > 0 ? `الإشعارات — ${unreadCount} غير مقروء` : 'الإشعارات'}
            >
              <Bell size={20} className="text-neutral-600 dark:text-neutral-300" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-0.5"
                  aria-hidden="true"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar-nav"
        role="navigation"
        aria-label="القائمة الرئيسية"
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-neutral-900 z-50 shadow-2xl transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="شعار Wibya" width={28} height={28} className="object-contain" />
            <span className="font-bold text-neutral-900 dark:text-white">Wibya</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="إغلاق القائمة"
          >
            <X size={16} className="text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
          </button>
        </div>

        {/* Dark mode */}
        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
          <button
            onClick={toggleDark}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label={dark ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
            aria-pressed={dark}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${dark ? 'bg-neutral-700' : 'bg-amber-50'}`}>
                {dark
                  ? <Moon size={16} className="text-blue-400" aria-hidden="true" />
                  : <Sun size={16} className="text-amber-500" aria-hidden="true" />
                }
              </div>
              <div className="text-start">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {dark ? 'الوضع الليلي' : 'الوضع النهاري'}
                </p>
                <p className="text-[10px] text-neutral-400">
                  {dark ? 'انقر للتحويل للنهاري' : 'انقر للتحويل لليلي'}
                </p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full relative shrink-0 transition-colors ${dark ? 'bg-blue-500' : 'bg-neutral-200'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${dark ? 'right-1' : 'left-1'}`} />
            </div>
          </button>
        </div>

        {/* Developer CTA */}
        {!role || role === 'buyer' ? (
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <Link
              href="/auth/register?role=developer"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-neutral-900 dark:bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 dark:bg-neutral-900/10 flex items-center justify-center">
                  <Code2 size={15} className="text-white dark:text-neutral-900" aria-hidden="true" />
                </div>
                <div className="text-start">
                  <p className="text-sm font-bold text-white dark:text-neutral-900">بيع منتجاتك</p>
                  <p className="text-[10px] text-white/60 dark:text-neutral-900/60">انضم كمطور</p>
                </div>
              </div>
              <ChevronLeft size={14} className="text-white/60 dark:text-neutral-900/60 rotate-180" aria-hidden="true" />
            </Link>
          </div>
        ) : null}

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="روابط الموقع">
          {menuLinks.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                  <Icon size={15} className="text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</span>
              </div>
              <ChevronLeft size={14} className="text-neutral-300 dark:text-neutral-600 rotate-180" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 dark:text-neutral-600 text-center">
            Wibya © 2026 — جميع الحقوق محفوظة
          </p>
        </div>
      </aside>
    </>
  )
}