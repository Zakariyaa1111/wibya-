import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CookieBanner } from '@/components/layout/CookieBanner'
import type { Metadata } from 'next'

const locales = ['ar', 'fr']

export const metadata: Metadata = {
  title: {
    default: 'Wibya — سوق المنتجات الرقمية',
    template: '%s | Wibya',
  },
  description: 'سوق عربي للمنتجات الرقمية — قوالب، أدوات، دورات تعليمية',
  keywords: ['قوالب', 'منتجات رقمية', 'دورات', 'مطورين', 'عرب', 'Wibya'],
  authors: [{ name: 'Wibya' }],
  creator: 'Wibya',
  metadataBase: new URL('https://wibya.com'),
  openGraph: {
    type: 'website',
    locale: 'ar_MA',
    url: 'https://wibya.com',
    siteName: 'Wibya',
    title: 'Wibya — سوق المنتجات الرقمية',
    description: 'سوق عربي للمنتجات الرقمية — قوالب، أدوات، دورات تعليمية',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Wibya' }],
  },
  twitter: {
    card: 'summary',
    title: 'Wibya — سوق المنتجات الرقمية',
    description: 'سوق عربي للمنتجات الرقمية',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
}

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-neutral-50 dark:bg-neutral-950 font-arabic antialiased">
        {/* Skip to main content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-neutral-900 focus:text-white focus:rounded-xl focus:text-sm focus:font-medium"
        >
          {locale === 'ar' ? 'تخطى للمحتوى الرئيسي' : 'Aller au contenu principal'}
        </a>

        <NextIntlClientProvider locale={locale} messages={messages}>
          <main id="main-content">
            {children}
          </main>
        </NextIntlClientProvider>

        {/* GDPR/CNDP Cookie Banner */}
        <CookieBanner />
      </body>
    </html>
  )
}