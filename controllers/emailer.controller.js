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

function sendOTPEmail(req, res) {

    try {

        // const imageAttachment = {
        //     filename: 'SJ_logo.png',
        //     path: '../uploads/images/SJ_logo.png', // Provide the correct relative path to your image
        //     cid: 'SJ_logo' // Use a unique identifier for the image
        // };

        const message = `<div
                            style="display: block; width: 100%; max-width: 500px; margin: auto; padding: 10px 10px; background: #fff; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #1b1b1b !important; text-align: justify; font-weight: 400;">

                            <div style="text-align: center;">
                                <img src="https://lh3.google.com/u/0/d/1G0LD-J9v_ncB9LRQrIPeqqKAZ4g189L2=w1920-h959-iv2" alt="SJ_logo.png" width="120">
                            </div>

                            <p>Good day customer,</p>

                            <p style="line-height: 1.5;">It seems that you are trying to verify your Email at SJ Renewable Energy. Below is your verification code, please copy it and verify your Email.</p>

                            <br>

                            <p style="letter-spacing: 15px; padding: 10px 10px 10px 25px; border: none; border-radius: 4px; background: #015ABA; width: fit-content; text-align: center; margin: auto; font-size: 18px; color: #fff; font-weight: 700;">
                                ${req.body.OTP}
                            </p>

                            <br>

                            <p style="line-height: 1.5">Kindly disregard this email if you are not trying to access the SJ Renewable Store.</p>
                            <p style="line-height: 1.5">If you have any questions or need assistance with your order, please contact our customer support team at <b><a href="mailto:${process.env.GMAIL_INQUIRIES}">${process.env.GMAIL_INQUIRIES}</a></b>.</p>

                            <br>
                            <p style="color: red; margin: 0 0 10px; text-align: center; font-weight: 600;">THIS EMAIL IS AN AUTOMATED. PLEASE DO NOT REPLY TO THIS EMAIL</p>

                        </div>`

        // Email content
        const mailOptions = {
            from: process.env.GMAIL_EMAIL, // Sender's email address
            to: req.body.email, // Recipient's email address
            subject: 'SJRE - Verification Code',
            html: message,
            // attachments: [imageAttachment] // Attach the image
        };


        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).json({
                    status: false,
                    message: "Something went wrong!",
                    error: error.message
                })
            } else {
                console.log('Email sent:', info.response);

                res.status(201).json({
                    status: true,
                    message: "Email successfully sent!",
                    info: info.response
                })
            }

        });


    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong!",
            error: error.message
        })
    }

}




function sendInquiry(req, res) {

    try {

        let message = req.body.message + `<br><br>Sender's Fullname: ${req.body.fullname}<br>Sender's Email: ${req.body.email}`;

        // Email content
        const mailOptions = {
            from: process.env.GMAIL_EMAIL, // Sender's email address
            to: process.env.GMAIL_INQUIRIES, // Recipient's email address
            subject: req.body.subject,
            html: message,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).json({
                    status: false,
                    message: "Something went wrong!",
                    error: error.message
                })
            } else {
                console.log('Email sent:', info.response);

                res.status(201).json({
                    status: true,
                    message: "Email successfully sent!",
                    info: info.response
                })
            }

        });


    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong!",
            error: error.message
        })
    }

}

module.exports = {
    sendOTPEmail: sendOTPEmail,
    sendInquiry: sendInquiry
}