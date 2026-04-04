import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/developer/dashboard',
          '/developer/wallet',
          '/developer/products/new',
          '/purchases',
          '/wishlist',
          '/profile',
          '/notifications',
          '/checkout',
          '/disputes',
        ],
      },
    ],
    sitemap: 'https://wibya.com/sitemap.xml',
    host: 'https://wibya.com',
  }
}