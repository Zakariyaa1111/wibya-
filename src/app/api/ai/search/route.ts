import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { enhanceSearchQuery } from '@/lib/ai/claude'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const locale = (searchParams.get('locale') ?? 'ar') as 'ar' | 'fr'

  if (!q.trim()) return NextResponse.json({ results: [] })

  try {
    const supabase = await createAdminClient()
    const enhanced = await enhanceSearchQuery(q, locale)
    const keywords = enhanced.keywords.join(' ')

    // Text search (full-text)
    const { data: products } = await supabase
      .from('products')
      .select('*, profiles(store_name, store_image, verified)')
      .eq('status', 'active')
      .textSearch('name', keywords, { type: 'websearch' })
      .limit(8)

    const { data: ads } = await supabase
      .from('ads')
      .select('*, profiles(full_name, verified)')
      .eq('status', 'active')
      .textSearch('title', keywords, { type: 'websearch' })
      .limit(4)

    const results = [
      ...(products ?? []).map(p => ({ ...p, type: 'product' })),
      ...(ads ?? []).map(a => ({ ...a, type: 'ad' })),
    ]

    return NextResponse.json({ results, enhanced })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ results: [] })
  }
}
