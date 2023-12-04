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

        const result = await models.sequelize.query(`SELECT OT.id, C.firstname, C.lastname, CA.email, OT.location, C.mobileNo, OT.remarks, OT.status, OT.paymentFile, OT.createdAt, OT.updatedAt from onlinetransactions OT INNER JOIN customers C ON OT.custId = C.id INNER JOIN cust_accounts CA ON CA.custId = C.id WHERE OT.id='${req.params.id}' ORDER BY OT.createdAt`);


        // const orders = await models.onlinesales.findAll({where: {OLTransID: req.params.id} })
        const orders = await models.sequelize.query(`SELECT P.product, OS.quantity, OS.totalPrice FROM onlineSales OS INNER JOIN products P ON OS.prodId = P.id WHERE OS.OLTransID=${req.params.id}`)

        console.log(
            {
                id: result[0][0].id,
                fullname: `${result[0][0].firstname} ${result[0][0].lastname}`,
                mobileNo: result[0][0].mobileNo,
                address: result[0][0].location,
                paymentFile: result[0][0].paymentFile,
                email: result[0][0].email,
                orderList: orders[0]
            }
        )

        res.status(200).json({
            id: result[0][0].id,
            fullname: `${result[0][0].firstname} ${result[0][0].lastname}`,
            mobileNo: result[0][0].mobileNo,
            address: result[0][0].location,
            paymentFile: result[0][0].paymentFile,
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
        await models.onlinetransactions.update(data, { where: { id: req.body.id } });

        console.log("==================================")
        const custId = await models.onlineTransaction.findAll({ where: { id: req.body.id } });

        console.log(`custId ${custId[0].custId}`)
        console.log("==================================")
        const productLists = await models.sequelize.query(`SELECT P.id, P.product FROM onlinesales OS INNER JOIN products P ON OS.prodId = P.id WHERE OLTransID=${req.body.id}`);

        let productReview = "";

        let link = "https://sjrenewableenergy.com/product/review";

        await productLists[0].forEach(element => {
            // productReview += `<br><a href="${link}/${element.id}/${custId[0].custId}">Click here to add review to <b>${element.product}</b></a>`;
            productReview += `<tr>
                                <td>${element.product}</td>
                                <td><a href="${link}/${element.id}/${custId[0].custId}">Review this product</a></td>
                              </tr>`
        });


        // const subContent = data.status == 'Completed' ? 'You order is processed and will be shipped to you. <br>Thank you for shopping!' : `Unfortunately, your order was declined due to: "${data.remarks}".<br>Sorry for the inconvenience and thank you!`



        // const message = `<div style="width: 100%; max-width: 420px; color: #000; padding: 50px 30px; border: 1px solid #3f51b5; border-radius: 4px; font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; margin: 50px auto; font-size: 18px">
        //                     <h1 style="margin: 0 0 5px; color: #3f51b5 !important">SJ Renewable Energy</h1>
        //                     <p style="margin: 0 0 15px;">Hi,</p>
        //                     <p style="margin: 0 0 15px;">${subContent}</p>
        //                     ${productLists.length > 0 ? productReview : ''}
        //                     <br>
        //                     <p style="margin: 0;"><b>Note:</b> Do not reply to this email address. Thank you!</p>
        //                 </div>`;


        const message = data.status == 'Completed' ? `<div
                            style="display: block; width: 100%; max-width: 600px; margin: auto; padding: 10px 10px; background: #fff; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #1b1b1b !important; text-align: justify; font-weight: 400;">

                            <div style="text-align: center;">
                                <img src="https://lh3.google.com/u/0/d/1G0LD-J9v_ncB9LRQrIPeqqKAZ4g189L2=w1920-h959-iv2" alt="SJ_logo.png" width="120">
                            </div>
                            
                            <br>

                            <p>Hello,</p>

                            <p style="text-indent: 45px; line-height: 1.5; margin: 0 0 5px;">We are happy to inform you that your order is now completed and will be shipped to you. Thank you for shopping at SJ Renewable Energy!</p>

                            <br>

                            <b>Order Summary: </b>
                            <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 5px;">
                                <thead>
                                    <tr>
                                        <td style="font-weight: 600;">Product</td>
                                        <td style="font-weight: 600;">Action</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${productReview}
                                </tbody>
                            </table>

                            <br>

                            <p style="line-height: 1.5">If you have any questions or need assistance with your order, please contact our customer support team at <b><a href="mailto:${process.env.GMAIL_INQUIRIES}">${process.env.GMAIL_INQUIRIES}</a></b>.</p>

                            <br>

                            <p style="margin: 0 0 5px;">Best Regards,</p>
                            <p style="margin: 0 0 5px;"><b>SJ Renewable Energy</b></p>

                            <br>
                            <p style="color: red; margin: 0 0 10px; text-align: center; font-weight: 600;">THIS EMAIL IS AN AUTOMATED. PLEASE DO NOT REPLY TO THIS EMAIL</p>

                        </div>`
            :
            `<div
                        style="display: block; width: 100%; max-width: 600px; margin: auto; padding: 10px 10px; background: #fff; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #1b1b1b !important; text-align: justify; font-weight: 400;">
                
                        <div style="text-align: center;">
                            <img src="https://lh3.google.com/u/0/d/1G0LD-J9v_ncB9LRQrIPeqqKAZ4g189L2=w1920-h959-iv2" alt="SJ_logo.png" width="120">
                        </div>
                        
                        <br>
                
                        <p>Hi,</p>
                
                        <p style="line-height: 1.5; margin: 0 0 5px;">We regret to inform you that your order was declined.</p>
                
                        <br>
                
                        <b>Reason: </b>
                        <p style="margin: 5px 0 0;">${data.remarks}</p>
                
                        <br>
                
                        <p style="line-height: 1.5">If you have any questions or need assistance with your order, please contact our customer support team at <b><a href="mailto:${process.env.GMAIL_INQUIRIES}">${process.env.GMAIL_INQUIRIES}</a></b>.</p>
                
                        <br>
                
                        <p style="margin: 0 0 5px;">Best Regards,</p>
                        <p style="margin: 0 0 5px;"><b>SJ Renewable Energy</b></p>
                
                        <br>
                        <p style="color: red; margin: 0 0 10px; text-align: center; font-weight: 600;">THIS EMAIL IS AN AUTOMATED. PLEASE DO NOT REPLY TO THIS EMAIL</p>
                
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