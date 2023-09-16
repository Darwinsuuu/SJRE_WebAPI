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
        const results = await models.sequelize.query("SELECT CASE WHEN status = 1 AND tablename = 'cashiers' THEN CONCAT(firstname, ' ', lastname) WHEN status = 1 AND tablename = 'admin_accounts' THEN 'admin' ELSE NULL END AS fullname, username, password FROM ( SELECT 'cashiers' AS tablename, username, password, firstname, lastname, status FROM cashiers WHERE status = 1 UNION ALL SELECT 'admin_accounts' AS tablename, username, password, NULL, NULL, status FROM admin_accounts WHERE status = 1 ) AS combined", { type: Sequelize.QueryTypes.SELECT });

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

                res.status(200).json({
                    success: true,
                    message: "Authentication successful!",
                    userId: user.user_id, // Make sure user_id is defined in your user object
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

module.exports = {
    userAuthAdmin: userAuthAdmin,
}