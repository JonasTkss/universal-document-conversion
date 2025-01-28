const express = require("express");
const router = express.Router();
const { validateRequest, schemas } = require("../middleware/validateRequest");
const rapidApiAuth = require("../middleware/rapidApiAuth");
const { single: uploadSingle } = require("../config/multer");
const { compressDocument } = require("../controllers/compressController");

router.post(
  "/",
  rapidApiAuth,
  uploadSingle,
  validateRequest(schemas.compress),
  compressDocument
);

module.exports = router;
