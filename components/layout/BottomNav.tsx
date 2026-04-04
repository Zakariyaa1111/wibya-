'use client'
import { useEffect, useState } from 'react'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { Home, Search, ShoppingBag, User, Code2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

let cachedRole: string | null = null
let cacheTime = 0
const ROLE_CACHE_TTL = 10 * 60 * 1000

export function BottomNav() {
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(cachedRole)

  useEffect(() => {
    if (cachedRole && Date.now() - cacheTime < ROLE_CACHE_TTL) {
      setRole(cachedRole); return
    }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          cachedRole = data?.role ?? null
          cacheTime = Date.now()
          setRole(cachedRole)
        })
    })
  }, [])

  const baseItems = [
    { href: '/', icon: Home, label: 'الرئيسية', labelFr: 'Accueil' },
    { href: '/search', icon: Search, label: 'بحث', labelFr: 'Recherche' },
    { href: '/purchases', icon: ShoppingBag, label: 'مشترياتي', labelFr: 'Achats' },
    { href: '/profile', icon: User, label: 'حسابي', labelFr: 'Profil' },
  ]

  const developerItem = {
    href: '/developer/dashboard',
    icon: Code2,
    label: 'لوحتي',
    labelFr: 'Dashboard'
  }

  const items = role === 'developer' || role === 'admin'
    ? [baseItems[0], baseItems[1], developerItem, baseItems[2], baseItems[3]]
    : baseItems

  const isAr = !pathname.startsWith('/fr')

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-around h-16"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label={isAr ? 'التنقل الرئيسي' : 'Navigation principale'}
      role="navigation"
    >
      {items.map(({ href, icon: Icon, label, labelFr }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        const displayLabel = isAr ? label : labelFr
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 transition-colors duration-150 min-w-[48px] min-h-[44px] justify-center ${
              active
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-400 dark:text-neutral-500'
            }`}
            aria-label={displayLabel}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} aria-hidden="true" />
            <span className="text-[10px] font-medium">{displayLabel}</span>
          </Link>
        )
      })}
    </nav>
  )
}