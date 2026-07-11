import { NextRequest, NextResponse } from 'next/server';

import { getSessionCookie } from 'better-auth/cookies';

const PUBLIC_ROUTES: string[] = [
    '/login',
    '/api/auth',
];

export function proxy( request: NextRequest ): NextResponse {
    const { pathname } = request.nextUrl;

    const isPublic = PUBLIC_ROUTES.some( ( route ) => pathname.startsWith( route ) );

    if ( isPublic ) {
        return NextResponse.next();
    }

    const sessionCookie = getSessionCookie( request );

    if ( !sessionCookie ) {
        const loginUrl = new URL( '/login', request.url );
        return NextResponse.redirect( loginUrl );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
