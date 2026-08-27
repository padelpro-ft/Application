import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Server-side enforcement of the CLIENT / OWNER role split.
// This runs before any page in /owner or /client renders, so a CLIENT
// can never reach an owner page (and vice versa) no matter what the
// frontend does — the checks in the UI are just for a better experience.
export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isOwnerRoute = pathname.startsWith('/owner');
  const isClientRoute = pathname.startsWith('/client');

  if ((isOwnerRoute || isClientRoute) && !token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isOwnerRoute && token?.role !== 'OWNER') {
    return NextResponse.redirect(new URL('/client', req.url));
  }

  if (isClientRoute && token?.role !== 'CLIENT') {
    return NextResponse.redirect(new URL('/owner', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/owner/:path*', '/client/:path*'],
};
