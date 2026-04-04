import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wibya.com'

  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/search', priority: 0.9, freq: 'daily' as const },
    { path: '/for-developers', priority: 0.8, freq: 'weekly' as const },
    { path: '/about', priority: 0.6, freq: 'monthly' as const },
    { path: '/contact', priority: 0.6, freq: 'monthly' as const },
    { path: '/terms', priority: 0.4, freq: 'monthly' as const },
    { path: '/privacy', priority: 0.4, freq: 'monthly' as const },
    { path: '/cookies', priority: 0.3, freq: 'monthly' as const },
    { path: '/refund', priority: 0.4, freq: 'monthly' as const },
  ]

  const routes: MetadataRoute.Sitemap = []

  // Arabic pages (primary)
  for (const { path, priority, freq } of staticPages) {
    routes.push({
      url: `${baseUrl}/ar${path}`,
      lastModified: new Date(),
      changeFrequency: freq,
      priority,
    })
  }

  // French pages
  for (const { path, priority, freq } of staticPages) {
    routes.push({
      url: `${baseUrl}/fr${path}`,
      lastModified: new Date(),
      changeFrequency: freq,
      priority: priority * 0.9,
    })
  }

  return routes
}