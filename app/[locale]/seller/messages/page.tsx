'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { Send, ImagePlus, X, ArrowRight, ShieldCheck, MessageCircle, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface Conversation {
  user_id: string
  user_name: string
  user_image: string | null
  last_message: string
  last_time: string
  unread: number
}

export default function SellerMessagesPage() {
  const [userId, setUserId] = useState<string>('')
  const [myName, setMyName] = useState<string>('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles').select('full_name, store_name').eq('id', user.id).single()
      setMyName(profile?.store_name || profile?.full_name || 'البائع')

      // جلب كل المحادثات
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (!msgs) { setLoading(false); return }

      // تجميع حسب المحادثة
      const convMap = new Map<string, Conversation>()
      for (const m of msgs) {
        const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id
        if (!convMap.has(otherId)) {
          convMap.set(otherId, {
            user_id: otherId,
            user_name: m.sender_id !== user.id ? (m.sender_name || 'مستخدم') : 'مستخدم',
            user_image: null,
            last_message: m.content || '📷 صورة',
            last_time: m.created_at,
            unread: (!m.is_read && m.receiver_id === user.id) ? 1 : 0,
          })
        } else {
          const conv = convMap.get(otherId)!
          if (!m.is_read && m.receiver_id === user.id) conv.unread++
        }
      }

      // جلب أسماء المستخدمين
      const ids = Array.from(convMap.keys())
      if (ids.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles').select('id, full_name, store_name, store_image').in('id', ids)
        profiles?.forEach(p => {
          const conv = convMap.get(p.id)
          if (conv) {
            conv.user_name = p.store_name || p.full_name || 'مستخدم'
            conv.user_image = p.store_image
          }
        })
      }

      setConversations(Array.from(convMap.values()))
      setLoading(false)
    })
  }, [])

  async function openConversation(otherId: string, otherName: string) {
    setSelected(otherId)
    setSelectedName(otherName)
    const supabase = createClient()

    const { data } = await supabase
      .from('messages').select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .limit(50)

    setMessages(data ?? [])

    // تحديد كمقروء
    await supabase.from('messages')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', otherId)

    setConversations(prev => prev.map(c => c.user_id === otherId ? { ...c, unread: 0 } : c))
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function uploadImage(file: File): Promise<string | null> {
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') { toast.error('فقط الصور و PDF مسموحة'); return null }
    if (file.size > 5 * 1024 * 1024) { toast.error('الصورة أكبر من 5MB'); return null }

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `messages/${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('wibya-media').upload(path, file)
    if (error) { toast.error('خطأ في الرفع'); return null }
    const { data } = supabase.storage.from('wibya-media').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleImageSend(file: File) {
    if (!selected || !userId) return
    setUploading(true)
    const url = await uploadImage(file)
    if (!url) { setUploading(false); return }

    const supabase = createClient()
    const { data, error } = await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: selected,
      content: url,
      sender_name: myName,
      is_read: false,
    }).select().single()

    if (!error && data) setMessages(prev => [...prev, data])
    setUploading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function sendMessage() {
    const content = text.trim()
    if (!content || !userId || !selected || sending) return
    setSending(true)
    setText('')

    const supabase = createClient()
    const { data, error } = await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: selected,
      content,
      sender_name: myName,
      is_read: false,
    }).select().single()

    if (error) { toast.error('خطأ: ' + error.message); setText(content) }
    else if (data) {
      setMessages(prev => [...prev, data])
      await supabase.from('notifications').insert({
        user_id: selected,
        title: '💬 رد من البائع',
        body: content.slice(0, 60),
        type: 'order', is_read: false,
      })
      setConversations(prev => prev.map(c =>
        c.user_id === selected ? { ...c, last_message: content, last_time: new Date().toISOString() } : c
      ))
    }
    setSending(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  function isPdfUrl(str: string) {
    return str.startsWith('http') && str.includes('.pdf')
  }

  function isImageUrl(str: string) {
    return str.startsWith('http') && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(str)
  }

  if (loading) return (
    <div className="p-8 pt-20 lg:pt-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="pt-16 lg:pt-0 h-screen flex flex-col lg:flex-row bg-neutral-50 dark:bg-neutral-950">

      {/* Conversations list */}
      <div className={`${selected ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 bg-white dark:bg-neutral-900 border-e border-neutral-100 dark:border-neutral-800 h-full`}>
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
          <h1 className="font-bold text-neutral-900 dark:text-white text-lg">الرسائل</h1>
          <p className="text-xs text-neutral-400 mt-0.5">{conversations.length} محادثة</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <MessageCircle size={40} className="text-neutral-300 dark:text-neutral-700 mb-3" />
              <p className="text-neutral-400 text-sm">لا توجد رسائل بعد</p>
            </div>
          ) : conversations.map(conv => (
            <button key={conv.user_id} onClick={() => openConversation(conv.user_id, conv.user_name)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-start ${selected === conv.user_id ? 'bg-neutral-50 dark:bg-neutral-800' : ''}`}>
              <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-neutral-500">
                {conv.user_image
                  ? <Image src={conv.user_image} alt="" width={44} height={44} className="object-cover w-full h-full" />
                  : (conv.user_name || 'M').charAt(0)
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{conv.user_name}</p>
                  <p className="text-[10px] text-neutral-400 shrink-0 ms-2">
                    {new Date(conv.last_time).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-neutral-400 truncate">{conv.last_message}</p>
                  {conv.unread > 0 && (
                    <span className="shrink-0 ms-2 w-5 h-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {selected ? (
        <div className="flex-1 flex flex-col h-full">
          {/* Chat header */}
          <div className="shrink-0 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3 px-4 h-14">
            <button onClick={() => setSelected(null)} className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <ArrowRight size={18} className="text-neutral-600 dark:text-neutral-400 rotate-180" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-500 shrink-0">
              {(selectedName || 'M').charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-sm text-neutral-900 dark:text-white">{selectedName}</p>
              <p className="text-[10px] text-green-500">محادثة آمنة 🔒</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-neutral-50 dark:bg-neutral-950">
            {messages.map((msg, i) => {
              const mine = msg.sender_id === userId
              const isImg = isImageUrl(msg.content)
              return (
                <div key={msg.id || i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  {!mine && (
                    <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-500 me-2 shrink-0 self-end mb-1">
                      {(msg.sender_name || 'M').charAt(0)}
                    </div>
                  )}
                  <div className={`max-w-[72%] rounded-2xl overflow-hidden ${
                    mine
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-ee-none'
                      : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-100 dark:border-neutral-700 rounded-es-none'
                  }`}>
                    {isImg ? (
                      <div className="relative">
                        <Image src={msg.content} alt="صورة" width={240} height={180} className="object-cover rounded-2xl" />
                      </div>
                    ) : isPdfUrl(msg.content) ? (
                      <a href={msg.content} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-3">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                          <FileText size={15} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">ملف PDF</p>
                          <p className="text-[10px] opacity-60">انقر للفتح</p>
                        </div>
                      </a>
                    ) : (
                      <div className="px-4 py-2.5">
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    )}
                    <p className={`text-[10px] px-3 pb-1.5 ${mine ? 'text-white/50' : 'text-neutral-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 p-3">
            <div className="flex items-center gap-2">
              {/* زر الصور */}
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-40 shrink-0">
                {uploading
                  ? <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                  : <ImagePlus size={16} />
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => e.target.files?.[0] && handleImageSend(e.target.files[0])} />

              <input value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="اكتب ردك..."
                className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-3 text-sm outline-none text-neutral-900 dark:text-white placeholder-neutral-400 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-600 transition-colors" />

              <button onClick={sendMessage} disabled={!text.trim() || sending}
                className="w-10 h-10 bg-neutral-900 dark:bg-white rounded-2xl flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform shrink-0">
                <Send size={15} className="text-white dark:text-neutral-900" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-2 px-1">
              <ShieldCheck size={11} className="text-green-500" />
              <p className="text-[10px] text-neutral-400">محادثة محمية — الصور و PDF مسموحة كوسائط</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-950">
          <div className="text-center">
            <MessageCircle size={48} className="text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-neutral-400 dark:text-neutral-500">اختر محادثة للبدء</p>
          </div>
        </div>
      )}
    </div>
  )
}