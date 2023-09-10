const express = require('express');
const controller = require('../controllers/product.controller');
const imageUploader = require('../helpers/image-uploader')

const router = express.Router();

router.post("/createProduct", imageUploader.upload.single('imgFilename'), controller.createProduct);
router.post("/updateProduct",  imageUploader.upload.single('newImgFilename'), controller.updateProduct);
router.get("/getAllProducts", controller.getAllProducts);
router.get("/getSpecificProduct/:id", controller.getSpecificProduct);
router.get("/getSpecificProductByBarcode/:id", controller.getSpecificProductByBarcode);
router.post("/buyProductViaBarcode", controller.buyProductViaBarcode);

module.exports = router;