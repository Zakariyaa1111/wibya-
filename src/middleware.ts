import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from '../lib/i18n/routing'
import { createServerClient } from '@supabase/ssr'

const intlMiddleware = createMiddleware(routing)

// Protected routes
const SELLER_ROUTES = ['/seller', '/fr/seller']
const ADMIN_ROUTES = ['/admin', '/fr/admin']
const ADVERTISER_ROUTES = ['/advertiser', '/fr/advertiser']
const AUTH_ROUTES = ['/auth', '/fr/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle i18n first
  const intlResponse = intlMiddleware(request)

  // Check auth for protected routes
  const isSellerRoute = SELLER_ROUTES.some(r => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))
  const isAdvertiserRoute = ADVERTISER_ROUTES.some(r => pathname.startsWith(r))

  if (isSellerRoute || isAdminRoute || isAdvertiserRoute) {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
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
      const loginUrl = new URL(locale === 'fr' ? '/fr/auth/login' : '/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check role for admin
    if (isAdminRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return intlResponse
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
