'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Bell, Package, ShoppingBag, Star, Info, CheckCheck } from 'lucide-react'
import { useRouter } from '@/lib/i18n/navigation'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function markAllRead() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    toast.success('تم تحديد الكل كمقروء')
  }

  async function markRead(id: string) {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag size={18} className="text-purple-500" />
      case 'product': return <Package size={18} className="text-blue-500" />
      case 'rating': return <Star size={18} className="text-amber-500" />
      default: return <Info size={18} className="text-neutral-400" />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'order': return 'bg-purple-50 dark:bg-purple-900/20'
      case 'product': return 'bg-blue-50 dark:bg-blue-900/20'
      case 'rating': return 'bg-amber-50 dark:bg-amber-900/20'
      default: return 'bg-neutral-100 dark:bg-neutral-800'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-4 px-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">الإشعارات</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{unreadCount} غير مقروء</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
              <CheckCheck size={14} />
              تحديد الكل
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={40} className="text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">لا توجد إشعارات بعد</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors cursor-pointer ${
                  n.is_read
                    ? 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'
                    : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconBg(n.type)}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${n.is_read ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-900 dark:text-white'}`}>
                      {n.title}
                    </p>
                    {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                  </div>
                  {n.body && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-1">
                    {new Date(n.created_at).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}