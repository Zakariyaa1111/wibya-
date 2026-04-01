'use client'
import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { ArrowRight, Send, ShieldCheck, ImagePlus, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { checkMessage, getWarningMessage } from '@/lib/moderation/messageFilter'

function MessagesForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sellerId = searchParams.get('seller')
  const productId = searchParams.get('product')

  const [seller, setSeller] = useState<any>(null)
  const [product, setProduct] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [myName, setMyName] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!sellerId) { router.push('/'); return }
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const [{ data: s }, { data: p }, { data: m }, { data: me }] = await Promise.all([
        supabase.from('profiles').select('id, store_name, full_name, store_image, verified').eq('id', sellerId).single(),
        productId ? supabase.from('products').select('id, name, price, images').eq('id', productId).single() : Promise.resolve({ data: null } as any),
        supabase.from('messages').select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${sellerId}),and(sender_id.eq.${sellerId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true }).limit(50),
        supabase.from('profiles').select('full_name, store_name').eq('id', user.id).single(),
      ])
      setSeller(s); setProduct(p); setMessages(m ?? [])
      setMyName(me?.store_name || me?.full_name || 'مستخدم')
      setLoading(false)
    })
  }, [sellerId, productId])

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [messages])

  // 🔒 فحص الرسالة وإرسال للأدمن إذا مشبوهة
  async function moderateAndFlag(content: string, msgId: string) {
    const result = checkMessage(content)
    if (!result.flagged || !sellerId) return
    const supabase = createClient()

    await supabase.from('flagged_messages').insert({
      message_id: msgId,
      sender_id: userId,
      receiver_id: sellerId,
      content,
      flag_reason: result.reason,
      flag_type: result.type,
    })

    // إشعار للأدمن
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin')
    if (admins) {
      await Promise.all(admins.map(a =>
        supabase.from('notifications').insert({
          user_id: a.id,
          title: '🚨 رسالة مشبوهة',
          body: `${result.reason} — من ${myName}`,
          type: 'product', is_read: false,
        })
      ))
    }
  }

  async function uploadFile(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('فقط الصور و PDF مسموحة'); return null
    }
    if (file.size > 10 * 1024 * 1024) { toast.error('الملف أكبر من 10MB'); return null }
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `messages/${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('wibya-media').upload(path, file)
    if (error) { toast.error('خطأ في الرفع'); return null }
    return supabase.storage.from('wibya-media').getPublicUrl(path).data.publicUrl
  }

  async function handleFileSend(file: File) {
    if (!userId || !sellerId) return
    setUploading(true)
    const url = await uploadFile(file)
    if (!url) { setUploading(false); return }
    const supabase = createClient()
    const { data } = await supabase.from('messages').insert({
      sender_id: userId, receiver_id: sellerId,
      content: url, sender_name: myName, is_read: false,
    }).select().single()
    if (data) setMessages(prev => [...prev, data])
    setUploading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function send() {
    const content = text.trim()
    if (!content || !userId || !sellerId || sending) return

    // 🔒 فحص الرسالة قبل الإرسال
    const check = checkMessage(content)
    if (check.flagged && (check.type === 'phone' || check.type === 'email' || check.type === 'link')) {
      toast.error(getWarningMessage(check.type), { duration: 4000, icon: '🚫' })
      return // منع الإرسال
    }

    setSending(true)
    setText('')
    const supabase = createClient()
    const { data, error } = await supabase.from('messages').insert({
      sender_id: userId, receiver_id: sellerId,
      content, sender_name: myName, is_read: false,
    }).select().single()

    if (error) { toast.error('خطأ: ' + error.message); setText(content) }
    else if (data) {
      setMessages(prev => [...prev, data])
      // فحص في الخلفية حتى للرسائل المرسلة
      if (check.flagged) moderateAndFlag(content, data.id)
      supabase.from('notifications').insert({
        user_id: sellerId, title: '💬 رسالة جديدة',
        body: content.slice(0, 60), type: 'order', is_read: false,
      })
    }
    setSending(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const isImageUrl = (s: string) => s?.startsWith('http') && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(s)
  const isPdfUrl = (s: string) => s?.startsWith('http') && /\.pdf(\?|$)/i.test(s)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="shrink-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3 px-4 h-14">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowRight size={18} className="text-neutral-700 dark:text-neutral-300 rotate-180" />
        </button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center text-sm font-bold text-neutral-500">
            {seller?.store_image
              ? <Image src={seller.store_image} alt="" width={36} height={36} className="object-cover w-full h-full" />
              : (seller?.store_name || seller?.full_name || 'B').charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate flex items-center gap-1">
              {seller?.store_name || seller?.full_name || 'البائع'}
              {seller?.verified && <ShieldCheck size={12} className="text-blue-500" />}
            </p>
            <p className="text-[10px] text-green-500">متاح للرد</p>
          </div>
        </div>
      </header>

      {product && (
        <div className="shrink-0 px-4 py-2 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-2">
            {product.images?.[0] && <Image src={product.images[0]} alt={product.name} width={30} height={30} className="w-8 h-8 rounded-lg object-cover shrink-0" />}
            <div className="min-w-0">
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">{product.name}</p>
              <p className="text-xs text-neutral-400">{product.price?.toLocaleString()} د.م.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-3xl mb-3">👋</div>
            <p className="text-neutral-400 text-sm">ابدأ المحادثة مع البائع</p>
            <p className="text-neutral-300 dark:text-neutral-600 text-xs mt-1">يمكنك إرسال رسائل، صور، أو PDF</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const mine = msg.sender_id === userId
          const isImg = isImageUrl(msg.content)
          const isPdf = isPdfUrl(msg.content)
          return (
            <div key={msg.id || i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && (
                <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-500 me-2 shrink-0 self-end mb-1">
                  {(msg.sender_name || 'B').charAt(0)}
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl overflow-hidden ${mine ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-ee-none' : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-100 dark:border-neutral-700 rounded-es-none'}`}>
                {isImg ? (
                  <Image src={msg.content} alt="صورة" width={240} height={180} className="object-cover" />
                ) : isPdf ? (
                  <a href={msg.content} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={15} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div><p className="text-xs font-medium">ملف PDF</p><p className="text-[10px] opacity-60">انقر للفتح</p></div>
                  </a>
                ) : (
                  <div className="px-4 py-2.5"><p className="text-sm leading-relaxed">{msg.content}</p></div>
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

      <div className="shrink-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 p-3">
        <div className="flex items-center gap-2">
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-40 shrink-0">
            {uploading ? <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" /> : <ImagePlus size={16} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
            onChange={e => e.target.files?.[0] && handleFileSend(e.target.files[0])} />
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="اكتب رسالتك للبائع..."
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-3 text-sm outline-none text-neutral-900 dark:text-white placeholder-neutral-400 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-600 transition-colors" />
          <button onClick={send} disabled={!text.trim() || sending}
            className="w-10 h-10 bg-neutral-900 dark:bg-white rounded-2xl flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform shrink-0">
            <Send size={16} className="text-white dark:text-neutral-900" />
          </button>
        </div>
        <div className="flex items-center gap-1 mt-2 px-1">
          <ShieldCheck size={11} className="text-green-500" />
          <p className="text-[10px] text-neutral-400">محادثة محمية — ممنوع مشاركة معلومات تواصل خارجية</p>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>}>
      <MessagesForm />
    </Suspense>
  )
}