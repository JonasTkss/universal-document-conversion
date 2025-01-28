class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;

    this.message = `[${this.status.toUpperCase()}] ${statusCode}: ${message}`;

    Error.captureStackTrace(this, this.constructor);

    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message.split(": ")[1],
      isOperational: this.isOperational,
      stack: process.env.NODE_ENV === "development" ? this.stack : undefined,
    };
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static tooManyRequests(message = "Too many requests") {
    return new ApiError(429, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message, false);
  }
}

module.exports = ApiError;
