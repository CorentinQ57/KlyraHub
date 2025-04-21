import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vérifier si la route concerne la documentation
  const url = request.nextUrl.clone();
  const isDocsRoute = url.pathname.startsWith('/dashboard/docs');
  
  // Si c'est une route de documentation, autoriser l'accès sans autre vérification
  if (isDocsRoute) {
    return NextResponse.next();
  }
  
  // Pour les autres routes, continuer avec le comportement normal
  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 