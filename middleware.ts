import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  // For non-protected routes, simply proceed
  if (!isDashboardRoute && !isAdminRoute) {
    return NextResponse.next();
  }
  
  // Check if we have a session cookie
  const hasCookie = request.cookies.has('sb-access-token') || 
                    request.cookies.has('sb-refresh-token') ||
                    request.cookies.has('sb-auth-token') ||
                    request.cookies.has('supabase-auth-token') ||
                    request.cookies.getAll().some(cookie => cookie.name.includes('sb-') && cookie.name.includes('auth'));
                    
  // If no cookie, redirect to login
  if (!hasCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If we reach here, the user has a cookie, so we'll allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
} 