'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  developerId: string
  initialFollowing: boolean
  userId: string
}

export function FollowButton({ developerId, initialFollowing, userId }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()

    if (following) {
      await supabase.from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('developer_id', developerId)
      setFollowing(false)
      toast.success('تم إلغاء المتابعة')
    } else {
      await supabase.from('follows')
        .insert({ follower_id: userId, developer_id: developerId })
      setFollowing(true)
      toast.success('تمت المتابعة ✅')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={following ? 'إلغاء المتابعة' : 'متابعة المطور'}
      aria-pressed={following}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
        following
          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
          : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90'
      }`}
    >
      {following
        ? <><UserMinus size={14} aria-hidden="true" /> متابَع</>
        : <><UserPlus size={14} aria-hidden="true" /> متابعة</>
      }
    </button>
  )
}