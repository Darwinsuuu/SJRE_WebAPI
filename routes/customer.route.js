const express = require('express');
const controller = require('../controllers/user.controller');

const router = express.Router();

router.post("/createCustomer", controller.createCustomer);
router.get("/getPersonalInformation/:id", controller.getPersonalInformation);
router.get("/getAccountInfo/:id", controller.getAccountInfo);

module.exports = router;