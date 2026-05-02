/**
 * api/rateLimit.ts — Redis-Based Rate Limiter for Serverless
 * 
 * Uses Upstash Redis for distributed rate limiting across serverless instances.
 * Fallback to simple in-memory if Redis unavailable (dev mode).
 */

import { Redis } from '@upstash/redis';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;

let redis: Redis | null = null;
try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    redis = new Redis({ url: redisUrl, token: redisToken });
  }
} catch { redis = null; }

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const now = Date.now();
  
  if (redis) {
    try {
      const key = `ratelimit:${identifier}`;
      const current = await redis.get<number>(key);
      
      if (!current || now > current) {
        await redis.set(key, now + WINDOW_MS, { EX: 120 });
        return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
      }
      
      const used = await redis.incr(key);
      if (used === 1) {
        await redis.expire(key, 60);
      }
      
      const ttl = await redis.ttl(key);
      const remaining = MAX_REQUESTS - used;
      
      if (remaining < 0) {
        return { allowed: false, remaining: 0, resetIn: Math.max(0, ttl * 1000) };
      }
      
      return { allowed: true, remaining, resetIn: Math.max(0, ttl * 1000) };
    } catch {
      // Fallback to memory on error
    }
  }
  
  const entry = rateLimitStore.get(identifier);
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }
  
  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }
  
  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetIn: entry.resetTime - now };
}

export function getIdentifier(req: { headers: { [key: string]: string | string[] | undefined }, body?: { userId?: string } }): string {
  const userId = req.body?.userId;
  if (userId) return `user:${userId}`;
  
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) ? forwarded[0].split(',')[0].trim() : forwarded?.split(',')[0].trim() || 'unknown';
  return `ip:${ip}`;
}