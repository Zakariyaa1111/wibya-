'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, MapPin, ShieldCheck, Flag, X, Send } from 'lucide-react'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row'] & {
  profiles?: {
    store_name: string | null
    store_image: string | null
    verified: boolean
  }
}

interface FeedItemProps {
  product: Product
  index?: number
}

export function FeedItem({ product, index = 0 }: FeedItemProps) {
  const locale = useLocale()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [reported, setReported] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const mainImage = product.images?.[0] ?? '/placeholder.jpg'
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', product.id)
      setLikeCount(count ?? 0)

      if (user) {
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('product_id', product.id)
          .eq('user_id', user.id)
          .single()
        setLiked(!!data)
      }
    }
    init()
  }, [product.id])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!userId) return
    const supabase = createClient()
    if (liked) {
      await supabase.from('likes').delete().eq('product_id', product.id).eq('user_id', userId)
      setLiked(false)
      setLikeCount(prev => prev - 1)
    } else {
      await supabase.from('likes').insert({ product_id: product.id, user_id: userId })
      setLiked(true)
      setLikeCount(prev => prev + 1)
    }
  }

  const handleComment = async (e: React.MouseEvent) => {
    e.preventDefault()
    setShowComments(prev => !prev)
    if (!showComments) {
      const supabase = createClient()
      const { data } = await supabase
        .from('comments')
        .select('*, profiles(full_name, store_name)')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setComments(data ?? [])
    }
  }

  const submitComment = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !userId || commentLoading) return
    setCommentLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .insert({ product_id: product.id, user_id: userId, content: newComment.trim() })
      .select('*, profiles(full_name, store_name)')
      .single()
    if (data) setComments(prev => [data, ...prev])
    setNewComment('')
    setCommentLoading(false)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    if (navigator.share) {
      navigator.share({ title: product.name, url: `/${locale}/product/${product.id}` })
    }
  }

  const handleReport = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (reported || !userId) return
    const supabase = createClient()
    await supabase.from('product_reports').insert({ product_id: product.id, reporter_id: userId, reason: 'محتوى غير لائق' })
    setReported(true)
  }

  return (
    <div>
      <Link href={`/product/${product.id}`}>
        <article className="feed-card animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
          <div className="relative aspect-[4/5] bg-neutral-100">
            <Image src={mainImage} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            <div className="absolute top-3 start-3 flex flex-col gap-1.5">
              {product.is_featured && (
                <span className="badge bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">⭐ مميز</span>
              )}
              {discount && discount > 10 && (
                <span className="badge bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">-{discount}%</span>
              )}
            </div>
            <div className="absolute bottom-0 start-0 end-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-white font-bold text-xl">{product.price.toLocaleString()}</span>
                    <span className="text-white/80 text-sm font-medium">د.م.</span>
                  </div>
                  {product.city && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-white/70" />
                      <span className="text-white/80 text-xs">{product.city}</span>
                    </div>
                  )}
                </div>
                {product.original_price && (
                  <span className="text-white/60 text-sm line-through">{product.original_price.toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3">
            <h3 className="font-semibold text-neutral-900 text-sm line-clamp-2 leading-snug mb-2">{product.name}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-3">
              <ShieldCheck size={12} className="text-green-500 shrink-0" />
              <span>حماية Wibya</span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-50 pt-2.5">
              <div className="flex items-center gap-3">
                <button onClick={handleLike} className="flex items-center gap-1 text-neutral-400 hover:text-red-500 transition-colors">
                  <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : ''} strokeWidth={1.8} />
                  {likeCount > 0 && <span className="text-xs text-neutral-500">{likeCount}</span>}
                </button>
                <button onClick={handleComment} className={`flex items-center gap-1 transition-colors ${showComments ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'}`}>
                  <MessageCircle size={18} strokeWidth={1.8} />
                  {comments.length > 0 && <span className="text-xs text-neutral-500">{comments.length}</span>}
                </button>
                <button onClick={handleShare} className="flex items-center gap-1 text-neutral-400 hover:text-neutral-700 transition-colors">
                  <Share2 size={18} strokeWidth={1.8} />
                </button>
                <button onClick={handleReport} disabled={reported}
                  className={`flex items-center gap-1 transition-colors ${reported ? 'text-red-400 cursor-not-allowed' : 'text-neutral-400 hover:text-red-500'}`}>
                  <Flag size={16} strokeWidth={1.8} className={reported ? 'fill-red-400 text-red-400' : ''} />
                </button>
              </div>
              {product.profiles && (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-neutral-200 overflow-hidden">
                    {product.profiles.store_image ? (
                      <Image src={product.profiles.store_image} alt="" width={20} height={20} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-neutral-500">
                        {product.profiles.store_name?.charAt(0) || 'W'}
                      </div>
                    )}
                  </div>
                  {product.profiles.verified && <ShieldCheck size={12} className="text-blue-500" />}
                </div>
              )}
            </div>
          </div>
        </article>
      </Link>

      {showComments && (
        <div className="bg-white border border-neutral-100 rounded-2xl mt-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
            <span className="text-sm font-medium text-neutral-900">التعليقات</span>
            <button onClick={() => setShowComments(false)} className="text-neutral-400 hover:text-neutral-700">
              <X size={16} />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-center text-neutral-400 text-xs py-6">لا توجد تعليقات — كن أول من يعلق!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="px-4 py-2.5 border-b border-neutral-50 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[8px] font-bold text-neutral-500">
                      {(c.profiles?.store_name || c.profiles?.full_name || 'W').charAt(0)}
                    </div>
                    <span className="text-[11px] font-medium text-neutral-700">
                      {c.profiles?.store_name || c.profiles?.full_name || 'مستخدم'}
                    </span>
                    <span className="text-[10px] text-neutral-300 ms-auto">
                      {new Date(c.created_at).toLocaleDateString('ar-MA')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 me-7">{c.content}</p>
                </div>
              ))
            )}
          </div>
          {userId ? (
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-neutral-50">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="اكتب تعليقاً..."
                className="flex-1 text-sm bg-neutral-50 rounded-xl px-3 py-2 outline-none border border-neutral-100 focus:border-neutral-300"
                onKeyDown={e => e.key === 'Enter' && submitComment(e)}
              />
              <button onClick={submitComment} disabled={!newComment.trim() || commentLoading}
                className="w-8 h-8 bg-neutral-900 rounded-xl flex items-center justify-center disabled:opacity-40">
                <Send size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <p className="text-center text-xs text-neutral-400 py-3">
              <Link href="/auth/login" className="text-neutral-700 underline">سجل دخول</Link> لتعليق
            </p>
          )}
        </div>
      )}
    </div>
  )
}