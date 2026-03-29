'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { User, Store, ShieldCheck, LogOut, Package, ChevronLeft, Heart, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [likedProducts, setLikedProducts] = useState<any[]>([])
  const [stats, setStats] = useState({ products: 0, likes: 0, views: 0 })
  const [tab, setTab] = useState<'products' | 'likes'>('products')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [
        { data: profileData },
        { data: userProducts },
        { data: likes },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('likes').select('product_id, products(*)').eq('user_id', user.id).limit(10),
      ])

      setProfile(profileData)
      setProducts(userProducts ?? [])

      const likedProds = (likes ?? []).map((l: any) => l.products).filter(Boolean)
      setLikedProducts(likedProds)

      const totalViews = (userProducts ?? []).reduce((s: number, p: any) => s + (p.views_count || 0), 0)
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setStats({
        products: userProducts?.length ?? 0,
        likes: likesCount ?? 0,
        views: totalViews,
      })

      setLoading(false)
    }
    load()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/ar/auth/login')
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
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-neutral-200 flex items-center justify-center text-3xl font-bold text-neutral-600 mb-3 overflow-hidden">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
              : initial}
          </div>
          <h1 className="text-lg font-bold text-neutral-900">{name}</h1>
          <span className="text-sm text-neutral-400 mt-1">{roleLabel[profile?.role] ?? profile?.role}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'منتجاتي', value: stats.products, icon: Package, color: 'bg-blue-50 text-blue-600' },
            { label: 'إعجاباتي', value: stats.likes, icon: Heart, color: 'bg-red-50 text-red-500' },
            { label: 'المشاهدات', value: stats.views, icon: Eye, color: 'bg-purple-50 text-purple-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-3 border border-neutral-100 text-center">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}>
                <Icon size={15} />
              </div>
              <div className="text-xl font-bold text-neutral-900">{value}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Role action */}
        <div className="mb-4">
          {profile?.role === 'seller' && (
            <button onClick={() => router.push('/ar/seller')}
              className="w-full flex items-center justify-between bg-neutral-900 text-white rounded-2xl p-4 mb-3">
              <div className="flex items-center gap-3">
                <Store size={20} />
                <span className="font-semibold">لوحة البائع</span>
              </div>
              <ChevronLeft size={18} className="rotate-180" />
            </button>
          )}
          {profile?.role === 'admin' && (
            <button onClick={() => router.push('/ar/admin')}
              className="w-full flex items-center justify-between bg-neutral-900 text-white rounded-2xl p-4 mb-3">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} />
                <span className="font-semibold">لوحة الإدارة</span>
              </div>
              <ChevronLeft size={18} className="rotate-180" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('products')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'products' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 border border-neutral-200'}`}>
            منتجاتي ({stats.products})
          </button>
          <button onClick={() => setTab('likes')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'likes' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 border border-neutral-200'}`}>
            إعجاباتي ({stats.likes})
          </button>
        </div>

        {/* Products */}
        {tab === 'products' && (
          <div className="space-y-2 mb-6">
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
                <Package size={32} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-400 text-sm">لا توجد منتجات بعد</p>
              </div>
            ) : (
              products.map(p => (
                <Link key={p.id} href={`/ar/product/${p.id}`}>
                  <div className="bg-white rounded-2xl border border-neutral-100 p-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-900 truncate">{p.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{p.price?.toLocaleString()} د.م.</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-lg ${
                      p.status === 'active' ? 'bg-green-50 text-green-600' :
                      p.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      'bg-neutral-100 text-neutral-500'
                    }`}>
                      {p.status === 'active' ? 'نشط' : p.status === 'pending' ? 'معلق' : p.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Liked products */}
        {tab === 'likes' && (
          <div className="space-y-2 mb-6">
            {likedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
                <Heart size={32} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-400 text-sm">لا توجد إعجابات بعد</p>
              </div>
            ) : (
              likedProducts.map((p: any) => (
                <Link key={p.id} href={`/ar/product/${p.id}`}>
                  <div className="bg-white rounded-2xl border border-neutral-100 p-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-900 truncate">{p.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{p.price?.toLocaleString()} د.م.</p>
                    </div>
                    <Heart size={16} className="fill-red-500 text-red-500 shrink-0" />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

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
