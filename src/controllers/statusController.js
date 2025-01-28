const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

exports.getJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    throw new ApiError(400, "Job ID is required");
  }

  // Since we're keeping the API stateless, this endpoint
  // will mainly be used for long-running operations that
  // might be implemented in the future
  res.json({
    status: "completed",
    message: "All operations are processed immediately",
  });
});
