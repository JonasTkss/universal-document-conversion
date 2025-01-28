const express = require("express");
const router = express.Router();

const convertRouter = require("./convertRouter");
const compressRouter = require("./compressRouter");
const mergeRouter = require("./mergeRouter");
const splitRouter = require("./splitRouter");
const extractRouter = require("./extractRouter");
const statusRouter = require("./statusRouter");
const downloadRouter = require("./downloadRouter");

router.use("/convert", convertRouter);
router.use("/compress", compressRouter);
router.use("/merge", mergeRouter);
router.use("/split", splitRouter);
router.use("/extract", extractRouter);
router.use("/status", statusRouter);
router.use("/download", downloadRouter);

module.exports = router;
