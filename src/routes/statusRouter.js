const express = require("express");
const router = express.Router();
const { validateRequest, schemas } = require("../middleware/validateRequest");
const rapidApiAuth = require("../middleware/rapidApiAuth");
const { getJobStatus } = require("../controllers/statusController");

router.get(
  "/:jobId",
  rapidApiAuth,
  validateRequest(schemas.status),
  getJobStatus
);

module.exports = router;
