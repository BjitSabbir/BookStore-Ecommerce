const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "f92212d6af6a53",
        pass: "022d9fad47f364"
    }
});


const sendEmail = (email, subject, message) => {


    const mailOptions = {
        from: "BookAddict@bookMail.com",
        to: email,
        subject: subject,
        html: message

    };


    transport.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })

}

module.exports = {
    sendEmail
}
