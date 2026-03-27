'use client'
import { Search, Bell, User } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'

export function TopBar() {
  return (
    <header
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neutral-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-bold text-lg text-neutral-900 tracking-tight">
            Wibya
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/search" className="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <Search size={20} className="text-neutral-600" />
          </Link>
          <Link href="/notifications" className="p-2 rounded-xl hover:bg-neutral-100 transition-colors relative">
            <Bell size={20} className="text-neutral-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
          </Link>
          <Link href="/profile" className="p-2">
            <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-neutral-500" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}