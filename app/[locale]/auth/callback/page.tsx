'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        window.location.href = '/ar/auth/login'
        return
      }

      const isGoogleUser = user.app_metadata?.provider === 'google'
      const pendingRole = localStorage.getItem('pending_role') as 'buyer' | 'developer' | null

      const updateData: Record<string, any> = {}
      if (isGoogleUser) updateData.is_verified = true
      if (pendingRole === 'buyer' || pendingRole === 'developer') updateData.role = pendingRole
      if (Object.keys(updateData).length > 0) {
        await supabase.from('profiles').update(updateData).eq('id', user.id)
      }
      localStorage.removeItem('pending_role')

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()

      const role = updateData.role || profile?.role

      if (role === 'admin') window.location.href = '/ar/admin'
      else if (role === 'developer') window.location.href = '/ar/developer/dashboard'
      else window.location.href = '/ar'
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