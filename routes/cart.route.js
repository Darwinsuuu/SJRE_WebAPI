const express = require('express');
const controller = require('../controllers/cart.controller');

const router = express.Router();

router.get("/getAllMyCartList/:id", controller.getAllMyCartList);
router.post("/createCart", controller.createCart);
router.post("/updateCart", controller.updateCart);
router.get("/deleteCart/:id", controller.deleteCart);
router.post("/checkout/", controller.checkout);

module.exports = router;