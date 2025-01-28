const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const mergeService = require("../services/mergeService");

exports.mergeDocuments = asyncHandler(async (req, res) => {
  const { outputFormat } = req.body;
  const files = req.files;

  if (!files || files.length < 2) {
    throw new ApiError(400, "At least two files are required for merging");
  }

  const mergedBuffer = await mergeService.merge(files, outputFormat);

  res.set({
    "Content-Type": `application/${outputFormat}`,
    "Content-Disposition": `attachment; filename="merged.${outputFormat}"`,
    "Content-Length": mergedBuffer.length,
  });

  res.send(mergedBuffer);
});
