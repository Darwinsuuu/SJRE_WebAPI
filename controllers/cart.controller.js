const { Sequelize, QueryTypes, QueryError } = require('sequelize');
const models = require('../models');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL, // Your Gmail email address
        pass: process.env.GMAIL_FA_PASSWORD,  // Your Gmail password or App Password if 2-factor authentication is enabled
    },
});


async function getAllMyCartList(req, res) {

    try {

        // const result = await models.cart.findAll({ where: { custId: req.params.id } } );

        const result = await models.sequelize.query(`SELECT C.id AS cartId, C.prodId, C.quantity as quantity, C.active, P.product as productName, P.quantity as stocks, P.price, P.sale, P.computedPrice, P.imgFilename, P.status FROM carts C INNER JOIN products P ON C.prodId = P.id WHERE C.custId = ${req.params.id}`, { type: QueryTypes.SELECT })

        res.status(200).json({
            success: true,
            message: 'Get All Cart List successfuly fetched!',
            result: result,
            resultCount: result.length
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }

}

async function createCart(req, res) {
    try {

        const cartData = {
            custId: req.body.custId,
            prodId: req.body.prodId,
            quantity: req.body.prodQuantity,
            active: req.body.active
        }


        const checkCartData = await models.cart.findOne({ where: { custId: cartData.custId, prodId: cartData.prodId } });

        if (checkCartData) {
            const newQuantity = parseInt(cartData.quantity) + parseInt(checkCartData.quantity);
            models.cart.update({ quantity: newQuantity }, { where: { id: checkCartData.id } });
        } else {
            await models.cart.create(cartData);
        }

        res.status(201).json({
            success: true,
            message: 'Cart was successfully added!',
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }
}


async function updateCart(req, res) {
    try {


        const cartInfo = {
            quantity: req.body.quantity,
            active: req.body.active
        }

        models.cart.update(cartInfo, { where: { id: req.body.cartId } });

        res.status(201).json({
            success: true,
            message: 'Cart was successfully updated!',
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }
}



async function deleteCart(req, res) {
    try {

        await models.cart.destroy({ where: { id: req.params.id } })

        res.status(201).json({
            success: true,
            message: 'Cart was successfully deleted!',
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }
}



async function checkout(req, res) {

    try {

        const OLTransData = {
            custId: req.body.OLTransData.custId,
            location: req.body.OLTransData.location,
            mobileNo: req.body.OLTransData.mobileNo,
            remarks: '',
            status: 'Pending'
        }

        console.log(OLTransData)

        const activeCartIds = req.body.CartData
            .filter(item => item.active === 1)
            .map(item => item.prodId);

        let products;
        let transaction;

        models.sequelize
            .transaction()
            .then((t) => {
                transaction = t;
                return models.sequelize.query(`SELECT * FROM products WHERE id IN (${activeCartIds})`, { types: QueryTypes.SELECT })
            })
            .then((data) => {
                products = data;
                return models.onlinetransaction.create(OLTransData, { transaction });
            })
            .then((result) => {
                let productInfo = [];

                let cart = req.body.CartData.filter(item => item.active === 1);


                cart.forEach(element => {

                    let prod = products[0].filter(x => x.id == element.prodId);

                    models.product.update({ quantity: prod[0].quantity - element.quantity }, { where: { id: prod[0].id } });
                    models.cart.destroy({ where: { id: element.cartId } });
                    // console.log(element.cartId)

                    let tempCart = {
                        OLTransID: result.id,
                        prodId: element.prodId,
                        currentPrice: prod[0].price,
                        currentSale: prod[0].sale,
                        currentComputedPrice: prod[0].computedPrice,
                        quantity: element.quantity,
                        totalPrice: parseFloat(prod[0].computedPrice) * parseFloat(element.quantity)
                    }

                    productInfo.push(tempCart);
                });

                return models.onlineSales.bulkCreate(productInfo);

            }).then((result3) => {
                return models.sequelize.query(`SELECT C.firstname, CA.email FROM customers C INNER JOIN cust_accounts CA ON C.id = CA.custId WHERE C.id = ${req.body.OLTransData.custId}`);
            })
            .then((final) => {


                const message = `<div style="width: 100%; max-width: 420px; color: #000; padding: 50px 30px; border: 1px solid #3f51b5; border-radius: 4px; font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; margin: 50px auto; font-size: 18px">
                            <h1 style="margin: 0 0 5px; color: #3f51b5 !important">SJ Renewable Energy</h1>
                            <p style="margin: 0 0 15px;">Hi, ${final[0][0].firstname.toUpperCase()}</p>
                            <p style="margin: 0 0 15px;">Thank you for purchasing in our online shop. You'll receive an email notification after we confirmed your order.</p>
                            <p style="margin: 0;"><b>Note:</b> Do not reply to this email address. Thank you!</p>
                        </div>`;

                // Email content
                const mailOptions = {
                    from: process.env.GMAIL_EMAIL, // Sender's email address
                    to: final[0][0].email, // Recipient's email address
                    subject: 'SJRE - Online Store Purchase',
                    html: message,
                };


                // Send the email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        res.status(500).json({
                            status: false,
                            message: "Something went wrong!",
                            error: error
                        })
                    } else {

                        transaction.commit();   /* commit all query made */

                        res.status(201).json({
                            success: true,
                            message: "Online transaction successfully created!",
                        });
                    }

                });


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
                        error: error,
                    });
                } else {
                    // Handle other types of errors here
                    console.log(error)
                    return res.status(500).json({
                        success: false,
                        message: "Something went wrong",
                        error: error,
                    });

                }
            });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }

}

async function getAllPurchasesById(req, res) {
    try {
        const result = await models.onlinetransaction.findAll({ where: { custId: req.params.id } }, { order: [['updatedAt', 'DESC']] });

        if (result) {
            const promises = result.map(async (element) => {
                const transaction = await models.sequelize.query(`
                    SELECT OS.currentPrice, OS.currentSale, OS.currentComputedPrice, OS.quantity, OS.totalPrice, P.imgFilename, P.product 
                    FROM onlinesales OS 
                    INNER JOIN products P ON OS.prodId = P.id 
                    WHERE OS.OLTransID = :transId`, {
                    replacements: { transId: element.id },
                    type: models.sequelize.QueryTypes.SELECT,
                });

                return {
                    status: element.status,
                    createdAt: element.createdAt,
                    remarks: element.remarks,
                    sales: transaction,
                };
            });

            const purchasesLists = await Promise.all(promises);

            res.status(200).json({
                success: true,
                message: "Successfully fetched!",
                result: purchasesLists,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message,
        });
    }
}




module.exports = {
    getAllMyCartList: getAllMyCartList,
    createCart: createCart,
    updateCart: updateCart,
    deleteCart: deleteCart,
    checkout: checkout,
    getAllPurchasesById: getAllPurchasesById
}