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

async function getOrderByStatus(req, res) {

    try {

        const result = await models.sequelize.query(`SELECT OT.id, C.firstname, C.lastname, CA.email, OT.location, C.mobileNo, OT.remarks, OT.status, OT.createdAt, OT.updatedAt from onlinetransactions OT INNER JOIN customers C ON OT.custId = C.id INNER JOIN cust_accounts CA ON CA.custId = C.id WHERE OT.status='${req.params.status}'`);

        res.status(200).json({
            success: true,
            result: result[0],
            resultCount: result[0].length
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        });
    }

}


async function getOrderById(req, res) {
    try {

        const result = await models.sequelize.query(`SELECT OT.id, C.firstname, C.lastname, CA.email, OT.location, C.mobileNo, OT.remarks, OT.status, OT.createdAt, OT.updatedAt from onlinetransactions OT INNER JOIN customers C ON OT.custId = C.id INNER JOIN cust_accounts CA ON CA.custId = C.id WHERE OT.id='${req.params.id}' ORDER BY OT.createdAt`);


        // const orders = await models.onlineSales.findAll({where: {OLTransID: req.params.id} })
        const orders = await models.sequelize.query(`SELECT P.product, OS.quantity, OS.totalPrice FROM onlineSales OS INNER JOIN products P ON OS.prodId = P.id WHERE OS.OLTransID=${req.params.id}`)

        res.status(200).json({
            id: result[0][0].id,
            fullname: `${result[0][0].firstname} ${result[0][0].lastname}`,
            mobileNo: result[0][0].mobileNo,
            address: result[0][0].location,
            email: result[0][0].email,
            orderList: orders[0]
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        });
    }
}


async function updateOrderTransaction(req, res) {

    try {

        console.log(req.body.email)

        let data = {
            status: req.body.status,
            remarks: req.body.remarks,
        }

        console.log("==================================")
        await models.onlineTransaction.update(data, { where: { id: req.body.id } });

        console.log("==================================")
        const custId = await models.onlineTransaction.findAll({where: {id: req.body.id}});

        console.log(`custId ${custId[0].custId}`)
        console.log("==================================")
        const productLists = await models.sequelize.query(`SELECT P.id, P.product FROM onlinesales OS INNER JOIN products P ON OS.prodId = P.id WHERE OLTransID=${req.body.id}`);

        let productReview = "";

        let link = "https://sjrenewableenergy.com/product/review";

        await productLists[0].forEach(element => {
            productReview += `<br><a href="${link}/${element.id}/${custId[0].custId}">Click here to add review to <b>${element.product}</b></a>`;
        });


        const subContent = data.status == 'Completed' ? 'You order is processed and will be shipped to you. <br>Thank you for shopping!' : `Unfortunately, your order was declined due to: "${data.remarks}".<br>Sorry for the inconvenience and thank you!`



        const message = `<div style="width: 100%; max-width: 420px; color: #000; padding: 50px 30px; border: 1px solid #3f51b5; border-radius: 4px; font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; margin: 50px auto; font-size: 18px">
                            <h1 style="margin: 0 0 5px; color: #3f51b5 !important">SJ Renewable Energy</h1>
                            <p style="margin: 0 0 15px;">Hi,</p>
                            <p style="margin: 0 0 15px;">${subContent}</p>
                            ${productLists.length > 0 ? productReview : ''}
                            <br>
                            <p style="margin: 0;"><b>Note:</b> Do not reply to this email address. Thank you!</p>
                        </div>`;

        // Email content
        const mailOptions = {
            from: process.env.GMAIL_EMAIL, // Sender's email address
            to: req.body.email, // Recipient's email address
            subject: `SJRE - Purchase ${data.status}`,
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
                
                res.status(201).json({
                    success: true
                });
            }

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
    getOrderByStatus: getOrderByStatus,
    getOrderById: getOrderById,
    updateOrderTransaction: updateOrderTransaction
}