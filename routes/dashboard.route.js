const express = require('express');
const controller = require('../controllers/dashboard.controller');

const router = express.Router();

router.get("/getWidgetsCount", controller.getWidgetsCount);


module.exports = router;
