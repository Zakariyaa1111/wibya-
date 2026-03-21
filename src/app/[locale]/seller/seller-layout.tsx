import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SellerSidebar } from '@/components/seller/SellerSidebar'

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, approved, full_name, store_name, store_image, wallet_balance')
    .eq('id', user.id)
    .single() as any

  if (!profile || ((profile as any).role !== 'seller' && (profile as any).role !== 'admin')) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <SellerSidebar profile={profile as any} />
      <main className="flex-1 lg:ms-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
