import { NextRequest } from 'next/server'
import { chatWithAssistant } from '@/lib/ai/claude'

export async function POST(request: NextRequest) {
  const { messages, locale } = await request.json()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of chatWithAssistant(messages, locale)) {
          controller.enqueue(encoder.encode(chunk))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
