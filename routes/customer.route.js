const express = require('express');
const controller = require('../controllers/user.controller');

const router = express.Router();

router.post("/createCustomer", controller.createCustomer);

module.exports = router;