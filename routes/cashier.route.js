const express = require('express');
const controller = require('../controllers/cashier.controller');

const router = express.Router();

router.post("/createCashier", controller.createCashier);
router.post("/updateCashier", controller.updateCashier);
router.get("/getAllCashierList", controller.getAllCashierList);

module.exports = router;