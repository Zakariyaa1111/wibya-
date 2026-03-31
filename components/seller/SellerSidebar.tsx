'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, Package, ShoppingBag, MessageCircle,
  Wallet, Settings, LogOut, Menu, X, BarChart3,
  PlusCircle, Bell, ChevronRight, Star, Shield, Crown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
  full_name: string | null
  store_name: string | null
  store_image: string | null
  wallet_balance: number
  role: string
}

const NAV = [
  { href: '/seller/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { href: '/seller/products', icon: Package, label: 'المنتجات' },
  { href: '/seller/products/new', icon: PlusCircle, label: 'إضافة منتج' },
  { href: '/seller/orders', icon: ShoppingBag, label: 'الطلبات' },
  { href: '/seller/analytics', icon: BarChart3, label: 'الإحصائيات' },
  { href: '/seller/messages', icon: MessageCircle, label: 'الرسائل' },
  { href: '/seller/wallet', icon: Wallet, label: 'المحفظة' },
  { href: '/seller/ratings', icon: Star, label: 'التقييمات' },
  { href: '/seller/verification', icon: Shield, label: 'التوثيق' },
  { href: '/seller/premium', icon: Crown, label: 'Premium ⭐' },
  { href: '/seller/notifications', icon: Bell, label: 'الإشعارات' },
  { href: '/seller/settings', icon: Settings, label: 'الإعدادات' },
]

export function SellerSidebar({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
            {profile.store_image ? (
              <Image src={profile.store_image} alt="" width={44} height={44} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500">
                {profile.store_name?.charAt(0) || profile.full_name?.charAt(0) || 'W'}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-neutral-900 dark:text-white text-sm truncate">
              {profile.store_name || profile.full_name || 'متجري'}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
              {profile.wallet_balance?.toLocaleString() ?? 0} د.م.
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                active
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
              }`}>
              <Icon size={17} strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors">
          <LogOut size={17} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex fixed inset-y-0 start-0 w-64 bg-white dark:bg-neutral-900 border-e border-neutral-100 dark:border-neutral-800 flex-col z-40">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <Image src="/logo.png" alt="Wibya" width={30} height={30} className="object-contain" />
          <span className="font-bold text-neutral-900 dark:text-white">Wibya</span>
          <span className="text-xs text-neutral-400 font-medium ms-auto">بائع</span>
        </div>
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 h-14 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <button onClick={() => setOpen(true)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Menu size={20} className="text-neutral-600 dark:text-neutral-400" />
        </button>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Wibya" width={26} height={26} className="object-contain" />
          <span className="font-bold text-sm text-neutral-900 dark:text-white">لوحة البائع</span>
        </div>
        <div className="w-10" />
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-white dark:bg-neutral-900 h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Image src="/logo.png" alt="Wibya" width={28} height={28} className="object-contain" />
                <span className="font-bold text-neutral-900 dark:text-white">Wibya</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X size={18} className="text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}