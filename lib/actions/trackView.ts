'use server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function trackProductView(productId: string) {
  try {
    const supabase = await createClient()
    const headersList = await headers()

    // جلب الـ IP
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    // محاولة إضافة view — إذا موجود بالفعل يتجاهل
    const { error } = await supabase
      .from('product_views')
      .insert({ product_id: productId, viewer_ip: ip })

    // إذا ما كانش خطأ (يعني view جديد) — نحدث العداد
    if (!error) {
      await supabase.rpc('increment_views', { product_id: productId }).catch(() => {
        // fallback manual update
        supabase.from('products')
          .select('views_count')
          .eq('id', productId)
          .single()
          .then(({ data }) => {
            supabase.from('products')
              .update({ views_count: (data?.views_count ?? 0) + 1 })
              .eq('id', productId)
          })
      })
    }
  } catch {}
}