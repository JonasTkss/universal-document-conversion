const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const extractService = require("../services/extractService");

exports.extractContent = asyncHandler(async (req, res) => {
  const { extractType, ocr } = req.body;
  const inputFile = req.file;

  if (!inputFile) {
    throw new ApiError(400, "No file provided");
  }

  const extractedContent = await extractService.extract(
    inputFile.buffer,
    extractType,
    ocr
  );

  res.json({
    status: "success",
    data: {
      content: extractedContent,
    },
  });
});
