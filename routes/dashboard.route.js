const express = require('express');
const controller = require('../controllers/dashboard.controller');

const router = express.Router();

router.get("/getWidgetsCount", controller.getWidgetsCount);
router.get("/getLowStockProducts", controller.getLowStockProducts);


module.exports = router;
