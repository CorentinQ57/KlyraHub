import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Set CORS headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Add CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  
  // Check if the request is for a protected route
  const url = request.nextUrl.clone();
  const isDashboardRoute = url.pathname.startsWith('/dashboard');
  const isAdminRoute = url.pathname.startsWith('/admin');
  const isAuthRoute = url.pathname.startsWith('/login') || 
                      url.pathname.startsWith('/signup') ||
                      url.pathname.startsWith('/forgot-password') ||
                      url.pathname.startsWith('/reset-password');
  
  // If it's not a protected route, return the response
  if (!isDashboardRoute && !isAdminRoute && !isAuthRoute) {
    return response;
  }
  
  // Create Supabase client
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Get session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    // Handle authentication for dashboard routes
    if (isDashboardRoute) {
      if (!session) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
      
      return response;
    }
    
    // Handle authentication for admin routes
    if (isAdminRoute) {
      if (!session) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
      
      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (!profile || profile.role !== 'admin') {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
      
      return response;
    }
    
    // Handle authentication for auth routes (login, signup, etc.)
    if (isAuthRoute && session) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    
    return response;
  } catch (error) {
    console.error('Middleware auth error:', error);
    
    // If there's an error, redirect to login for protected routes
    if (isDashboardRoute || isAdminRoute) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 