'use client'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { Home, Search, PlusSquare, ShoppingBag, User } from 'lucide-react'

const NAV_ITEMS = [
  { key: 'home', href: '/', icon: Home },
  { key: 'search', href: '/search', icon: Search },
  { key: 'add', href: '/sell/new', icon: PlusSquare },
  { key: 'orders', href: '/orders', icon: ShoppingBag },
  { key: 'profile', href: '/profile', icon: User },
] as const

export function BottomNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link key={key} href={href} className={`nav-item ${active ? 'active' : ''}`}>
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
