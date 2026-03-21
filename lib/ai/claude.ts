import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Generate embedding via Claude (text-to-vector for search)
export async function generateEmbedding(text: string): Promise<number[]> {
  // Supabase pgvector embedding via OpenAI-compatible endpoint
  // For now using a simple hash until Claude embeddings API is available
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/embed`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text }),
    }
  )
  const data = await response.json()
  return data.embedding
}

// Moderate content with Claude
export async function moderateContent(content: string): Promise<{
  safe: boolean
  reason?: string
  flags: string[]
}> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Analyze this marketplace listing for policy violations. Check for: scams, prohibited items, fake products, misleading prices, inappropriate content.

Listing: "${content}"

Respond in JSON only:
{"safe": true/false, "flags": ["list of issues"], "reason": "explanation if not safe"}`
    }]
  })
  
  try {
    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return { safe: true, flags: [] }
  }
}

// Smart search query understanding
export async function enhanceSearchQuery(query: string, locale: 'ar' | 'fr'): Promise<{
  keywords: string[]
  category?: string
  priceRange?: { min?: number; max?: number }
  city?: string
}> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Parse this marketplace search query and extract structured info.
      
Query (${locale}): "${query}"

Respond in JSON only:
{"keywords": [], "category": null, "priceRange": {"min": null, "max": null}, "city": null}`
    }]
  })
  
  try {
    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return { keywords: [query] }
  }
}

// AI chatbot for buyers
export async function* chatWithAssistant(
  messages: { role: 'user' | 'assistant'; content: string }[],
  locale: 'ar' | 'fr'
) {
  const systemPrompt = locale === 'ar'
    ? 'أنت مساعد ذكي لمنصة Wibya المغربية للتجارة الإلكترونية. تساعد المشترين والبائعين. كن مختصراً وودوداً.'
    : "Tu es l'assistant intelligent de Wibya, la marketplace marocaine. Tu aides acheteurs et vendeurs. Sois concis et amical."

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: systemPrompt,
    messages,
  })

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text
    }
  }
}
