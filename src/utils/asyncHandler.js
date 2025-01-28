const ApiError = require("./apiError");

/**
 * Wraps an async function and handles any errors that occur
 * @param {Function} fn - Async function to be wrapped
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (err instanceof ApiError) {
      next(err);
      return;
    }

    if (err.name === "ValidationError") {
      next(ApiError.badRequest(err.message));
      return;
    }

    if (err.name === "UnauthorizedError") {
      next(ApiError.unauthorized(err.message));
      return;
    }

    if (err.name === "ForbiddenError") {
      next(ApiError.forbidden(err.message));
      return;
    }

    console.error("Unexpected error:", err);

    next(ApiError.internal("An unexpected error occurred"));
  });
};

module.exports = asyncHandler;
