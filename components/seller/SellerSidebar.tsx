'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, Package, ShoppingBag, MessageCircle,
  Wallet, Settings, LogOut, Menu, X, BarChart3,
  PlusCircle, Bell, ChevronRight, Star
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
  { href: '/seller/new-product', icon: PlusCircle, label: 'إضافة منتج' },
  { href: '/seller/orders', icon: ShoppingBag, label: 'الطلبات' },
  { href: '/seller/analytics', icon: BarChart3, label: 'الإحصائيات' },
  { href: '/seller/messages', icon: MessageCircle, label: 'الرسائل' },
  { href: '/seller/wallet', icon: Wallet, label: 'المحفظة' },
  { href: '/seller/ratings', icon: Star, label: 'التقييمات' },
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
      {/* Profile */}
      <div className="p-5 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
            {profile.store_image ? (
              <Image src={profile.store_image} alt="" width={44} height={44} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500">
                {profile.store_name?.charAt(0) || profile.full_name?.charAt(0) || 'W'}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-neutral-900 text-sm truncate">
              {profile.store_name || profile.full_name || 'متجري'}
            </p>
            <p className="text-xs text-brand-600 font-medium mt-0.5">
              {profile.wallet_balance?.toLocaleString() ?? 0} د.م.
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                active
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-neutral-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={17} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 start-0 w-64 bg-white border-e border-neutral-100 flex-col z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100">
          <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-display font-bold text-xs">W</span>
          </div>
          <span className="font-display font-bold text-neutral-900">Wibya</span>
          <span className="text-xs text-neutral-400 font-medium ms-auto">بائع</span>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 h-14 bg-white border-b border-neutral-100">
        <button onClick={() => setOpen(true)} className="p-2 rounded-xl hover:bg-neutral-100">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-neutral-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-display font-bold text-[10px]">W</span>
          </div>
          <span className="font-display font-bold text-sm text-neutral-900">لوحة البائع</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-display font-bold text-xs">W</span>
                </div>
                <span className="font-display font-bold text-neutral-900">Wibya</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-neutral-100">
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
