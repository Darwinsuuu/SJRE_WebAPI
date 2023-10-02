const { Sequelize, QueryTypes } = require('sequelize');
const models = require('../models')
const bycryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function userAuthAdmin(req, res) {
    const credentials = {
        username: req.body.username,
        password: req.body.password,
    }

    try {
        const results = await models.sequelize.query(`SELECT
                                                        CASE
                                                            WHEN status = 1 AND tablename = 'cashiers' THEN CONCAT(firstname, ' ', lastname)
                                                            WHEN status = 1 AND tablename = 'admin_accounts' THEN 'admin'
                                                            ELSE NULL
                                                        END AS fullname,
                                                        id, -- Add the 'id' field here
                                                        username,
                                                        password
                                                    FROM (
                                                        SELECT 'cashiers' AS tablename, id, username, password, firstname, lastname, status
                                                        FROM cashiers
                                                        WHERE status = 1
                                                        UNION ALL
                                                        SELECT 'admin_accounts' AS tablename, id, username, password, NULL, NULL, status
                                                        FROM admin_accounts
                                                        WHERE status = 1
                                                    ) AS combined`, { type: Sequelize.QueryTypes.SELECT });

        for (const user of results) {
            const { username, password, fullname } = user;

            const result = await bycryptjs.compare(credentials.password, password);

            if (result) {
                // Password is correct, you can proceed with JWT token generation
                const token = jwt.sign(
                    {
                        username: username,
                    },
                    process.env.JWT_SECRET_KEY
                );

                console.log("=============================")
                console.log(user)
                console.log("=============================")

                res.status(200).json({
                    success: true,
                    message: "Authentication successful!",
                    userId: user.id, // Make sure user_id is defined in your user object
                    userType: user.fullname != 'admin' ? 2 : 1,
                    fullname: user.fullname,
                    token: token
                });
                return; // Exit the function when authentication is successful
            }
        }

        // If the loop completes without finding a matching user, return 401
        res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        });
    }
}


async function customerAuthentication(req, res) {
    const credentials = {
        username: req.body.username,
        password: req.body.password,
    }

    try {
        const user = await models.cust_account.findOne({ where: { email: credentials.username } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials!",
            });
        }

        const userInfo = await models.cust_account.findOne({ where: { id: user.id } });

        const result = await bycryptjs.compare(credentials.password, user.password);

        if (result) {
            const userData = await models.customers.findOne({ where: { id: userInfo.custId } });

            jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    fullname: `${userData.firstname} ${userData.lastname}`,
                },
                process.env.JWT_SECRET_KEY,
                function (err, token) {
                    if (err) {
                        console.error("Error generating JWT:", err);
                        res.status(500).json({
                            success: false,
                            message: "Error generating JWT token",
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: "Authentication successful!",
                        userId: user.id,
                        userType: 3,
                        fullname: `${userData.firstname} ${userData.lastname}`,
                        token: token,
                    });
                }
            );
        } else {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        });
    }
}


module.exports = {
    userAuthAdmin: userAuthAdmin,
    customerAuthentication: customerAuthentication
}