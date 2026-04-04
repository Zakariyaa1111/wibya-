'use server'
import { createClient } from '@/lib/supabase/server'

export interface ClaudeReport {
  score: number // 0-100
  badge: boolean // true إذا score >= 70
  summary: string
  strengths: string[]
  issues: string[]
  security: string[]
  recommendation: 'approve' | 'review' | 'reject'
  details: string
}

export async function reviewProductWithClaude(productId: string): Promise<ClaudeReport | null> {
  try {
    const supabase = await createClient()

    // جلب معلومات المنتج
    const { data: product } = await supabase
      .from('digital_products')
      .select('*, product_files(*)')
      .eq('id', productId)
      .single()

    if (!product) return null

    // بناء prompt للفحص
    const prompt = `
أنت مراجع كود متخصص في منصة Wibya للمنتجات الرقمية.
فاحص هذا المنتج وقدم تقرير شامل.

معلومات المنتج:
- العنوان: ${product.title}
- الفئة: ${product.category}
- الوصف: ${product.description}
- التقنيات: ${product.tech_stack?.join(', ') || 'غير محدد'}
- الإصدار: ${product.version}
- المتطلبات: ${product.requirements || 'غير محدد'}
- دليل التثبيت: ${product.installation_guide || 'غير محدد'}
- Demo URL: ${product.demo_url || 'غير موجود'}
- عدد الملفات: ${product.product_files?.length || 0}
- حجم الملف: ${product.product_files?.[0]?.file_size ? Math.round(product.product_files[0].file_size / 1024) + ' KB' : 'غير محدد'}
- السعر: $${product.price}

قيّم المنتج من 0 إلى 100 بناءً على:
1. جودة الوصف والتوثيق (30%)
2. اكتمال المعلومات التقنية (25%)
3. وجود Demo (20%)
4. السعر مناسب للمحتوى (15%)
5. الشفافية والمصداقية (10%)

أجب بـ JSON فقط بهذا الشكل بدون أي نص إضافي:
{
  "score": 75,
  "summary": "ملخص قصير عن المنتج بالعربية",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "issues": ["مشكلة 1 إن وجدت"],
  "security": ["ملاحظة أمنية إن وجدت"],
  "recommendation": "approve",
  "details": "تفاصيل إضافية للأدمن"
}

recommendation يكون:
- "approve": score >= 70 والمنتج جيد
- "review": score 50-69 يحتاج مراجعة إضافية  
- "reject": score < 50 أو فيه مشاكل جوهرية
`

    // استدعاء Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      console.error('Claude API error:', response.status)
      return null
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // استخراج JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const report: ClaudeReport = JSON.parse(jsonMatch[0])
    report.badge = report.score >= 70

    // حفظ التقرير في قاعدة البيانات
    await supabase
      .from('digital_products')
      .update({
        claude_report: report,
        claude_score: report.score,
        quality_badge: report.badge,
      })
      .eq('id', productId)

    return report

  } catch (error) {
    console.error('Claude review error:', error)
    return null
  }
}