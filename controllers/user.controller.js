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
                    mobileNo: req.body.personalInfo.contactNo,
                    region: req.body.addressInfo.region,
                    province: req.body.addressInfo.province,
                    city: req.body.addressInfo.cityMun,
                    barangay: req.body.addressInfo.barangay,
                    subdivision: req.body.addressInfo.subdivision,
                    street: req.body.addressInfo.street,
                    houseNo: req.body.addressInfo.houseNo,
                    zipCode: req.body.addressInfo.zipCode,
                }

                let custAccount = {
                    custId: null,
                    email: req.body.accountInfo.emailAddress,
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



async function getPersonalInformation(req, res) {

    try {

        // const result = await models.customers.findOne({ where: { id: req.params.id } });
        const result = await models.sequelize.query(`SELECT 
                                                        C.id,
                                                        C.firstname,
                                                        C.middlename,
                                                        C.lastname,
                                                        C.gender,
                                                        C.region,
                                                        C.province,
                                                        C.city,
                                                        C.barangay,
                                                        C.subdivision,
                                                        C.street,
                                                        C.houseNo,
                                                        C.zipCode,
                                                        C.mobileNo, 
                                                        CONCAT(
                                                            C.houseNo, ", ", 
                                                            C.street, ", ",
                                                            C.subdivision, ", ", 
                                                            B.brgyDesc, ", ", 
                                                            CM.citymunDesc, ", ",  
                                                            P.provDesc, ", ", 
                                                            R.regDesc, ", ", 
                                                            C.zipCode
                                                        ) as fullAddress
                                                    FROM 
                                                        customers C
                                                        INNER JOIN refregion R ON C.region = R.regCode
                                                        INNER JOIN refprovince P ON C.province = P.provCode
                                                        INNER JOIN refcitymun CM ON C.city = CM.citymunCode
                                                        INNER JOIN refbrgy B ON C.barangay = B.brgyCode
                                                    WHERE 
                                                        C.id = ${req.params.id}`);

        res.status(200).json({
            success: true,
            message: "Get personal info is successfully loaded!",
            result: result[0][0],
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })

    }

}



async function getAccountInfo(req, res) {

    try {

        const result = await models.cust_account.findOne({ where: { custId: req.params.id } });

        res.status(200).json({
            success: true,
            message: "Get personal info is successfully loaded!",
            result: result,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })

    }

}


async function updatePersonalInformation(req, res) {

    try {

        const customerInfo = {
            firstname: req.body.firstname,
            middlename: req.body.middlename,
            lastname: req.body.lastname,
            gender: req.body.gender,
            mobileNo: req.body.contactNo
        }

        models.customers.update(customerInfo, { where: { id: req.body.id } });

        res.status(200).json({
            success: true,
            message: "Update Personal Info is successful!",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }

}

async function updateAddressInformation(req, res) {

    try {


        const customerInfo = {
            region: req.body.region,
            province: req.body.province,
            city: req.body.cityMun,
            barangay: req.body.barangay,
            subdivision: req.body.subdivision,
            street: req.body.street,
            houseNo: req.body.houseNo,
            zipCode: req.body.zipCode,
        }


        models.customers.update(customerInfo, { where: { id: req.body.id } });

        res.status(200).json({
            success: true,
            message: "Update Address Info is successful!",
        });



    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }

}


async function updateAccountPassword(req, res) {

    try {

        bycryptjs.genSalt(10, function (err, salt) {
            bycryptjs.hash(req.body.password, salt, function (err, hash) {

                models.cust_account.update({ password: hash }, { where: { id: req.body.id } })

                res.status(200).json({
                    success: true,
                    message: "Update Account Info is successful!",
                })

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


async function newsletter(req, res) {

    try {

        await models.newsletterReceiver.create({ email: req.body.email, status: 1 });
        res.status(201).json({
            success: true,
            message: 'Successfully added to newsletter receiver!'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }

}



async function getUserInfoByEmail(req, res) {
    try {

        const result = await models.cust_account.findOne({ where: { email: req.params.email } })

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }
}



module.exports = {
    createCustomer: createCustomer,
    getPersonalInformation: getPersonalInformation,
    getAccountInfo: getAccountInfo,
    updatePersonalInformation: updatePersonalInformation,
    updateAddressInformation: updateAddressInformation,
    updateAccountPassword: updateAccountPassword,
    newsletter: newsletter,
    getUserInfoByEmail: getUserInfoByEmail
}