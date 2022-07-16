export const config = {
	matcher: '/answer/:path*',
}
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function middleware(req: NextRequest) {
	if (!req.cookies.get('sb-access-token')) {
		return NextResponse.redirect(new URL('/', req.url))
	}
	return NextResponse.next()
}
