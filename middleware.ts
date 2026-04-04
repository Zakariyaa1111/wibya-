import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './lib/i18n/routing'
import { createServerClient } from '@supabase/ssr'

const intlMiddleware = createMiddleware(routing)

const DEVELOPER_ROUTES = ['/ar/developer', '/fr/developer']
const ADMIN_ROUTES = ['/ar/admin', '/fr/admin']
const PROTECTED_ROUTES = ['/ar/purchases', '/fr/purchases', '/ar/wishlist', '/fr/wishlist']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isDeveloperRoute = DEVELOPER_ROUTES.some(r => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))
  const isProtectedRoute = PROTECTED_ROUTES.some(r => pathname.startsWith(r))

  if (isDeveloperRoute || isAdminRoute || isProtectedRoute) {
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

    // فحص role للأدمن والمطور
    if (isAdminRoute || isDeveloperRoute) {
      const adminSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll() {},
          },
        }
      )

      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (isAdminRoute && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/ar', request.url))
      }

      if (isDeveloperRoute && profile?.role !== 'developer' && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/ar', request.url))
      }
    }

    return response
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}