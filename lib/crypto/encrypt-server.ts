'use server'
// lib/crypto/encrypt-server.ts
// ✅ هذا الملف يشتغل فقط على السيرفر — المفتاح مخفي تماماً

function getKey(): string {
  const key = process.env.ENCRYPTION_KEY // بدون NEXT_PUBLIC_
  if (!key) throw new Error('ENCRYPTION_KEY غير موجود في environment variables')
  return key
}

// تشفير AES-GCM — server only
export async function encryptData(text: string): Promise<string> {
  if (!text) return ''
  try {
    const KEY = getKey()
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
    const combined = [...Array.from(iv), ...Array.from(new Uint8Array(encrypted))]
    return Buffer.from(combined).toString('base64')
  } catch (e) {
    throw new Error('فشل التشفير: ' + (e as Error).message)
  }
}

// فك تشفير AES-GCM — server only
export async function decryptData(encoded: string): Promise<string> {
  if (!encoded) return ''
  try {
    const KEY = getKey()
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const combined = Array.from(Buffer.from(encoded, 'base64'))
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
  } catch (e) {
    throw new Error('فشل فك التشفير')
  }
}