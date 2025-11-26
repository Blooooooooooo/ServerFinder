import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith('/admin')) {
        const token = await getToken({ req });
        const adminIds = process.env.ADMIN_IDS?.split(',') || [];

        if (!token || !token.sub || !adminIds.includes(token.sub)) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
