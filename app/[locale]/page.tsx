import { createClient } from '@/lib/supabase/server'
import HomeClient from '@/components/home/HomeClient'

export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: featured },
    { data: newest },
    { data: topSelling },
    { data: topDevelopers },
  ] = await Promise.all([
    supabase.from('digital_products')
      .select('id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles!developer_id(full_name, store_name, verified)')
      .eq('status', 'active')
      .eq('featured', true)
      .limit(6),
    supabase.from('digital_products')
      .select('id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles!developer_id(full_name, store_name, verified)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('digital_products')
      .select('id, title, price, original_price, preview_images, category, average_rating, sales_count, quality_badge, claude_score, profiles!developer_id(full_name, store_name, verified)')
      .eq('status', 'active')
      .order('sales_count', { ascending: false })
      .limit(8),
    supabase.from('profiles')
      .select('id, full_name, store_name, store_image, verified, total_sales, followers_count')
      .eq('role', 'developer')
      .order('total_sales', { ascending: false })
      .limit(6),
  ])

  return (
    <HomeClient
      featured={featured ?? []}
      newest={newest ?? []}
      topSelling={topSelling ?? []}
      topDevelopers={topDevelopers ?? []}
    />
  )
}