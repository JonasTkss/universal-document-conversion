const { PDFDocument } = require("pdf-lib");
const archiver = require("archiver");
const ApiError = require("../utils/apiError");

class SplitService {
  async split(buffer, splitBy, outputFormat) {
    try {
      if (outputFormat === "pdf") {
        return await this.splitPDF(buffer, splitBy);
      } else {
        throw new ApiError(400, "Unsupported format for splitting");
      }
    } catch (error) {
      throw new ApiError(500, `Split failed: ${error.message}`);
    }
  }

  async splitPDF(buffer, splitBy) {
    const pdfDoc = await PDFDocument.load(buffer);
    const pageCount = pdfDoc.getPageCount();
    const splitFiles = [];

    if (splitBy === "pages") {
      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);
        splitFiles.push(await newPdf.save());
      }
    }

    return splitFiles;
  }

  async createZipFromBuffers(buffers) {
    return new Promise((resolve, reject) => {
      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      const chunks = [];
      archive.on("data", (chunk) => chunks.push(chunk));
      archive.on("end", () => resolve(Buffer.concat(chunks)));
      archive.on("error", (err) => reject(err));

      buffers.forEach((buffer, index) => {
        archive.append(buffer, { name: `split-${index + 1}.pdf` });
      });

      archive.finalize();
    });
  }
}

module.exports = new SplitService();
