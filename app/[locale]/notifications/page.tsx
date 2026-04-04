'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Bell, Package, ShoppingBag, Flag, Star, Check } from 'lucide-react'

const TYPE_ICONS: Record<string, any> = {
  product: Package,
  purchase: ShoppingBag,
  dispute: Flag,
  review: Star,
  default: Bell,
}

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

      // تعليم الكل كمقروء
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      setLoading(false)
    }
    load()
  }, [])

  async function markAllRead() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const unread = notifications.filter(n => !n.is_read).length

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-4 px-4 max-w-lg mx-auto">

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Bell size={20} aria-hidden="true" />
            الإشعارات
            {unread > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                {unread}
              </span>
            )}
          </h1>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              <Check size={13} aria-hidden="true" />
              تعليم الكل كمقروء
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-10 text-center">
            <Bell size={40} className="text-neutral-300 mx-auto mb-3" aria-hidden="true" />
            <p className="font-semibold text-neutral-900 dark:text-white mb-1">لا توجد إشعارات</p>
            <p className="text-neutral-400 text-sm">ستظهر إشعاراتك هنا</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
            {notifications.map((n, i) => {
              const Icon = TYPE_ICONS[n.type] ?? TYPE_ICONS.default
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-4 border-b border-neutral-50 dark:border-neutral-800 last:border-0 transition-colors ${
                    !n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    !n.is_read
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-neutral-100 dark:bg-neutral-800'
                  }`}>
                    <Icon size={16} className={!n.is_read ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400'} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!n.is_read ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-1">
                      {new Date(n.created_at).toLocaleDateString('ar-MA', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" aria-hidden="true" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}