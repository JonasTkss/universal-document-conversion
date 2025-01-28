const tesseract = require("node-tesseract-ocr");
const pdfParse = require("pdf-parse");
const sharp = require("sharp");
const ApiError = require("../utils/apiError");

class ExtractService {
  async extract(buffer, extractType, useOcr = false) {
    try {
      switch (extractType) {
        case "text":
          if (useOcr) {
            return await this.extractTextWithOCR(buffer);
          }
          return await this.extractText(buffer);
        case "images":
          return await this.extractImages(buffer);
        case "tables":
          return await this.extractTables(buffer);
        default:
          throw new ApiError(400, "Unsupported extraction type");
      }
    } catch (error) {
      throw new ApiError(500, `Extraction failed: ${error.message}`);
    }
  }

  async extractTextWithOCR(buffer) {
    const image = await sharp(buffer).toFormat("png").toBuffer();

    const config = {
      lang: "eng",
      oem: 1,
      psm: 3,
    };

    return await tesseract.recognize(image, config);
  }

  async extractText(buffer) {
    try {
      const options = {
        pagerender: this.customPageRenderer,
        max: 0,
        version: "v2.0.550",
      };

      const data = await pdfParse(buffer, options);

      return {
        text: data.text,
        numPages: data.numpages,
        info: {
          title: data.info?.Title || "",
          author: data.info?.Author || "",
          subject: data.info?.Subject || "",
          keywords: data.info?.Keywords || "",
        },
        metadata: {
          creationDate: data.metadata?._metadata?.creationDate || "",
          modDate: data.metadata?._metadata?.modDate || "",
          pageCount: data.numpages,
        },
      };
    } catch (error) {
      throw new Error(`PDF text extraction failed: ${error.message}`);
    }
  }

  customPageRenderer(pageData) {
    let render_options = {
      normalizeWhitespace: true,
      disableCombineTextItems: false,
    };

    return pageData.getTextContent(render_options).then(function (textContent) {
      let lastY,
        text = "";

      const items = textContent.items.sort(
        (a, b) => b.transform[5] - a.transform[5]
      );

      for (let item of items) {
        if (lastY !== item.transform[5]) {
          text += "\n";
          lastY = item.transform[5];
        }
        text += item.str;
      }

      return text;
    });
  }

  async extractImages(buffer) {
    try {
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const numPages = pdf.numPages;
      const images = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const ops = await page.getOperatorList();
        const imgIds = this._findImageIdsInOperatorList(ops);

        for (const imgId of imgIds) {
          try {
            const img = await page.objs.get(imgId);

            const imageData = await this._processImageData(img);

            if (imageData) {
              images.push({
                pageNumber: pageNum,
                data: imageData,
                format: this._determineImageFormat(img),
                width: img.width,
                height: img.height,
              });
            }
          } catch (imgError) {
            console.error(
              `Error extracting image ${imgId} from page ${pageNum}:`,
              imgError
            );
          }
        }
      }

      return images;
    } catch (error) {
      throw new ApiError(500, `Image extraction failed: ${error.message}`);
    }
  }

  async extractTables(buffer) {
    try {
      const options = {
        area: [],
        pages: "all",
        silent: true,
      };

      const tables = await new Promise((resolve, reject) => {
        const tempFilePath = `/tmp/pdf-${Date.now()}.pdf`;
        require("fs").writeFileSync(tempFilePath, buffer);

        tabula(tempFilePath, options)
          .extractCsv()
          .then((csvBuffer) => {
            require("fs").unlinkSync(tempFilePath);

            const csvString = csvBuffer.toString("utf8");
            const parsedTables = this._parseCSVToTables(csvString);
            resolve(parsedTables);
          })
          .catch((error) => {
            try {
              require("fs").unlinkSync(tempFilePath);
            } catch (cleanupError) {
              console.error("Error cleaning up temp file:", cleanupError);
            }
            reject(error);
          });
      });

      return {
        count: tables.length,
        tables: tables,
      };
    } catch (error) {
      throw new ApiError(500, `Table extraction failed: ${error.message}`);
    }
  }

  _findImageIdsInOperatorList(ops) {
    const imageIds = new Set();
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const imageArg = ops.argsArray[i][0];
        imageIds.add(imageArg);
      }
    }
    return Array.from(imageIds);
  }

  async _processImageData(img) {
    const imageData =
      img.data instanceof Uint8ClampedArray
        ? Buffer.from(img.data.buffer)
        : Buffer.from(img.data);

    try {
      return await sharp(imageData, {
        raw: {
          width: img.width,
          height: img.height,
          channels: 4,
        },
      })
        .jpeg({ quality: 90 })
        .toBuffer();
    } catch (error) {
      console.error("Error processing image:", error);
      return null;
    }
  }

  _determineImageFormat(img) {
    if (img.format === "JPEG") return "jpeg";
    if (img.format === "PNG") return "png";
    return "jpeg";
  }

  _parseCSVToTables(csvString) {
    const tables = [];
    let currentTable = [];

    const lines = csvString
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    for (const line of lines) {
      const row = line.split(",").map((cell) => cell.trim());

      if (row.every((cell) => cell === "")) {
        if (currentTable.length > 0) {
          tables.push(this._formatTable(currentTable));
          currentTable = [];
        }
        continue;
      }

      currentTable.push(row);
    }

    if (currentTable.length > 0) {
      tables.push(this._formatTable(currentTable));
    }

    return tables;
  }

  _formatTable(tableData) {
    const headers = tableData[0];
    const rows = tableData.slice(1);

    return {
      headers: headers,
      rows: rows,
      rowCount: rows.length,
      columnCount: headers.length,
    };
  }
}

module.exports = new ExtractService();
