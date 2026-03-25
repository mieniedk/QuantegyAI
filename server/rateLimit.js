const ipBuckets = new Map();

function nowMs() {
  return Date.now();
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

export function createInMemoryRateLimiter({ windowMs, maxRequests, keyPrefix }) {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const key = `${keyPrefix}:${ip}`;
    const now = nowMs();
    const bucket = ipBuckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    ipBuckets.set(key, bucket);

    const remaining = Math.max(0, maxRequests - bucket.count);
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please retry shortly.',
      });
    }
    next();
  };
}

