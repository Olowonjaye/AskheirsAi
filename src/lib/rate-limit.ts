import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

// If Upstash env vars are not set, provide a noop/fallback rate limiter
// to avoid noisy build/runtime warnings while keeping requests allowed in dev.
let ratelimit: { limit: (id: string) => Promise<{ success: boolean; remaining?: number; reset?: number }> };

if (upstashUrl && upstashToken) {
  const redis = Redis.fromEnv();
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
  });
} else {
  console.warn(
    "[Upstash Redis] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN — using fallback noop ratelimit."
  );

  ratelimit = {
    limit: async () => ({ success: true, remaining: Number.MAX_SAFE_INTEGER, reset: 0 }),
  };
}

export { ratelimit };