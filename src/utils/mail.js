const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_TRANSPORTER_USER,
        pass: process.env.MAIL_TRANSPORTER_PASS,
    },
});

const sendMail = ({ to, subject, ...others }) => {
    let mailOptions = {
        from: 'meVivu Cinema Booking',
        to,
        subject,
        ...others,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
};

const replacePlaceholder = (templateFile, options) => {
    const templatePath = path.join(__dirname, '../templates', templateFile);
    let template = fs.readFileSync(templatePath, 'utf8');

    Object.entries(options).forEach(([key, value]) => {
        template = template.replace(`{{${key}}}`, value);
    });
    return template;
};

module.exports = { sendMail, replacePlaceholder };
