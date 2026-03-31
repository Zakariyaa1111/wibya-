// lib/crypto/encrypt.ts
// تشفير وفك تشفير البيانات الحساسة

const KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'wibya_secret_2026'

// تشفير بسيط باستخدام XOR + Base64
export function encrypt(text: string): string {
  if (!text) return ''
  try {
    const keyBytes = Array.from(KEY).map(c => c.charCodeAt(0))
    const textBytes = Array.from(text).map(c => c.charCodeAt(0))
    const encrypted = textBytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length])
    return btoa(String.fromCharCode(...encrypted))
  } catch {
    return ''
  }
}

export function decrypt(encoded: string): string {
  if (!encoded) return ''
  try {
    const keyBytes = Array.from(KEY).map(c => c.charCodeAt(0))
    const encrypted = Array.from(atob(encoded)).map(c => c.charCodeAt(0))
    const decrypted = encrypted.map((byte, i) => byte ^ keyBytes[i % keyBytes.length])
    return String.fromCharCode(...decrypted)
  } catch {
    return ''
  }
}

// تشفير أقوى باستخدام AES-like عبر Web Crypto API
export async function encryptStrong(text: string): Promise<string> {
  if (!text) return ''
  try {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(KEY.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      encoder.encode(text)
    )
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    return btoa(String.fromCharCode(...combined))
  } catch {
    return encrypt(text) // fallback
  }
}

export async function decryptStrong(encoded: string): Promise<string> {
  if (!encoded) return ''
  try {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const combined = new Uint8Array(Array.from(atob(encoded)).map(c => c.charCodeAt(0)))
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(KEY.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      encrypted
    )
    return decoder.decode(decrypted)
  } catch {
    return decrypt(encoded) // fallback
  }
}

// تحقق من صحة رقم البطاقة الوطنية المغربية
export function validateIdNumber(id: string): boolean {
  // البطاقة الوطنية المغربية: حرف أو حرفان + أرقام
  return /^[A-Z]{1,2}\d{5,7}$/.test(id.toUpperCase().trim())
}

// تحقق من تاريخ الانتهاء
export function validateExpiryDate(date: string): boolean {
  const d = new Date(date)
  return d > new Date()
}