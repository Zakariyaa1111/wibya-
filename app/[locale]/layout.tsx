import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CookieBanner } from '@/components/layout/CookieBanner'
import type { Metadata } from 'next'

const locales = ['ar', 'fr']

export const metadata: Metadata = {
  title: {
    default: 'Wibya — سوق المنتجات الرقمية العربي',
    template: '%s | Wibya',
  },
  description: 'سوق عربي للمنتجات الرقمية — قوالب احترافية، أدوات، ودورات تعليمية من أفضل المطورين العرب. كل منتج مفحوص بـ AI.',
  keywords: ['قوالب رقمية', 'منتجات رقمية', 'دورات برمجة', 'قوالب متاجر', 'مطورين عرب', 'Wibya'],
  authors: [{ name: 'Wibya' }],
  creator: 'Wibya',
  metadataBase: new URL('https://wibya.com'),
  alternates: {
    canonical: 'https://wibya.com/ar',
    languages: {
      'ar': 'https://wibya.com/ar',
      'fr': 'https://wibya.com/fr',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_MA',
    url: 'https://wibya.com',
    siteName: 'Wibya',
    title: 'Wibya — سوق المنتجات الرقمية العربي',
    description: 'سوق عربي للمنتجات الرقمية — قوالب احترافية، أدوات، ودورات تعليمية من أفضل المطورين العرب.',
    images: [
      {
        url: 'https://wibya.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Wibya — سوق المنتجات الرقمية العربي',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wibya — سوق المنتجات الرقمية العربي',
    description: 'سوق عربي للمنتجات الرقمية — قوالب، أدوات، ودورات تعليمية.',
    images: ['https://wibya.com/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  verification: {
    // أضف هنا بعد تسجيل Google Search Console
    // google: 'your-verification-code',
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
        {/* ✅ Bing / Microsoft verification */}
        {/* <meta name="msvalidate.01" content="YOUR_BING_CODE" /> */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
<script
  src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
  async
  defer
/>
</head>
      <body className="h-full bg-neutral-50 dark:bg-neutral-950 font-arabic antialiased">
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

        <CookieBanner />
      </body>
    </html>
  )
}