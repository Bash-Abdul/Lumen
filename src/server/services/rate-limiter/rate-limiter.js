// server/services/rate-limiter.js
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../redis/redis";

// Rate limiter for login attempts (by IP)
// 5 requests per 15 minutes
export const loginRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "@ratelimit:login",
});

// Rate limiter for signup (by IP)
// 3 signups per hour to prevent spam
export const signupRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
  prefix: "@ratelimit:signup",
});

// Rate limiter for password reset (by email)
// 3 requests per hour per email
export const passwordResetRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
  prefix: "@ratelimit:password-reset",
});

/**
 * Get client IP from request headers
 * Handles various proxy headers
 */
export function getClientIp(request) {
  // Check common headers set by proxies/load balancers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare

  if (forwarded) {
    // x-forwarded-for can be: "client, proxy1, proxy2"
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback (shouldn't happen in production)
  return "unknown";
}

/**
 * Format remaining time for user-friendly error messages
 */
export function formatRateLimitReset(resetMs) {
  const seconds = Math.ceil(resetMs / 1000);
  
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? "" : "s"}`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}