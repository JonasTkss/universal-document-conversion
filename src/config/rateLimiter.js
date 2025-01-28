const rateLimit = require("express-rate-limit");

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: "error",
      message:
        message || "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const rateLimiters = {
  free: createRateLimiter(
    15 * 60 * 1000,
    100,
    "Free tier rate limit exceeded. Please upgrade your plan for higher limits."
  ),

  basic: createRateLimiter(
    15 * 60 * 1000,
    1000,
    "Basic tier rate limit exceeded. Please upgrade to Pro for higher limits."
  ),

  pro: createRateLimiter(15 * 60 * 1000, 5000, "Pro tier rate limit exceeded."),

  enterprise: createRateLimiter(15 * 60 * 1000, 50000),
};

const rateLimiterMiddleware = (req, res, next) => {
  const tier =
    req.headers["x-rapidapi-subscription-tier"]?.toLowerCase() || "free";

  const limiter = rateLimiters[tier] || rateLimiters.free;

  return limiter(req, res, next);
};

module.exports = rateLimiterMiddleware;
