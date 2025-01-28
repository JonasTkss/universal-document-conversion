const libre = require("libreoffice-convert");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const util = require("util");
const ApiError = require("../utils/apiError");

const convertAsync = util.promisify(libre.convert);

class ConvertService {
  async convert(buffer, outputFormat, options = {}) {
    try {
      switch (outputFormat.toLowerCase()) {
        case "pdf":
          return await this.convertToPdf(buffer, options);
        case "docx":
          return await this.convertToDocx(buffer);
        case "jpg":
        case "jpeg":
          return await this.convertToImage(buffer, "jpeg");
        case "png":
          return await this.convertToImage(buffer, "png");
        default:
          throw new ApiError(400, "Unsupported output format");
      }
    } catch (error) {
      throw new ApiError(500, `Conversion failed: ${error.message}`);
    }
  }

  async convertToPdf(buffer, options = {}) {
    try {
      if (this.isPDF(buffer)) {
        return await this.modifyPDF(buffer, options);
      }
      return await convertAsync(buffer, ".pdf", undefined);
    } catch (error) {
      throw new Error(`PDF conversion failed: ${error.message}`);
    }
  }

  async convertToDocx(buffer) {
    return await convertAsync(buffer, ".docx", undefined);
  }

  async convertToImage(buffer, format) {
    return await sharp(buffer).toFormat(format).toBuffer();
  }

  async modifyPDF(buffer, options = {}) {
    const pdfDoc = await PDFDocument.load(buffer);

    if (options.compress) {
      return await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
    }

    if (options.encrypt) {
      const encryptedPdf = await PDFDocument.create();
      const pages = await encryptedPdf.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices()
      );
      pages.forEach((page) => encryptedPdf.addPage(page));
      return await encryptedPdf.save({
        userPassword: options.userPassword,
        ownerPassword: options.ownerPassword,
      });
    }

    return await pdfDoc.save();
  }

  isPDF(buffer) {
    return buffer.toString("ascii", 0, 4) === "%PDF";
  }
}

module.exports = new ConvertService();
