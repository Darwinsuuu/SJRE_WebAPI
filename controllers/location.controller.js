const { Sequelize, QueryTypes, QueryError } = require('sequelize');
const models = require('../models')

async function getAllRegions(req, res) {

    try {

        const result = await models.sequelize.query("SELECT * FROM refregion", { type: QueryTypes.SELECT });

        res.status(200).json({
            status: true,
            result: result
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        });
    }

}


async function getProvincesByRegion(req, res) {

    try {
        const regCode = req.params.id;

        const result = await models.sequelize.query("SELECT * FROM refprovince WHERE regCode = " + regCode)

        res.status(200).json({
            status: true,
            result: result[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        })
    }

}


async function getMunicipalityByProvince(req, res) {

    try {
        const provCode = req.params.id;

        const result = await models.sequelize.query("SELECT * FROM refcitymun WHERE provCode = " + provCode);

        res.status(200).json({
            status: true,
            result: result[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        })
    }

}


async function getBarangayByMunicipality(req, res) {

    try {
        const cityMunCode = req.params.id;
        const result = await models.sequelize.query("SELECT * FROM refbrgy WHERE cityMunCode = " + cityMunCode);

        res.status(200).json({
            status: true,
            result: result[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        })
    }

}


module.exports = {
    getAllRegions: getAllRegions,
    getProvincesByRegion: getProvincesByRegion,
    getMunicipalityByProvince: getMunicipalityByProvince,
    getBarangayByMunicipality: getBarangayByMunicipality
}