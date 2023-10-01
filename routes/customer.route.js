const express = require('express');
const controller = require('../controllers/user.controller');

const router = express.Router();

router.post("/createCustomer", controller.createCustomer);
router.get("/getPersonalInformation/:id", controller.getPersonalInformation);
router.get("/getAccountInfo/:id", controller.getAccountInfo);
router.post("/updatePersonalInformation", controller.updatePersonalInformation);
router.post("/updateAddressInformation", controller.updateAddressInformation);
router.post("/updateAccountPassword", controller.updateAccountPassword);

module.exports = router;