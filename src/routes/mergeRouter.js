const express = require("express");
const router = express.Router();
const { validateRequest, schemas } = require("../middleware/validateRequest");
const rapidApiAuth = require("../middleware/rapidApiAuth");
const { multiple: uploadMultiple } = require("../config/multer");
const { mergeDocuments } = require("../controllers/mergeController");

router.post(
  "/",
  rapidApiAuth,
  uploadMultiple,
  validateRequest(schemas.merge),
  mergeDocuments
);

module.exports = router;
