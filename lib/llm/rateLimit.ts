const MAX_CONCURRENT = 3;

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

let inflight = 0;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export class RateLimitError extends Error {
  code: "RATE_LIMIT" | "SERVER_BUSY";
  retryAfterSeconds?: number;

  constructor(
    code: "RATE_LIMIT" | "SERVER_BUSY",
    message: string,
    retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "RateLimitError";
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function tryAcquire(): boolean {
  if (inflight >= MAX_CONCURRENT) return false;
  inflight++;
  return true;
}

export function release(): void {
  if (inflight > 0) inflight--;
}

export function getClientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

export function checkRateLimit(req: Request): void {
  const now = Date.now();
  const key = getClientKey(req);

  // Lightweight cleanup of expired buckets
  for (const [bucketKey, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(bucketKey);
    }
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return;
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000)
    );

    throw new RateLimitError(
      "RATE_LIMIT",
      "Rate limit exceeded. Please wait a moment and try again.",
      retryAfterSeconds
    );
  }

  existing.count += 1;
}

export function acquireOrThrow(req: Request): void {
  // Check concurrency first — SERVER_BUSY must not consume per-IP quota
  if (inflight >= MAX_CONCURRENT) {
    throw new RateLimitError(
      "SERVER_BUSY",
      "Server is busy right now. Please try again in a moment.",
      5
    );
  }

  checkRateLimit(req);
  inflight++;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}
