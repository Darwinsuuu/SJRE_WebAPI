const express = require('express');
const controller = require('../controllers/emailer.controller');

const router = express.Router();

router.post("/sendOTPEmail", controller.sendOTPEmail);
router.post("/sendInquiry", controller.sendInquiry);

module.exports = router;