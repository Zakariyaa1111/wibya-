'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'
import Image from 'next/image'
import {
  Code2, LogOut, ShoppingBag, Heart, Bell, Shield,
  ChevronLeft, ExternalLink, BadgeCheck, Star,
  TrendingUp, Settings, MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ purchases: 0, wishlist: 0 })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/ar/auth/login'; return }
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
    window.location.href = '/ar'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  const isDeveloper = profile?.role === 'developer' || profile?.role === 'admin'
  const isAdmin = profile?.role === 'admin'
  const displayName = profile?.store_name || profile?.full_name || 'مستخدم'
  const initials = displayName.charAt(0).toUpperCase()

  const roleConfig = {
    admin: { label: 'أدمن', emoji: '👑', bg: 'bg-red-500/20', text: 'text-red-300' },
    developer: { label: 'مطور', emoji: '💻', bg: 'bg-blue-500/20', text: 'text-blue-300' },
    buyer: { label: 'مشتري', emoji: '🛍️', bg: 'bg-white/10', text: 'text-white/60' },
  }
  const role = roleConfig[profile?.role as keyof typeof roleConfig] ?? roleConfig.buyer

  const mainMenu = [
    { icon: ShoppingBag, label: 'مشترياتي', sub: `${stats.purchases} منتج`, href: '/ar/purchases', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: Heart, label: 'المحفوظات', sub: `${stats.wishlist} منتج`, href: '/ar/wishlist', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { icon: Bell, label: 'الإشعارات', sub: '', href: '/ar/notifications', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { icon: MessageCircle, label: 'تواصل معنا', sub: '', href: '/ar/contact', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  ]

  const developerMenu = isDeveloper ? [
    { icon: TrendingUp, label: 'لوحة المطور', sub: 'إدارة منتجاتك', href: '/ar/developer/dashboard', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ] : [
    { icon: Code2, label: 'أصبح مطوراً', sub: 'ابدأ البيع مجاناً', href: '/ar/for-developers', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ]

  const adminMenu = isAdmin ? [
    { icon: Settings, label: 'لوحة الأدمن', sub: 'إدارة المنصة', href: '/ar/admin', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  ] : []

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 max-w-lg mx-auto">

        {/* Hero Header */}
        <div className="relative bg-neutral-900 px-4 pt-10 pb-16 overflow-hidden">
          {/* خلفية ديكورية */}
          <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full translate-x-36 -translate-y-36" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -translate-x-24 translate-y-24" />
          </div>

          <div className="relative text-center">
            {/* صورة الملف */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-3xl bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden text-4xl font-black text-white">
                {profile?.store_image
                  ? <Image src={profile.store_image} alt={displayName} width={96} height={96} className="object-cover w-full h-full" />
                  : initials
                }
              </div>
              {profile?.verified && (
                <div className="absolute -bottom-1 -end-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-neutral-900">
                  <BadgeCheck size={14} className="text-white" aria-hidden="true" />
                </div>
              )}
            </div>

            <h1 className="text-xl font-bold text-white mb-0.5">{displayName}</h1>
            <p className="text-white/40 text-xs mb-3">{user?.email}</p>

            <div className="flex items-center justify-center gap-2">
              <span className={`text-[11px] px-3 py-1 rounded-full font-medium ${role.bg} ${role.text}`}>
                {role.emoji} {role.label}
              </span>
              {profile?.tier && profile.tier !== 'free' && (
                <span className="text-[11px] px-3 py-1 rounded-full font-medium bg-amber-500/20 text-amber-300 flex items-center gap-1">
                  <Star size={10} aria-hidden="true" />
                  {profile.tier}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 -mt-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: ShoppingBag, value: stats.purchases, label: 'مشتريات', href: '/ar/purchases', color: 'text-blue-600 dark:text-blue-400' },
              { icon: Heart, value: stats.wishlist, label: 'محفوظ', href: '/ar/wishlist', color: 'text-red-500' },
            ].map(({ icon: Icon, value, label, href, color }) => (
              <Link key={label} href={href}>
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 text-center hover:shadow-md hover:scale-[1.02] transition-all duration-300">
                  <Icon size={20} className={`${color} mx-auto mb-2`} aria-hidden="true" />
                  <p className="text-2xl font-black text-neutral-900 dark:text-white">{value}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* القائمة الرئيسية */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden mb-4">
            {[...mainMenu, ...developerMenu, ...adminMenu].map(({ icon: Icon, label, sub, href, color, bg }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-50 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={color} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{label}</p>
                  {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
                </div>
                <ChevronLeft size={14} className="text-neutral-300 dark:text-neutral-600 rotate-180 group-hover:translate-x-[-2px] transition-transform" aria-hidden="true" />
              </Link>
            ))}
          </div>

          {/* روابط قانونية */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden mb-4">
            {[
              { label: 'شروط الاستخدام', href: '/ar/terms' },
              { label: 'سياسة الخصوصية', href: '/ar/privacy' },
              { label: 'سياسة الكوكيز', href: '/ar/cookies' },
            ].map(({ label, href }) => (
              <Link key={href} href={href}
                className="flex items-center justify-between px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
                <ExternalLink size={12} className="text-neutral-300 dark:text-neutral-600" aria-hidden="true" />
              </Link>
            ))}
          </div>

          {/* تسجيل الخروج */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-200 dark:border-red-900/50 text-red-500 font-semibold rounded-2xl text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mb-4 active:scale-[0.98]"
          >
            <LogOut size={16} aria-hidden="true" />
            تسجيل الخروج
          </button>

          <p className="text-center text-[10px] text-neutral-300 dark:text-neutral-700 mb-2">
            Wibya © 2026 — v2.0
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}