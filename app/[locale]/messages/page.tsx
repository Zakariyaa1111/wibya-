'use client'
import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { ArrowRight, Send, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

function MessagesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sellerId = searchParams.get('seller')
  const productId = searchParams.get('product')

  const [seller, setSeller] = useState<any>(null)
  const [product, setProduct] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [senderName, setSenderName] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      if (!sellerId) { router.push('/'); return }

      const [{ data: s }, { data: p }, { data: m }, { data: myProfile }] = await Promise.all([
        supabase.from('profiles').select('id, store_name, full_name, store_image, verified').eq('id', sellerId).single(),
        productId ? supabase.from('products').select('id, name, price, images').eq('id', productId).single() : Promise.resolve({ data: null }),
        supabase.from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${sellerId}),and(sender_id.eq.${sellerId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true })
          .limit(50),
        supabase.from('profiles').select('full_name, store_name').eq('id', user.id).single(),
      ])

      setSeller(s)
      setProduct(p)
      setMessages(m ?? [])
      setSenderName(myProfile?.store_name || myProfile?.full_name || 'مستخدم')
      setLoading(false)
    }
    load()
  }, [sellerId, productId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!newMessage.trim() || !userId || !sellerId || sending) return
    setSending(true)
    const supabase = createClient()
    const content = newMessage.trim()
    setNewMessage('')

    const { data, error } = await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: sellerId,
      content,
      sender_name: senderName,
    }).select().single()

    if (error) {
      toast.error('خطأ في الإرسال: ' + error.message)
      setNewMessage(content)
    } else if (data) {
      setMessages(prev => [...prev, data])
      await supabase.from('notifications').insert({
        user_id: sellerId,
        title: '💬 رسالة جديدة',
        body: content.slice(0, 60),
        type: 'order',
        is_read: false,
      })
    }
    setSending(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3 px-4 h-14">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowRight size={18} className="text-neutral-700 dark:text-neutral-300 rotate-180" />
        </button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
            {seller?.store_image
              ? <Image src={seller.store_image} alt="" width={36} height={36} className="object-cover w-full h-full" />
              : <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500 text-sm">
                  {(seller?.store_name || seller?.full_name || 'B').charAt(0)}
                </div>
            }
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate flex items-center gap-1">
              {seller?.store_name || seller?.full_name || 'البائع'}
              {seller?.verified && <ShieldCheck size={13} className="text-blue-500 shrink-0" />}
            </p>
            <p className="text-xs text-green-500">متاح للرد</p>
          </div>
        </div>
      </header>

      {/* Product context */}
      {product && (
        <div className="px-4 py-2 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-2">
            {product.images?.[0] && (
              <Image src={product.images[0]} alt={product.name} width={32} height={32} className="w-8 h-8 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">{product.name}</p>
              <p className="text-xs text-neutral-400">{product.price?.toLocaleString()} د.م.</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">👋</div>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">ابدأ المحادثة مع البائع</p>
            <p className="text-neutral-300 dark:text-neutral-600 text-xs mt-1">اسأل عن المنتج أو التوصيل</p>
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              {!isMine && (
                <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-500 me-2 shrink-0 mt-1">
                  {(msg.sender_name || 'B').charAt(0)}
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isMine
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-ee-sm'
                  : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-100 dark:border-neutral-700 rounded-es-sm'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/50 dark:text-neutral-500' : 'text-neutral-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 start-0 end-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 p-3">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="اكتب رسالتك للبائع..."
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-3 text-sm outline-none text-neutral-900 dark:text-white placeholder-neutral-400 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-600 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="w-11 h-11 bg-neutral-900 dark:bg-white rounded-2xl flex items-center justify-center disabled:opacity-40 shrink-0 active:scale-95 transition-transform"
          >
            <Send size={16} className="text-white dark:text-neutral-900" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}