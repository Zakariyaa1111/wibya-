'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { User, Store, ShieldCheck, LogOut, Package, ChevronLeft } from 'lucide-react'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single() as any
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    )
  }

  const name = profile?.store_name || profile?.full_name || 'مستخدم'
  const initial = name.charAt(0).toUpperCase()
  const roleLabel: Record<string, string> = {
    buyer: 'مشتري', seller: 'بائع', admin: 'مدير', advertiser: 'معلن'
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />
      <main className="pb-24 pt-4 px-4 max-w-lg mx-auto">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-neutral-200 flex items-center justify-center text-3xl font-bold text-neutral-600 mb-3 overflow-hidden">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
              : initial}
          </div>
          <h1 className="text-lg font-bold text-neutral-900">{name}</h1>
          <span className="text-sm text-neutral-400 mt-1">
            {roleLabel[profile?.role] ?? profile?.role}
          </span>
        </div>

        {/* Role action */}
        <div className="mb-4">
          {profile?.role === 'seller' && (
            <button onClick={() => router.push('/seller')}
              className="w-full flex items-center justify-between bg-neutral-900 text-white rounded-2xl p-4 mb-3">
              <div className="flex items-center gap-3">
                <Store size={20} />
                <span className="font-semibold">لوحة البائع</span>
              </div>
              <ChevronLeft size={18} className="rotate-180" />
            </button>
          )}
          {profile?.role === 'admin' && (
            <button onClick={() => router.push('/admin')}
              className="w-full flex items-center justify-between bg-neutral-900 text-white rounded-2xl p-4 mb-3">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} />
                <span className="font-semibold">لوحة الإدارة</span>
              </div>
              <ChevronLeft size={18} className="rotate-180" />
            </button>
          )}
          {profile?.role === 'advertiser' && (
            <button onClick={() => router.push('/advertiser')}
              className="w-full flex items-center justify-between bg-neutral-900 text-white rounded-2xl p-4 mb-3">
              <div className="flex items-center gap-3">
                <Store size={20} />
                <span className="font-semibold">لوحة المعلن</span>
              </div>
              <ChevronLeft size={18} className="rotate-180" />
            </button>
          )}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-4">
          <button onClick={() => router.push('/orders')}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Package size={16} className="text-green-600" />
              </div>
              <span className="font-medium text-neutral-800">طلباتي</span>
            </div>
            <ChevronLeft size={16} className="text-neutral-400 rotate-180" />
          </button>
          <button onClick={() => router.push('/')}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <span className="font-medium text-neutral-800">الصفحة الرئيسية</span>
            </div>
            <ChevronLeft size={16} className="text-neutral-400 rotate-180" />
          </button>
        </div>

        {/* Logout */}
        <button onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-colors">
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </main>
      <BottomNav />
    </div>
  )
}
