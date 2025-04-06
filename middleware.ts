import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Env variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Processing request for: ${request.nextUrl.pathname}`)
  
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  // Create response
  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  
  // Get auth cookies
  const supabaseCookie = request.cookies.get('sb-auth-token')?.value
  console.log(`[Middleware] Auth cookie present: ${!!supabaseCookie}`)
  
  // Check if we have a session
  const hasSession = !!supabaseCookie
  
  // Auth protection for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !hasSession) {
    console.log(`[Middleware] Redirecting to login: No session for dashboard access`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Auth protection for admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && hasSession) {
    console.log(`[Middleware] Checking admin access rights`)
    // Create a client to check the role
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Set the auth cookie
    supabase.auth.setSession({
      access_token: supabaseCookie,
      refresh_token: ''
    })
    
    // Check user role
    console.log(`[Middleware] Getting user data from auth token`)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log(`[Middleware] Error getting user: ${userError.message}`)
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    if (user) {
      console.log(`[Middleware] User found, id: ${user.id}. Checking role.`)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.log(`[Middleware] Error fetching profile: ${profileError.message}`)
      }
      
      console.log(`[Middleware] User role: ${profile?.role || 'unknown'}`)
      
      if (!profile || profile.role !== 'admin') {
        console.log(`[Middleware] Not admin, redirecting to dashboard`)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      console.log(`[Middleware] Admin access granted`)
    } else {
      console.log(`[Middleware] No user found with token, redirecting to login`)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Add CORS headers
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  console.log(`[Middleware] Request processed successfully`)
  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 