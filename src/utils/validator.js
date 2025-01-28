const ApiError = require("./apiError");

class Validator {
  static isValidFileSize(size, maxSize) {
    return size <= maxSize;
  }

  static isValidMimeType(mimeType, allowedTypes) {
    return allowedTypes.includes(mimeType);
  }

  static validateSubscriptionTier(tier, allowedTiers) {
    if (!allowedTiers.includes(tier.toLowerCase())) {
      throw new ApiError(
        403,
        "Your subscription tier does not have access to this feature"
      );
    }
  }

  static validateFileInput(file, options = {}) {
    const {
      maxSize = 52428800,
      allowedTypes = [
        "application/pdf",
        "application/msword",
        "image/jpeg",
        "image/png",
      ],
    } = options;

    if (!file) {
      throw ApiError.badRequest("No file provided");
    }

    if (!this.isValidFileSize(file.size, maxSize)) {
      throw ApiError.badRequest(
        `File size exceeds the limit of ${maxSize / (1024 * 1024)}MB`
      );
    }

    if (!this.isValidMimeType(file.mimetype, allowedTypes)) {
      throw ApiError.badRequest("File type not supported");
    }
  }
}

module.exports = Validator;
