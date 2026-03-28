import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/ar/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/ar')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">لوحة الأدمن ✅</h1>
      <p className="text-neutral-500 mt-2">مرحباً {user.email}</p>
    </div>
  )
}
