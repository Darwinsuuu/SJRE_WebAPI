const express = require('express');
const controller = require('../controllers/reports.controller');

const router = express.Router();

router.get("/downloadReports", controller.downloadReports);

module.exports = router;