const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Your user model
const crypto = require('crypto');
const nodemailer = require('nodemailer');

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('User with this email does not exist.');

  // Generate reset token
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Send email
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password',
    },
  });

  const mailOptions = {
    to: user.email,
    from: 'your-email@gmail.com',
    subject: 'Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset-password/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error('There was an error: ', err);
      res.status(500).send('Error sending email.');
    } else {
      res.status(200).send('Recovery email sent.');
    }
  });
});

router.post('/reset-password/:token', async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).send('Password reset token is invalid or has expired.');

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  
  res.send('Password has been reset.');
});

module.exports = router;
