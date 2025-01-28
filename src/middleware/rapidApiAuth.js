const ApiError = require("../utils/apiError");

const rapidApiAuth = (req, res, next) => {
  const rapidApiKey = req.headers["x-rapidapi-key"];
  const rapidApiProxy = req.headers["x-rapidapi-proxy-secret"];
  const rapidApiHost = req.headers["x-rapidapi-host"];

  if (!rapidApiKey || !rapidApiProxy || !rapidApiHost) {
    throw new ApiError(
      401,
      "Unauthorized. This API is only accessible through RapidAPI."
    );
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
