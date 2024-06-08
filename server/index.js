const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const UserModel = require("./models/User");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/mozartify", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "amirimran728@gmail.com",
    pass: "roazgjmptmdzwibi",
  },
});

const sendVerificationEmail = (email, username, token) => {
  const url = `http://localhost:3001/verify-email?token=${token}`;
  const emailTemplate = `
    <div style="border: 2px solid #483C32; border-radius: 10px; padding: 20px; font-family: Arial, sans-serif; width: 600px; margin: 0 auto;">
      <div style="text-align: center;">
        <h1 style="color: #483C32;">Mozartify</h1>
      </div>
      <div style="padding: 20px; text-align: left;">
        <p>Hi <strong>${username}</strong>,</p>
        <p>Thank you for registering with Mozartify! Please verify your email address to complete your registration.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${url}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; border-radius: 5px; background-color: #483C32; color: #FFFFFF; text-decoration: none;">Verify Email</a>
      </div>
    </div>
  `;

  transporter.sendMail({
    from: "amirimran728@gmail.com",
    to: email,
    subject: "Mozartify Email Verification",
    html: emailTemplate,
  }, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const sendAdminApprovalEmail = (adminEmail, username, email) => {
  const emailTemplate = `
    <div style="border: 2px solid #483C32; border-radius: 10px; padding: 20px; font-family: Arial, sans-serif; width: 600px; margin: 0 auto;">
      <div style="text-align: center;">
        <h1 style="color: #483C32;">Mozartify</h1>
      </div>
      <div style="padding: 20px; text-align: left;">
        <p>Admin,</p>
        <p>A new user has requested to become a Music Entry Clerk.</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>Please review and approve their request in the admin panel.</p>
      </div>
    </div>
  `;

  transporter.sendMail({
    from: "amirimran728@gmail.com",
    to: adminEmail,
    subject: "New Music Entry Clerk Approval Needed",
    html: emailTemplate,
  }, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Admin email sent:', info.response);
    }
  });
};

app.post("/signup", async (req, res) => {
  const { username, email, password, role = 'customer' } = req.body;

  try {
    const existingUser = await UserModel.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    const newUser = new UserModel({ username, email, password, role, approval: role === 'customer' });
    await newUser.save();

    if (role === 'customer') {
      const token = jwt.sign({ username, email, password, role }, "your_jwt_secret", {
        expiresIn: "1h",
      });
      sendVerificationEmail(email, username, token);
      res.json({ message: "Verification email sent" });
    } else if (role === 'music_entry_clerk') {
      sendAdminApprovalEmail("amsyar@cravings.co", username, email);
      res.json({ message: "Your request has been submitted for approval" });
    } else {
      res.status(400).json({ message: "Invalid role" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const { username, email, password, role } = jwt.verify(token, "your_jwt_secret");

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (user.approval === false) {
      return res.status(400).json({ message: "Your account is pending approval" });
    }

    res.json({ message: "Email verified and user registered" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

app.post('/login', (req,res)=> {
  const {email,password} = req.body;
  UserModel.findOne({email: email})
  .then(user => {
      if(user){
          if(user.password === password){
              res.json("Success")

          }else{
              res.json("the password is incorrect")
          }
      } else{
          res.json('No record existed')
      }
  })
})


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
