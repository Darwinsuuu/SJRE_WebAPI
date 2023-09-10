const { Sequelize, QueryTypes, QueryError } = require('sequelize');
const models = require('../models')
const bycryptjs = require('bcryptjs');

function createCashier(req, res) {

    try {

        bycryptjs.genSalt(10, function (err, salt) {
            bycryptjs.hash(req.body.password, salt, function (err, hash) {

                const cashierInfo = {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    username: req.body.username,
                    password: hash,
                    status: 1
                }

                models.cashier.create(cashierInfo)
                    .then((result) => {
                        res.status(201).json({
                            success: true,
                            message: "New cashier account created!",
                        });
                    })
                    .catch((error) => {

                        if (error.name === 'SequelizeUniqueConstraintError') {
                            // If a unique constraint is violated, return a user-friendly error message
                            return res.status(400).json({
                                success: false,
                                message: 'Validation Error',
                                error: error.errors[0].message,
                            });
                        } else {
                            // Handle other types of errors here
                            return res.status(500).json({
                                success: false,
                                message: "Something went wrong in creating a new cashier account.",
                                error: error.message,
                            });
                        }

                    })
            })
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        });
    }

}


function updateCashier(req, res) {

    try {

        let cashierInfo;

        if (req.body.password != "") {
            cashierInfo = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                password: req.body.password,
                status: req.body.status
            }
        } else {
            cashierInfo = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                status: req.body.status
            }
        }

        models.cashier.update(cashierInfo, { where: { id: req.body.id } })
            .then(result => {
                res.status(200).json({
                    success: true,
                    message: "Cashier details was successfully updated!",
                });
            })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        });
    }

}



async function getAllCashierList(req, res) {

    const response = await models.sequelize.query("SELECT c.id AS id, c.firstname, c.lastname, c.username, SUM(sales.totalPrice) AS sales, c.status FROM cashiers c LEFT JOIN sales ON c.id = sales.cashierId GROUP BY c.id, c.username, c.firstname, c.lastname, c.status ORDER BY c.status DESC", { type: QueryTypes.SELECT });

    res.status(200).json({
        success: true,
        count: response.length,
        result: response
    });

}

module.exports = {
    createCashier: createCashier,
    updateCashier: updateCashier,
    getAllCashierList: getAllCashierList
}