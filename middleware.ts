import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './lib/i18n/routing'
import { createServerClient } from '@supabase/ssr'

const intlMiddleware = createMiddleware(routing)

const SELLER_ROUTES = ['/ar/seller', '/fr/seller']
const ADVERTISER_ROUTES = ['/ar/advertiser', '/fr/advertiser']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isSellerRoute = SELLER_ROUTES.some(r => pathname.startsWith(r))
  const isAdvertiserRoute = ADVERTISER_ROUTES.some(r => pathname.startsWith(r))

  if (isSellerRoute || isAdvertiserRoute) {
    let response = NextResponse.next({ request })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const locale = pathname.startsWith('/fr') ? 'fr' : 'ar'
      const loginUrl = new URL(`/${locale}/auth/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}