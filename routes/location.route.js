const express = require('express');
const controller = require('../controllers/location.controller');

const router = express.Router();

router.get("/getAllRegions", controller.getAllRegions);
router.get("/getProvincesByRegion/:id", controller.getProvincesByRegion);
router.get("/getMunicipalityByProvince/:id", controller.getMunicipalityByProvince);
router.get("/getBarangayByMunicipality/:id", controller.getBarangayByMunicipality);

module.exports = router;