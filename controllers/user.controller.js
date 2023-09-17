const { Sequelize, QueryTypes, QueryError } = require('sequelize');
const models = require('../models');
const bycryptjs = require('bcryptjs');

async function createCustomer(req, res) {

    try {

        bycryptjs.genSalt(10, function (err, salt) {
            bycryptjs.hash(req.body.accountInfo.password, salt, function (err, hash) {


                const customerInfo = {
                    firstname: req.body.personalInfo.firstname,
                    middlename: req.body.personalInfo.middlename,
                    lastname: req.body.personalInfo.lastname,
                    gender: req.body.personalInfo.gender,
                    mobileNo: req.body.personalInfo.mobileNo,
                    region: req.body.addressInfo.region,
                    province: req.body.addressInfo.province,
                    city: req.body.addressInfo.city,
                    barangay: req.body.addressInfo.barangay,
                    subdivision: req.body.addressInfo.subdivision,
                    street: req.body.addressInfo.street,
                    houseNo: req.body.addressInfo.houseNo,
                    zipCode: req.body.addressInfo.zipCode,
                    fullAddress: req.body.addressInfo.fullAddress
                }

                let custAccount = {
                    custId: null,
                    email: req.body.accountInfo.email,
                    password: hash,
                    status: 1
                }


                let transaction;

                models.sequelize
                    .transaction()
                    .then((t) => {
                        transaction = t;
                        return models.customers.create(customerInfo, { transaction });
                    })
                    .then((customersResult) => {
                        custAccount.custId = customersResult.id
                        return models.cust_account.create(custAccount, { transaction });
                    })
                    .then((result) => {
                        res.status(201).json({
                            success: true,
                            message: "Account successfully created!",
                        });

                        transaction.commit();   /* commit all query made */
                    })
                    .catch((error) => {
                        // checks if transaction was initialized
                        if (transaction) {
                            transaction.rollback(); /* rollback and return data that was submitted to database */
                        }

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
                    });


            })
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
    createCustomer: createCustomer
}