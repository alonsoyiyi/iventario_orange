import { NextResponse } from 'next/server';

export function middleware(req) {
  // Lista de rutas que siempre deben estar accesibles
  const publicPaths = [
    '/',                   // Página principal
    '/api/auth/login',     // Login de Auth0
    '/api/auth/callback',  // Callback de Auth0
    '/api/auth/logout',    // Logout de Auth0
  ];

  // Verificar si estamos en una ruta pública
  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith('/_next/')
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verificar la cookie de Auth0
  const sessionCookie = req.cookies.get('appSession');
  
  // Si no hay cookie, redirigir a la página principal
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Si hay cookie, permitir el acceso
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except for:
     * 1. /api routes
     * 2. /_next (internal Next.js routes)
     * 3. /_static (static files)
     * 4. /favicon.ico, /images (public assets)
     */
    '/((?!api/|_next/|_static/|favicon.ico|images/).*)',
  ],
};