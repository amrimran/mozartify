// testEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'duwenago69@gmail.com',
    pass: 'DuweNagoBoroi12369'
  }
});

const mailOptions = {
  from: 'duwenago@gmail.com',
  to: 'amirimran728l@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email from Nodemailer!'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
  console.log('Email sent: ' + info.response);
});
