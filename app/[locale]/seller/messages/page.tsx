'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { MessageCircle, Send } from 'lucide-react'

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase
        .from('messages')
        .select('*, profiles!sender_id(full_name, store_name)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20)
      setMessages(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="p-8 pt-20 lg:pt-8 flex justify-center"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">الرسائل</h1>

      {messages.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle size={40} className="text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm mb-2">لا توجد رسائل بعد</p>
          <p className="text-neutral-300 text-xs">سيتواصل معك المشترون هنا</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(m => (
            <div key={m.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 font-bold text-neutral-500">
                {(m.profiles?.store_name || m.profiles?.full_name || 'م').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{m.profiles?.store_name || m.profiles?.full_name || 'مستخدم'}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{m.content}</p>
                <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-1">{new Date(m.created_at).toLocaleDateString('ar-MA')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}