const nodemailer = require('nodemailer');
const sendEmail = (email,subject,html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_ID,
            to: email,
            subject: subject,
            html: html
        };
        const info = transporter.sendMail(mailOptions);
        return info;
    } catch (e) {
        throw e;
    }
}
module.exports = sendEmail;