'use client'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { Home, Search, PlusSquare, ShoppingBag, User } from 'lucide-react'

const NAV_ITEMS = [
  { key: 'home', href: '/', icon: Home },
  { key: 'search', href: '/search', icon: Search },
  { key: 'add', href: '/seller/products/new', icon: PlusSquare },
  { key: 'orders', href: '/orders', icon: ShoppingBag },
  { key: 'profile', href: '/profile', icon: User },
] as const

export function BottomNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-neutral-100 flex items-center justify-around h-16"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
    >
      {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={key}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors duration-150 ${
              active ? 'text-neutral-900' : 'text-neutral-400'
            }`}
          >
            <Icon
              size={24}
              strokeWidth={active ? 2.5 : 1.8}
              className={active ? 'text-neutral-900' : 'text-neutral-400'}
            />
            <span className={`text-[10px] font-medium ${active ? 'text-neutral-900' : 'text-neutral-400'}`}>
              {t(key)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}