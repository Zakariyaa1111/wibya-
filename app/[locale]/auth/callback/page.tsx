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

      // ✅ تحديث google_verified تلقائياً
      const isGoogleUser = user.app_metadata?.provider === 'google'

      // ✅ جلب الـ role المحفوظ قبل OAuth
      const pendingRole = localStorage.getItem('pending_role') as 'buyer' | 'developer' | null

      // ✅ تحديث الملف الشخصي
      const updateData: Record<string, any> = {}
      if (isGoogleUser) {
        updateData.google_verified = true
        updateData.is_verified = true
      }
      if (pendingRole && (pendingRole === 'buyer' || pendingRole === 'developer')) {
        updateData.role = pendingRole
      }
      if (Object.keys(updateData).length > 0) {
        await supabase.from('profiles').update(updateData).eq('id', user.id)
      }

      // تنظيف localStorage
      localStorage.removeItem('pending_role')

      // ✅ توجيه حسب الـ role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = updateData.role || profile?.role

      if (role === 'admin') router.push('/ar/admin')
      else if (role === 'developer') router.push('/ar/developer/dashboard')
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