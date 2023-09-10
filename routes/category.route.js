const express = require('express');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

router.post("/createCategory", categoryController.createCategory);
router.post("/updateCategory", categoryController.updateCategory);
router.get("/getAllCategoryList", categoryController.getAllCategoryList);

module.exports = router;