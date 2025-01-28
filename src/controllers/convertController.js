const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const convertService = require("../services/convertService");

exports.convertDocument = asyncHandler(async (req, res) => {
  const { outputFormat } = req.body;
  const inputFile = req.file;

  if (!inputFile) {
    throw new ApiError(400, "No file provided");
  }

  const convertedBuffer = await convertService.convert(
    inputFile.buffer,
    outputFormat
  );

  res.set({
    "Content-Type": `application/${outputFormat}`,
    "Content-Disposition": `attachment; filename="converted.${outputFormat}"`,
    "Content-Length": convertedBuffer.length,
  });

  res.send(convertedBuffer);
});
