const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const splitService = require("../services/splitService");

exports.splitDocument = asyncHandler(async (req, res) => {
  const { splitBy, outputFormat } = req.body;
  const inputFile = req.file;

  if (!inputFile) {
    throw new ApiError(400, "No file provided");
  }

  const splitResult = await splitService.split(
    inputFile.buffer,
    splitBy,
    outputFormat
  );

  const zipBuffer = await splitService.createZipFromBuffers(splitResult);

  res.set({
    "Content-Type": "application/zip",
    "Content-Disposition": 'attachment; filename="split-files.zip"',
    "Content-Length": zipBuffer.length,
  });

  res.send(zipBuffer);
});
