const express = require('express');
const controller = require('../controllers/order.controller');

const router = express.Router();

router.get("/getOrderByStatus/:status", controller.getOrderByStatus);
router.get("/getOrderById/:id", controller.getOrderById);
router.post("/updateOrderTransaction", controller.updateOrderTransaction);

module.exports = router;