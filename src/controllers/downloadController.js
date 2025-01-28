const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

exports.downloadFile = asyncHandler(async (req, res) => {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    throw new ApiError(400, "File URL is required");
  }

  res.json({
    status: "error",
    message:
      "Files are provided directly in the response of their respective endpoints",
  });
});
