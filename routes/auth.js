const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post("/adminAuthentication", authController.userAuthAdmin);
router.post("/customerAuthentication", authController.customerAuthentication);

module.exports = router;