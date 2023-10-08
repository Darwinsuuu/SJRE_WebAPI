const express = require('express');
const authController = require('../controllers/review.controller');

const router = express.Router();

router.post("/addReview", authController.createComment);

module.exports = router;