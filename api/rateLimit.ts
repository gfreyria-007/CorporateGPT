/**
 * api/rateLimit.ts — Simple In-Memory Rate Limiter
 * 
 * Provides basic rate limiting per user/IP.
 * Note: Works within a single serverless instance.
 * For production, use Redis (e.g., Upstash) for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 30; // 30 requests per minute per user

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetIn: WINDOW_MS,
    };
  }
  
  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }
  
  entry.count++;
  
  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetIn: entry.resetTime - now,
  };
}

export function getIdentifier(req: { headers: { [key: string]: string | string[] | undefined }, body?: { userId?: string } }): string {
  const userId = req.body?.userId;
  if (userId) {
    return `user:${userId}`;
  }
  
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const realIp = req.headers['x-real-ip'];
  const realIpStr = Array.isArray(realIp) ? realIp[0] : realIp;
  const ip = forwardedIp ? forwardedIp.split(',')[0].trim() : realIpStr || 'unknown';
  
  return `ip:${ip}`;
}

export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

