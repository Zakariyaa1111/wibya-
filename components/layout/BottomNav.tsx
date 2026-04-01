'use client'
import { useEffect, useState } from 'react'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { Home, Search, ShoppingBag, User, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function BottomNav() {
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => setRole(data?.role ?? null))
    })
  }, [])

  const baseItems = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/search', icon: Search, label: 'بحث' },
    { href: '/orders', icon: ShoppingBag, label: 'طلباتي' },
    { href: '/profile', icon: User, label: 'حسابي' },
  ]

  // البائع عنده زر إضافي للوحة التحكم
  const sellerItem = { href: '/seller/dashboard', icon: Store, label: 'متجري' }

  const items = role === 'seller'
    ? [baseItems[0], baseItems[1], sellerItem, baseItems[2], baseItems[3]]
    : baseItems

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-around h-16"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 transition-colors duration-150 min-w-[48px] ${
              active ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
            }`}>
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}