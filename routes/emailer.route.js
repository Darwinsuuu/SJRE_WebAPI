const express = require('express');
const controller = require('../controllers/emailer.controller');

const router = express.Router();

router.post("/sendOTPEmail", controller.sendOTPEmail);

module.exports = router;