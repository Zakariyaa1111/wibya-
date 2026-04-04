import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wibya.com'
  const locales = ['ar', 'fr']

  const staticPages = [
    '',
    '/search',
    '/for-developers',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/cookies',
    '/refund',
  ]

  const routes: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const page of staticPages) {
      routes.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      })
    }
  }

  return routes
}