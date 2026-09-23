// Lightweight in-memory rate limiter for sensitive authentication endpoints
const rateLimitMap = new Map();

export const authRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const maxRequests = options.max || 30; // max 30 attempts per window

  return (req, res, next) => {
    // In local development or testing, skip if requested
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(ip, record);

    if (record.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message: `Too many login/registration attempts. Please wait ${Math.ceil(retryAfterSeconds / 60)} minutes before retrying.`
      });
    }

    next();
  };
};
