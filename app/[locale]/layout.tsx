import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CartProvider } from '@/lib/cart/CartContext'
import { CookieBanner } from '@/components/layout/CookieBanner'

const locales = ['ar', 'fr']

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale)) notFound()

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className="h-full"
    >
      <head>
        {/* ✅ Accessibility: viewport meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* ✅ Theme color */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-neutral-50 dark:bg-neutral-950 font-arabic antialiased">
        {/* ✅ Skip to main content - accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-neutral-900 focus:text-white focus:rounded-xl focus:text-sm focus:font-medium"
        >
          {locale === 'ar' ? 'تخطى للمحتوى الرئيسي' : 'Aller au contenu principal'}
        </a>

        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <main id="main-content">
              {children}
            </main>
          </CartProvider>
        </NextIntlClientProvider>
        <CookieBanner />
      </body>
    </html>
  )
}