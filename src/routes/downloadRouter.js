const express = require("express");
const router = express.Router();
const { validateRequest, schemas } = require("../middleware/validateRequest");
const rapidApiAuth = require("../middleware/rapidApiAuth");
const { downloadFile } = require("../controllers/downloadController");

router.get("/", rapidApiAuth, validateRequest(schemas.download), downloadFile);

module.exports = router;
