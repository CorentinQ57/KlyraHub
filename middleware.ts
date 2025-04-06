import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Env variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function middleware(request: NextRequest) {
  // Clone the request headers and add pathname
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  
  // Create response with the modified headers
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
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/signup') ||
                    request.nextUrl.pathname.startsWith('/forgot-password') ||
                    request.nextUrl.pathname.startsWith('/reset-password');
  
  // If it's not a protected route, return the response
  if (!isDashboardRoute && !isAdminRoute && !isAuthRoute) {
    return response;
  }
  
  // Create a Supabase client with the request cookies
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    },
  });
  
  try {
    // Try to get the user using the cookie sent from the browser
    const { data: { user } } = await supabase.auth.getUser();
    
    // Handle authentication for dashboard routes
    if (isDashboardRoute) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      return response;
    }
    
    // Handle authentication for admin routes
    if (isAdminRoute) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      return response;
    }
    
    // Handle authentication for auth routes (login, signup, etc.)
    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return response;
  } catch (error) {
    console.error('Middleware auth error:', error);
    
    // If there's an error, redirect to login for protected routes
    if (isDashboardRoute || isAdminRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
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