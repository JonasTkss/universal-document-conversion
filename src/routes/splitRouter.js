const express = require("express");
const router = express.Router();
const { validateRequest, schemas } = require("../middleware/validateRequest");
const rapidApiAuth = require("../middleware/rapidApiAuth");
const { single: uploadSingle } = require("../config/multer");
const { splitDocument } = require("../controllers/splitController");

router.post(
  "/",
  rapidApiAuth,
  uploadSingle,
  validateRequest(schemas.split),
  splitDocument
);

module.exports = router;
