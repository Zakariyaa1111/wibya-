// lib/moderation/messageFilter.ts
// نظام مراقبة الرسائل — يكتشف محاولات التواصل خارج المنصة والإساءة

export interface FlagResult {
  flagged: boolean
  reason: string
  type: 'phone' | 'email' | 'link' | 'abuse' | null
}

// قائمة الكلمات المحظورة (عربية وفرنسية)
const BAD_WORDS = [
  // عربي
  'كلب', 'حمار', 'غبي', 'أحمق', 'احمق', 'عاهرة', 'زبالة', 'قحبة', 'شرموطة',
  'منيك', 'كس', 'زب', 'طيز', 'لعن', 'ابن الكلب', 'ابن القحبة', 'يلعن',
  // فرنسي
  'merde', 'putain', 'salope', 'connard', 'enculé', 'fils de pute', 'pute',
  'bâtard', 'batard', 'con', 'idiot', 'imbécile',
]

// أنماط للكشف
const PATTERNS = {
  // أرقام الهاتف المغربية وغيرها
  phone: /(?:(?:\+|00)(?:212|33|1|44|49|34|39|32|31|41|90)\s?)?(?:(?:\(?\d{1,4}\)?[\s.\-]?)?\d{2,4}[\s.\-]?\d{2,4}[\s.\-]?\d{2,4})/g,
  // إيميلات
  email: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
  // روابط خارجية
  link: /(?:https?:\/\/|www\.|bit\.ly|t\.me|wa\.me|wa\.link|whatsapp|telegram|instagram\.com|facebook\.com|tiktok\.com|snapchat\.com|twitter\.com|x\.com)/gi,
  // واتساب وتيليغرام بدون رابط
  social: /(?:واتساب|whatsapp|تيليغرام|telegram|انستغرام|instagram|فيسبوك|facebook|تيكتوك|tiktok|سناب|snapchat|تويتر|twitter)/gi,
}

export function checkMessage(content: string): FlagResult {
  if (!content) return { flagged: false, reason: '', type: null }

  const lower = content.toLowerCase()

  // كشف روابط خارجية
  if (PATTERNS.link.test(content)) {
    PATTERNS.link.lastIndex = 0
    return { flagged: true, reason: 'رابط خارجي أو منصة تواصل', type: 'link' }
  }
  PATTERNS.link.lastIndex = 0

  // كشف منصات التواصل بالاسم
  if (PATTERNS.social.test(content)) {
    PATTERNS.social.lastIndex = 0
    return { flagged: true, reason: 'ذكر منصة تواصل خارجية', type: 'link' }
  }
  PATTERNS.social.lastIndex = 0

  // كشف إيميلات
  if (PATTERNS.email.test(content)) {
    PATTERNS.email.lastIndex = 0
    return { flagged: true, reason: 'عنوان بريد إلكتروني', type: 'email' }
  }
  PATTERNS.email.lastIndex = 0

  // كشف أرقام الهاتف (6+ أرقام متتالية)
  const phoneMatch = content.match(/\d[\d\s.\-]{6,}\d/)
  if (phoneMatch) {
    return { flagged: true, reason: 'رقم هاتف محتمل', type: 'phone' }
  }

  // كشف كلمات الإساءة
  for (const word of BAD_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      return { flagged: true, reason: `كلمة محظورة: "${word}"`, type: 'abuse' }
    }
  }

  return { flagged: false, reason: '', type: null }
}

// رسالة تحذير للمستخدم حسب نوع المخالفة
export function getWarningMessage(type: FlagResult['type']): string {
  switch (type) {
    case 'phone': return '⚠️ لا يمكن مشاركة أرقام الهاتف داخل المحادثة — استخدم المنصة للتواصل'
    case 'email': return '⚠️ لا يمكن مشاركة عناوين البريد الإلكتروني — استخدم المنصة للتواصل'
    case 'link': return '⚠️ لا يمكن مشاركة روابط أو منصات خارجية — جميع المعاملات داخل Wibya'
    case 'abuse': return '⚠️ رسالتك تحتوي على كلمات غير لائقة — يرجى الالتزام بآداب التواصل'
    default: return '⚠️ رسالتك تخالف سياسة المنصة'
  }
}