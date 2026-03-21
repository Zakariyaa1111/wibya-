import { NextRequest, NextResponse } from 'next/server'
import { moderateContent } from '@/lib/ai/claude'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { content, productId, userId } = await request.json()

  try {
    const result = await moderateContent(content)

    if (!result.safe && productId) {
      const supabase = await createAdminClient()
      await supabase.from('moderation_flags').insert({
        product_id: productId,
        user_id: userId,
        flags: result.flags,
        reason: result.reason,
        auto_flagged: true,
      }).then(() => {}, () => {})
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ safe: true, flags: [] })
  }
}
