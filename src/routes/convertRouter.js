const express = require("express");
const router = express.Router();
const { validateRequest, schemas } = require("../middleware/validateRequest");
const rapidApiAuth = require("../middleware/rapidApiAuth");
const { single: uploadSingle } = require("../config/multer");
const { convertDocument } = require("../controllers/convertController");

router.post(
  "/",
  rapidApiAuth,
  uploadSingle,
  validateRequest(schemas.convert),
  convertDocument
);

module.exports = router;
