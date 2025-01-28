const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const compressService = require("../services/compressService");

exports.compressDocument = asyncHandler(async (req, res) => {
  const { compressionLevel } = req.body;
  const inputFile = req.file;

  if (!inputFile) {
    throw new ApiError(400, "No file provided");
  }

  const compressedBuffer = await compressService.compress(
    inputFile.buffer,
    inputFile.mimetype,
    compressionLevel
  );

  res.set({
    "Content-Type": inputFile.mimetype,
    "Content-Disposition": 'attachment; filename="compressed-file"',
    "Content-Length": compressedBuffer.length,
  });

  res.send(compressedBuffer);
});
