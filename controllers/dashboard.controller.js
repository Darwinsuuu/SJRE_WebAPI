const { Sequelize, QueryTypes, QueryError } = require('sequelize');
const models = require('../models');

async function getWidgetsCount(req, res) {

    try {

        const customer = await models.sequelize.query(`SELECT count(id) as count FROM customers`);
        const onlineSales = await models.sequelize.query(`SELECT count(id) as count FROM onlinetransactions WHERE status = 'Completed'`);
        const storeSales = await models.sequelize.query(`SELECT count(id) as count FROM sales`);
        const onlineOrder = await models.sequelize.query(`SELECT count(id) as count FROM onlinetransactions WHERE status = 'Pending'`);
        const checkInventory = await models.sequelize.query(`SELECT count(id) as count FROM products WHERE quantity <= stockReminder AND status = 1`);
        const storeSalesIncome = await models.sequelize.query(`SELECT SUM(totalPrice) as SUM FROM sales`);
        const onlineSalesIncome = await models.sequelize.query(`SELECT SUM(totalPrice) as SUM FROM onlineSales`);

        let widgetValues = {
            customer: customer[0][0].count,
            onlineSales: onlineSales[0][0].count,
            storeSales: storeSales[0][0].count,
            onlineOrder: onlineOrder[0][0].count,
            checkInventory: checkInventory[0][0].count,
            storeSalesIncome: storeSalesIncome[0][0].SUM,
            onlineSalesIncome: onlineSalesIncome[0][0].SUM,
        }

        res.status(201).json({
            success: true,
            result: widgetValues
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }

} 


module.exports = {
    getWidgetsCount: getWidgetsCount
}