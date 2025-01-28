const express = require("express");
const router = express.Router();
const { validateRequest, schemas } = require("../middleware/validateRequest");
const rapidApiAuth = require("../middleware/rapidApiAuth");
const { single: uploadSingle } = require("../config/multer");
const { extractContent } = require("../controllers/extractController");

router.post(
  "/",
  rapidApiAuth,
  uploadSingle,
  validateRequest(schemas.extract),
  extractContent
);

module.exports = router;
