'use client'
import { useEffect } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/auth/login')
        return
      }

      // تحديث google_verified تلقائياً
      const isGoogleUser = user.app_metadata?.provider === 'google'
      if (isGoogleUser) {
        await supabase.from('profiles').update({
          google_verified: true,
          verified: true,
        }).eq('id', user.id)
      }

      // توجيه حسب الـ role
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()

      if (profile?.role === 'admin') router.push('/ar/admin')
      else if (profile?.role === 'seller') router.push('/ar/seller')
      else router.push('/ar')
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-400">جاري التحقق من حسابك...</p>
      </div>
    </div>
  )
}