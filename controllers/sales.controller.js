const { Sequelize, QueryTypes, QueryError } = require('sequelize');
const models = require('../models');

module.exports = {
    createSales: createSales,
}