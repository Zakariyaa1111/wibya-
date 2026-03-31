'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { Bell, Package, ShoppingBag, Star, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
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

  const getIcon = (type: string) => {
    if (type === 'order') return <ShoppingBag size={16} className="text-purple-500" />
    if (type === 'rating') return <Star size={16} className="text-amber-500" />
    return <Package size={16} className="text-blue-500" />
  }

  const unread = notifications.filter(n => !n.is_read).length

  if (loading) return <div className="p-8 pt-20 lg:pt-8 flex justify-center"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">الإشعارات</h1>
          {unread > 0 && <p className="text-xs text-neutral-400 mt-0.5">{unread} غير مقروء</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
            <CheckCheck size={14} /> تحديد الكل
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={40} className="text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">لا توجد إشعارات بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${n.is_read ? 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'order' ? 'bg-purple-50 dark:bg-purple-900/20' : n.type === 'rating' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${n.is_read ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-900 dark:text-white'}`}>{n.title}</p>
                  {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                </div>
                {n.body && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{n.body}</p>}
                <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-1">{new Date(n.created_at).toLocaleDateString('ar-MA')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}