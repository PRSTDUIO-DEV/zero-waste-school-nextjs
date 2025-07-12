import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle invalid URLs during build time
  try {
    const url = new URL(request.url)
    
    // Skip middleware for API routes during build
    if (url.pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    
    // Handle not-found page
    if (url.pathname === '/_not-found') {
      return NextResponse.redirect(new URL('/not-found', request.url))
    }
    
    return NextResponse.next()
  } catch {
    // Handle invalid URL during build time
    console.warn('Invalid URL in middleware:', request.url)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 