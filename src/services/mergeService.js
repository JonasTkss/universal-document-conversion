const { PDFDocument } = require("pdf-lib");
const libre = require("libreoffice-convert");
const util = require("util");
const ApiError = require("../utils/apiError");

class MergeService {
  async merge(files, outputFormat) {
    try {
      if (outputFormat === "pdf") {
        return await this.mergePDFs(files);
      } else if (outputFormat === "docx") {
        return await this.mergeDocuments(files);
      } else {
        throw new ApiError(400, "Unsupported format for merging");
      }
    } catch (error) {
      throw new ApiError(500, `Merge failed: ${error.message}`);
    }
  }

  async mergePDFs(files) {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const copiedPages = await mergedPdf.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices()
      );
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return await mergedPdf.save();
  }

  async mergeDocuments(files) {
    const pdfs = await Promise.all(
      files.map((file) => convertAsync(file.buffer, ".pdf", undefined))
    );

    const mergedPdf = await this.mergePDFs(
      pdfs.map((pdf) => ({ buffer: pdf }))
    );
    return await convertAsync(mergedPdf, ".docx", undefined);
  }
}

module.exports = new MergeService();
