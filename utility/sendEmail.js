const nodemailer = require('nodemailer');
const sendEmail = async (email,subject,html) => {
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
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (e) {
        throw e;
    }
}
module.exports = sendEmail;