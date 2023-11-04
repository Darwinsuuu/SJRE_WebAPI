const express = require('express');
const controller = require('../controllers/cart.controller');
const imageUploader = require('../helpers/image-uploader')

const router = express.Router();

router.get("/getAllMyCartList/:id", controller.getAllMyCartList);
router.post("/createCart", controller.createCart);
router.post("/updateCart", controller.updateCart);
router.get("/deleteCart/:id", controller.deleteCart);
router.get("/getAllPurchasesById/:id", controller.getAllPurchasesById);

// router.post("/checkout/", controller.checkout);
router.post("/checkout", imageUploader.upload.single('imgFilename'), controller.checkout);

module.exports = router;