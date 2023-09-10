const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post("/adminAuthentication", authController.userAuthAdmin);

module.exports = router;