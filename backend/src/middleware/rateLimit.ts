import rateLimit from 'express-rate-limit';

// Limit to 5 requests per minute per IP for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { message: 'Too many requests, please try again later.', code: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});
