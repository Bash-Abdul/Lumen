import NextAuth from "next-auth";
// import { authOptions } from '@/server/auth/auth'
import { authOptions } from '@/server/auth/auth'
import { loginRateLimiter, getClientIp, formatRateLimitReset } from "@/server/services/rate-limiter/rate-limiter";
import { NextResponse } from "next/server";


// const handler = NextAuth(authOptions)
// Wrap the handler to add rate limiting
async function handler(req, context) {
    // Only rate limit POST requests to /api/auth/callback/credentials (login)
    if (req.method === "POST" && req.url?.includes("/callback/credentials")) {
      const ip = getClientIp(req);
      
      // Check rate limit
      const { success, limit, reset, remaining } = await loginRateLimiter.limit(ip);
  
      if (!success) {
        const resetTime = formatRateLimitReset(reset - Date.now());
        
        return NextResponse.json(
          {
            error: `Too many login attempts. Please try again in ${resetTime}.`,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": new Date(reset).toISOString(),
            },
          }
        );
      }
    }
  
    // Continue with NextAuth
    return NextAuth(req, context, authOptions);
  }
  

export { handler as GET, handler as POST }
