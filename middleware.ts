import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/rate-limit"

// Add paths that don't require authentication
const publicPaths = ["/login", "/forgot-password"]

// Add paths that should be rate limited
const rateLimitedPaths = ["/api/auth/login"]

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  return "127.0.0.1"
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Apply rate limiting to specific paths
  if (rateLimitedPaths.includes(pathname)) {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }
  }

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return res
  }

  // Check for authentication
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Redirect to login if no session is present
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Create response with security headers
  const response = NextResponse.next()

  // Add security headers
  response.headers.set("X-DNS-Prefetch-Control", "on")
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

