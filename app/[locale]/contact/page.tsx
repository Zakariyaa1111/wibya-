'use client'
import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('تم إرسال رسالتك! سنرد عليك قريباً')
    setName(''); setEmail(''); setMessage('')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pb-24 pt-6 px-5 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">تواصل معنا</h1>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {[
            { icon: Mail, label: 'البريد الإلكتروني', value: 'support@wibya.com', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
            { icon: Phone, label: 'الهاتف', value: '+212 6XX-XXXXXX', color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
            { icon: MapPin, label: 'العنوان', value: 'المغرب', color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
            { icon: MessageCircle, label: 'واتساب', value: '+212 6XX-XXXXXX', color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="text-xs text-neutral-400 dark:text-neutral-500">{label}</div>
                <div className="font-medium text-sm text-neutral-900 dark:text-white">{value}</div>
              </div>
            </div>
          ))}
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