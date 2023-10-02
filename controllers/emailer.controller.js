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

        const message = `<div style="width: 100%; max-width: 420px; background: #3f51b5; color: #fff; padding: 50px 30px; border-radius: 4px; font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; margin: 50px auto;">
                            <h1 style="margin: 0 0 5px; text-align: center;">SJ Renewable Energy</h1>
                            <p style="margin: 0; text-align: center;">This is your One Time Password (OTP) for creating an account.</p>

                            <p style="padding: 8px 30px; width: fit-content; background-color: #fff; color: #3f51b5; text-align: center; font-size: 32px; letter-spacing: 10px; border-radius: 4px; font-weight: 900; margin: 28px auto;">${req.body.OTP}</p>

                            <p style="margin: 5px 0; text-align: center;"><b>Note:</b> Do not reply to this email address. Thank you!</p>
                        </div>`

        // Email content
        const mailOptions = {
            from: process.env.GMAIL_EMAIL, // Sender's email address
            to: req.body.email, // Recipient's email address
            subject: 'SJRE - Account Creation',
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