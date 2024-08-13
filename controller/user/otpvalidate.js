const nodemailer = require("nodemailer");
const userCollection = require("../../models/usermodel");
const fs = require("fs");
const path = require("path");

const templatePath = path.join(__dirname, "emailotp.html");
const htmlTemplate = fs.readFileSync(templatePath, "utf-8");
//  Nodemailer
let otp = Math.floor(1000 + Math.random() * 9000).toString();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_ID,
    pass: process.env.USER_PASSWORD,
  },
});

const signuppost = async (req, res) => {
  try {
    const { name, email, phone, password, checkbox } = req.body;

    const existingUser = await userCollection.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    sendOtpEmail(email);
    res.status(200).send("OTP sent");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

const sendOtpEmail = (email) => {
  otp = Math.floor(1000 + Math.random() * 9000).toString();
  const htmlContent = htmlTemplate.replace("123456", otp);
  const mailOptions = {
    from: process.env.USER_ID,
    to: email,
    subject: "Your OTP Code",
    // text: `Your OTP code is ${otp}`
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
const sotp = async (req, res) => {
  const { enteredOtp, name, email, phone, password, checkbox } = req.body;
  if (enteredOtp === otp) {
    try {
      const data = {
        name: name,
        email: email,
        phone: phone,
        password: password,
        checkbox: checkbox,
      };

      const existingUser = await userCollection.findOne({ email: email });
      if (existingUser) {
        return res.status(400).send("User already exists");
      }

      await userCollection.insertMany(data);
      res.status(200).send("User registered successfully");
    } catch (error) {
      console.log(error);
      res.status(500).send("Server error");
    }
  } else {
    res.status(400).send("Invalid OTP");
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;
  sendOtpEmail(email);
  res.status(200).send("OTP resent");
};

module.exports = {
  signuppost,
  sotp,
  resendOtp,
};
