import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intl = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin auth guard — protect /admin/* (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return supabaseResponse
  }

  // i18n locale detection for public routes
  // Skip: api, admin, portal, property, _next, _vercel, static files
  if (
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/portal') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/property') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/_vercel') &&
    !/\.[^/]+$/.test(pathname)
  ) {
    return intl(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Admin routes (auth guard)
    '/admin/:path*',
    '/api/admin/:path*',
    // Public routes (i18n locale detection)
    '/((?!_next|_vercel|api|admin|portal|auth|property|.*\\..*).*)' ,
  ],
}
