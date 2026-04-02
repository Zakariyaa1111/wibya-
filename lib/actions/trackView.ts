'use server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function trackProductView(productId: string) {
  try {
    const supabase = await createClient()
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    const { error } = await supabase
      .from('product_views')
      .insert({ product_id: productId, viewer_ip: ip })

    if (!error) {
      const { error: rpcError } = await supabase.rpc('increment_views', { product_id: productId })
      if (rpcError) {
        const { data } = await supabase.from('products')
          .select('views_count').eq('id', productId).single()
        await supabase.from('products')
          .update({ views_count: (data?.views_count ?? 0) + 1 })
          .eq('id', productId)
      }
    }
  } catch {}
}