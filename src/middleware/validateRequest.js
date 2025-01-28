const ApiError = require("../utils/apiError");
const Joi = require("joi");

const validateRequest = (schema) => {
  return (req, res, next) => {
    const validateOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    const dataToValidate = {
      body: req.body,
      query: req.query,
      params: req.params,
    };

    const { error, value } = schema.validate(dataToValidate, validateOptions);

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      throw new ApiError(400, errorMessage);
    }

    req.body = value.body;
    req.query = value.query;
    req.params = value.params;

    next();
  };
};

const schemas = {
  convert: Joi.object({
    body: Joi.object({
      outputFormat: Joi.string()
        .required()
        .valid("pdf", "docx", "txt", "jpg", "png")
        .messages({
          "string.valid":
            "Output format must be one of: pdf, docx, txt, jpg, png",
        }),
      conversionOptions: Joi.object({
        compression: Joi.string().valid("low", "medium", "high"),
        ocr: Joi.boolean(),
      }).optional(),
    }),
  }),

  compress: Joi.object({
    body: Joi.object({
      compressionLevel: Joi.string()
        .valid("low", "medium", "high")
        .default("medium"),
    }),
  }),

  merge: Joi.object({
    body: Joi.object({
      outputFormat: Joi.string().required().valid("pdf", "docx"),
    }),
  }),

  split: Joi.object({
    body: Joi.object({
      splitBy: Joi.string().required().valid("pages", "size", "bookmarks"),
      outputFormat: Joi.string().required().valid("pdf", "docx"),
    }),
  }),

  extract: Joi.object({
    body: Joi.object({
      extractType: Joi.string().required().valid("text", "images", "tables"),
      ocr: Joi.boolean().default(false),
    }),
  }),

  status: Joi.object({
    params: Joi.object({
      jobId: Joi.string()
        .required()
        .pattern(/^[a-zA-Z0-9-]+$/),
    }),
  }),

  download: Joi.object({
    query: Joi.object({
      fileUrl: Joi.string().required().uri(),
    }),
  }),
};

module.exports = {
  validateRequest,
  schemas,
};
