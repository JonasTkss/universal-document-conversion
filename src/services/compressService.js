const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");
const ApiError = require("../utils/apiError");

class CompressService {
  async compress(buffer, mimeType, compressionLevel = "medium") {
    try {
      if (mimeType.startsWith("image/")) {
        return await this.compressImage(buffer, compressionLevel);
      } else if (mimeType === "application/pdf") {
        return await this.compressPDF(buffer, compressionLevel);
      } else {
        throw new ApiError(400, "Unsupported file type for compression");
      }
    } catch (error) {
      throw new ApiError(500, `Compression failed: ${error.message}`);
    }
  }

  async compressImage(buffer, compressionLevel) {
    const quality = this.getCompressionQuality(compressionLevel);
    return await sharp(buffer).jpeg({ quality }).toBuffer();
  }

  async compressPDF(buffer, compressionLevel) {
    const pdfDoc = await PDFDocument.load(buffer);
    return await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
  }

  getCompressionQuality(level) {
    switch (level) {
      case "low":
        return 80;
      case "medium":
        return 60;
      case "high":
        return 40;
      default:
        return 60;
    }
  }
}

module.exports = new CompressService();
