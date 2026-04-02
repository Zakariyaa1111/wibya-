// lib/crypto/encrypt.ts
// ✅ الملف العميل — فقط يستدعي السيرفر، لا يحتوي على مفاتيح

// دوال للتحقق — لا تحتاج مفاتيح
export function validateIdNumber(id: string): boolean {
  return /^[A-Z]{1,2}\d{5,7}$/.test(id.toUpperCase().trim())
}

export function validateExpiryDate(date: string): boolean {
  return new Date(date) > new Date()
}

// للتوافق مع الكود القديم — تستدعي السيرفر action
export async function encryptStrong(text: string): Promise<string> {
  const { encryptData } = await import('./encrypt-server')
  return encryptData(text)
}

export async function decryptStrong(encoded: string): Promise<string> {
  const { decryptData } = await import('./encrypt-server')
  return decryptData(encoded)
}

// دوال قديمة — احتفظنا بها للتوافق لكن بدون مفتاح مكشوف
export function encrypt(text: string): string {
  console.warn('encrypt() قديمة — استخدم encryptStrong() بدلها')
  return text // ترجع النص كما هو بدون تشفير حقيقي
}

export function decrypt(encoded: string): string {
  console.warn('decrypt() قديمة — استخدم decryptStrong() بدلها')
  return encoded
}