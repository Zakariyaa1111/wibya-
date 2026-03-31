// lib/crypto/encrypt.ts

const KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'wibya_secret_2026'

// تشفير بسيط XOR + Base64 (fallback)
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

// تشفير AES-GCM عبر Web Crypto API
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
    // ✅ إصلاح: Array.from بدل spread operator
    const ivArray = Array.from(iv)
    const encryptedArray = Array.from(new Uint8Array(encrypted))
    const combined = ivArray.concat(encryptedArray)
    return btoa(String.fromCharCode(...combined))
  } catch {
    return encrypt(text)
  }
}

export async function decryptStrong(encoded: string): Promise<string> {
  if (!encoded) return ''
  try {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    // ✅ إصلاح: Array.from بدل spread operator
    const combined = Array.from(atob(encoded)).map(c => c.charCodeAt(0))
    const iv = new Uint8Array(combined.slice(0, 12))
    const encrypted = new Uint8Array(combined.slice(12))
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
    return decrypt(encoded)
  }
}

// تحقق من رقم البطاقة الوطنية المغربية
export function validateIdNumber(id: string): boolean {
  return /^[A-Z]{1,2}\d{5,7}$/.test(id.toUpperCase().trim())
}

// تحقق من تاريخ الانتهاء
export function validateExpiryDate(date: string): boolean {
  return new Date(date) > new Date()
}