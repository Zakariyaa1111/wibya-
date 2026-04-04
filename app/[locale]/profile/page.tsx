'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'
import {
  User, Mail, MapPin, Code2, LogOut,
  ShoppingBag, Heart, Bell, Shield,
  ChevronLeft, Edit2, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ purchases: 0, wishlist: 0 })
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const [{ data: p }, { count: purchases }, { count: wishlist }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('purchases').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id).eq('status', 'completed'),
        supabase.from('wishlist').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ])

      setProfile(p)
      setStats({ purchases: purchases ?? 0, wishlist: wishlist ?? 0 })
      setLoading(false)
    }
    load()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('تم تسجيل الخروج')
    router.push('/ar')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  const isDeveloper = profile?.role === 'developer' || profile?.role === 'admin'
  const displayName = profile?.store_name || profile?.full_name || 'مستخدم'

  const menuItems = [
    { icon: ShoppingBag, label: 'مشترياتي', sub: `${stats.purchases} منتج`, href: '/purchases' },
    { icon: Heart, label: 'المحفوظات', sub: `${stats.wishlist} منتج`, href: '/wishlist' },
    { icon: Bell, label: 'الإشعارات', sub: '', href: '/notifications' },
    ...(isDeveloper ? [
      { icon: Code2, label: 'لوحة المطور', sub: '', href: '/developer/dashboard' },
    ] : [
      { icon: Code2, label: 'أصبح مطوراً', sub: 'بيع منتجاتك', href: '/for-developers' },
    ]),
    { icon: Shield, label: 'الخصوصية', sub: '', href: '/privacy' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 max-w-lg mx-auto">

        {/* Profile Header */}
        <div className="bg-neutral-900 px-4 pt-8 pb-10 text-center relative">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3 text-3xl font-black text-white">
            {profile?.store_image
              ? <img src={profile.store_image} alt={displayName} className="w-full h-full object-cover rounded-2xl" />
              : displayName.charAt(0)
            }
          </div>
          <h1 className="text-lg font-bold text-white">{displayName}</h1>
          <p className="text-white/50 text-xs mt-0.5">{user?.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
              profile?.role === 'admin' ? 'bg-red-500/20 text-red-300' :
              profile?.role === 'developer' ? 'bg-blue-500/20 text-blue-300' :
              'bg-white/10 text-white/60'
            }`}>
              {profile?.role === 'admin' ? '👑 أدمن' :
               profile?.role === 'developer' ? '💻 مطور' : '🛍️ مشتري'}
            </span>
            {profile?.country && (
              <span className="text-[10px] text-white/40 flex items-center gap-1">
                <MapPin size={10} aria-hidden="true" />
                {profile.country}
              </span>
            )}
          </div>
        </div>

        <div className="px-4 -mt-4">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { icon: ShoppingBag, value: stats.purchases, label: 'مشتريات', href: '/purchases' },
              { icon: Heart, value: stats.wishlist, label: 'محفوظ', href: '/wishlist' },
            ].map(({ icon: Icon, value, label, href }) => (
              <Link key={label} href={href}>
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 text-center hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
                  <Icon size={18} className="text-neutral-400 mx-auto mb-1.5" aria-hidden="true" />
                  <p className="text-xl font-bold text-neutral-900 dark:text-white">{value}</p>
                  <p className="text-xs text-neutral-400">{label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Menu */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden mb-4">
            {menuItems.map(({ icon: Icon, label, sub, href }, i) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-50 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{label}</p>
                  {sub && <p className="text-xs text-neutral-400">{sub}</p>}
                </div>
                <ChevronLeft size={14} className="text-neutral-300 dark:text-neutral-600 rotate-180" aria-hidden="true" />
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden mb-4">
            {[
              { label: 'شروط الاستخدام', href: '/terms' },
              { label: 'سياسة الخصوصية', href: '/privacy' },
              { label: 'سياسة الكوكيز', href: '/cookies' },
              { label: 'تواصل معنا', href: '/contact' },
            ].map(({ label, href }) => (
              <Link key={href} href={href}
                className="flex items-center justify-between px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
                <ExternalLink size={13} className="text-neutral-300 dark:text-neutral-600" aria-hidden="true" />
              </Link>
            ))}
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-200 dark:border-red-900/50 text-red-500 font-medium rounded-2xl text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mb-4"
          >
            <LogOut size={16} aria-hidden="true" />
            تسجيل الخروج
          </button>

          <p className="text-center text-xs text-neutral-300 dark:text-neutral-700">
            Wibya © 2026 — v2.0
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}