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
            // const newQuantity = parseInt(cartData.quantity) + parseInt(checkCartData.quantity);
            const newQuantity = parseInt(cartData.quantity);
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
            custId: req.body.custId,
            location: req.body.location,
            mobileNo: req.body.mobileNo,
            remarks: '',
            status: 'Pending',
            paymentFile: req.file.filename
        }

        console.log("==========================")
        console.log("REQUEST BODY")
        console.log(req.body)
        console.log("==========================")
        console.log("REQUEST FILE")
        console.log(req.file)
        console.log("==========================")

        let resultSummary = [];

        let transId = "";

        const activeCartIds = JSON.parse(req.body.CartData)
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

                // return models.sequelize.query(`INSERT INTO onlineTransactions (custId, location, remarks, status, paymentFile, createdAt) VALUES ('${req.body.custId}', '${req.body.location}', '${req.body.remarks}', 'Pending', '${req.file.filename}', NOW())`, { transaction });

                return models.onlineTransaction.create(OLTransData, { transaction });
            })
            .then((result) => {
                let productInfo = [];

                let cart = JSON.parse(req.body.CartData).filter(item => item.active === 1);
                transId = result.id;

                cart.forEach(element => {

                    let prod = products[0].filter(x => x.id == element.prodId);

                    models.product.update({ quantity: prod[0].quantity - element.quantity }, { where: { id: prod[0].id } }, { transaction });
                    models.cart.destroy({ where: { id: element.cartId } }, { transaction });

                    let tempCart = {
                        OLTransID: result.id,
                        prodId: element.prodId,
                        currentPrice: prod[0].price,
                        currentSale: prod[0].sale,
                        currentComputedPrice: prod[0].computedPrice,
                        quantity: element.quantity,
                        totalPrice: parseFloat(prod[0].computedPrice) * parseFloat(element.quantity)
                    }

                    resultSummary.push(tempCart);
                    productInfo.push(tempCart);
                });

                return models.onlineSales.bulkCreate(productInfo, { transaction });

            }).then((result3) => {
                return models.sequelize.query(`SELECT C.firstname, CA.email FROM customers C INNER JOIN cust_accounts CA ON C.id = CA.custId WHERE C.id = ${req.body.custId}`, { transaction });
            })
            .then((final) => {

                // return models.sequelize.query(`SELECT P.product, OS.quantity, OS.totalPrice FROM onlinesales OS INNER JOIN products P ON p.id = OS.prodId WHERE OS.OLTransID = ${transId}`, { transaction });
                const currentDate = new Date();

                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                const dateFormat = new Intl.DateTimeFormat('en-US', options);

                const formattedDate = dateFormat.format(currentDate);

                // Create an array to store promises
                const promises = [];

                resultSummary.forEach(element => {
                    const productNamePromise = models.sequelize.query(`SELECT product FROM products WHERE id=${element.prodId}`);
                    promises.push(productNamePromise);
                });

                let orderSummary = "";
                let grandtotal = 0;
                // Use Promise.all to await all promises and execute the code after the loop
                Promise.all(promises)
                    .then(productNames => {
                        productNames.forEach((productName, index) => {
                            grandtotal += resultSummary[index].totalPrice;
                            orderSummary += `<tr>
                                <td>${productName[0][0].product}</td>
                                <td>${resultSummary[index].quantity}</td>
                                <td>₱${resultSummary[index].totalPrice}</td>
                             </tr>`;
                        });

                        const message = `<div
                                            style="display: block; width: 100%; max-width: 600px; margin: auto; padding: 10px 10px; background: #fff; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #1b1b1b !important; text-align: justify; font-weight: 400;">
                                    
                                            <div style="text-align: center;">
                                                <img src="https://lh3.google.com/u/0/d/1G0LD-J9v_ncB9LRQrIPeqqKAZ4g189L2=w1920-h959-iv2" alt="SJ_logo.png" width="120">
                                            </div>
                                    
                                            <p>Dear ${final[0][0].firstname.toUpperCase()},</p>
                                    
                                            <p style="text-indent: 45px; line-height: 1.5;">We are delighted to inform you that your order has been successfully processed. Thank you for choosing SJ Renewable Energy for your purchase. Here are the essential details:</p>
                                    
                                            <br>
                                    
                                            <b>Order Details: </b>
                                            <p style="margin: 0 0 5px">Order Date: ${formattedDate}</p>
                                            <p style="margin: 5px 0 5px">Contact No: ${OLTransData.mobileNo}</p>
                                            <p style="margin: 0 0 5px">Shipping Address: ${OLTransData.location}</p>
                                    
                                            <br>
                                    
                                            <b>Order Summary: </b>
                                            <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 5px;">
                                                <thead>
                                                    <tr>
                                                        <td style="font-weight: 600;">Product</td>
                                                        <td style="font-weight: 600;">Quantity</td>
                                                        <td style="font-weight: 600;">Price</td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${orderSummary}
                                                </tbody>
                                                <tfoot>
                                                    <tr style="border-top: 1px solid gray; padding: 10px 0 0;">
                                                        <td colspan="2" style="font-weight: 600;">Grand Total</td>
                                                        <td>₱${grandtotal}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                    
                                    
                                            <br>
                                    
                                            <p style="line-height: 1.5">Your order is currently being processed, and we will notify you via email once it has been shipped. If you have any questions or need assistance with your order, please contact our customer support team at <b><a href="mailto:${process.env.GMAIL_INQUIRIES}">${process.env.GMAIL_INQUIRIES}</a></b>.</p>
                                    
                                            <br>
                                    
                                            <p style="margin: 0 0 5px;">Best Regards,</p>
                                            <p style="margin: 0 0 5px;"><b>SJ Renewable Energy</b></p>
                                    
                                            <br>
                                            <p style="color: red; margin: 0 0 10px; text-align: center; font-weight: 600;">THIS EMAIL IS AN AUTOMATED. PLEASE DO NOT REPLY TO THIS EMAIL</p>
                                    
                                        </div>`


                        // Email content
                        const mailOptions = {
                            from: process.env.GMAIL_EMAIL, // Sender's email address
                            to: final[0][0].email, // Recipient's email address
                            subject: 'Order Confirmation  Your Order is Successful',
                            html: message,
                        };


                        // Send the email
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                res.status(500).json({
                                    status: false,
                                    message: "Something went wrong!",
                                    error: error.message
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
                    .catch(error => {
                        console.error("An error occurred while fetching product names:", error);
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
                        error: error.errors[0].message,
                    });
                } else {
                    // Handle other types of errors here
                    console.log(error)
                    return res.status(500).json({
                        success: false,
                        message: "Something went wrong",
                        error: error.message,
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
        // const result = await models.onlineTransaction.findAll({
        //     where: { custId: req.params.id },
        //     order: [['updatedAt', 'DESC']],
        // });

        const result = await models.sequelize.query(`SELECT *
                                            FROM onlineTransactions
                                            WHERE custId = ${req.params.id}
                                            ORDER BY updatedAt DESC`);

        // Access the actual result using result[0]
        const transactions = result[0];

        if (transactions) {
            const promises = transactions.map(async (element) => {
                const transactionResult = await models.sequelize.query(`
            SELECT OS.currentPrice, OS.currentSale, OS.currentComputedPrice, OS.quantity, OS.totalPrice, P.imgFilename, P.product 
            FROM onlineSales OS 
            INNER JOIN products P ON OS.prodId = P.id 
            WHERE OS.OLTransID = :transId`, {
                    replacements: { transId: element.id },
                    type: models.sequelize.QueryTypes.SELECT,
                });

                return {
                    status: element.status,
                    createdAt: element.createdAt,
                    remarks: element.remarks,
                    sales: transactionResult,
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
            error: error.message,  // Send the error message for better visibility
            stack: error.stack,    // Include the stack trace for more details
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