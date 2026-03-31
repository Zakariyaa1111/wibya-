import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CartProvider } from '@/lib/cart/CartContext'

const locales = ['ar', 'fr']

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>  // ← async الآن
}) {
  const { locale } = await params  // ← await

  if (!locales.includes(locale)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-neutral-50 font-arabic antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
  {children}
</CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
