import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware disabled for admin routes - using client-side protection in layout
  // This is because Zustand stores auth in localStorage which isn't accessible in middleware
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
