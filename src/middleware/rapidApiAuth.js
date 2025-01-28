const ApiError = require("../utils/apiError");

const rapidApiAuth = (req, res, next) => {
  const rapidApiKey = req.headers["x-rapidapi-key"];

  if (!rapidApiKey) {
    throw new ApiError(401, "API key is required");
  }

  const subscriptionTier =
    req.headers["x-rapidapi-subscription-tier"] || "free";

  req.subscription = {
    tier: subscriptionTier.toLowerCase(),
    key: rapidApiKey,
  };

  next();
};

module.exports = rapidApiAuth;
