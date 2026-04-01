'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const DEFAULT_CONTACT = {
  email: 'support@wibya.com',
  phone: '+212 6XX-XXXXXX',
  whatsapp: '+212 6XX-XXXXXX',
  address: 'المغرب',
}

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
const { data, error } = await supabase.from('site_settings').select('key, value')
console.log('settings:', data, error)
      if (data && data.length > 0) {
        const s: Record<string, string> = {}
        data.forEach(({ key, value }) => { s[key] = value })
        setContactInfo({
          email: s['contact_email'] || DEFAULT_CONTACT.email,
          phone: s['contact_phone'] || DEFAULT_CONTACT.phone,
          whatsapp: s['contact_whatsapp'] || DEFAULT_CONTACT.whatsapp,
          address: s['contact_address'] || DEFAULT_CONTACT.address,
        })
      }
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: admin } = await supabase
      .from('profiles').select('id').eq('role', 'admin').single()
    if (admin?.id) {
      await supabase.from('notifications').insert({
        user_id: admin.id,
        title: '📧 رسالة تواصل جديدة',
        body: `من ${name} (${email}): ${message.slice(0, 80)}`,
        type: 'product',
        is_read: false,
      })
    }
    toast.success('تم إرسال رسالتك! سنرد عليك قريباً')
    setName(''); setEmail(''); setMessage('')
    setLoading(false)
  }

  const contactItems = [
    { icon: Mail, label: 'البريد الإلكتروني', value: contactInfo.email, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', href: `mailto:${contactInfo.email}` },
    { icon: Phone, label: 'الهاتف', value: contactInfo.phone, color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400', href: `tel:${contactInfo.phone}` },
    { icon: MapPin, label: 'العنوان', value: contactInfo.address, color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', href: null },
    { icon: MessageCircle, label: 'واتساب', value: contactInfo.whatsapp, color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400', href: `https://wa.me/${contactInfo.whatsapp.replace(/[\s+]/g, '')}` },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-5 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">تواصل معنا</h1>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {contactItems.map(({ icon: Icon, label, value, color, href }) =>
            href ? (
              <a key={label} href={href} target="_blank" rel="noreferrer"
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-center gap-3 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="text-xs text-neutral-400 dark:text-neutral-500">{label}</div>
                  <div className="font-medium text-sm text-neutral-900 dark:text-white">{value}</div>
                </div>
              </a>
            ) : (
              <div key={label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="text-xs text-neutral-400 dark:text-neutral-500">{label}</div>
                  <div className="font-medium text-sm text-neutral-900 dark:text-white">{value}</div>
                </div>
              </div>
            )
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5">
          <h2 className="font-bold text-neutral-900 dark:text-white mb-4">أرسل رسالة</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="اسمك" required />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="بريدك الإلكتروني" required dir="ltr" />
            <textarea value={message} onChange={e => setMessage(e.target.value)} className="input resize-none" rows={4} placeholder="رسالتك..." required />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            </button>
          </form>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}