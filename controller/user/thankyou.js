const nodemailer = require("nodemailer");
const userCollection = require("../../models/usermodel");
const order = require("../../models/orderModel");
const fs = require("fs");
const path = require("path");

const templatePath = path.join(__dirname, "confirmorder.html");
const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

function replacePlaceholders(template, replacements) {
  for (const [key, value] of Object.entries(replacements)) {
    template = template.replace(new RegExp(key, "g"), value);
  }
  return template;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_ID,
    pass: process.env.USER_PASSWORD,
  },
});

const thankyou = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await userCollection.findOne({ email: req.session.user });
    const orderData = await order
      .find({ user_id: userData._id })
      .populate("shippingAddress");
    const lastorder = orderData[orderData.length - 1];
    console.log(lastorder);

    sendSuccesfullMail(user, lastorder, userData);
    res.render("user/thankyou", { user });
  } catch (error) {
    res.send(error);
  }
};
const sendSuccesfullMail = (email, lastorder, userData) => {
  // otp = Math.floor(1000 + Math.random() * 9000).toString();
  // const htmlContent=htmlTemplate.replace("123456",otp)
  let replacements = {
    123456789: lastorder._id.toString().slice(-6),
    "Agatha Fletcher": lastorder.shippingAddress.name,
    "agatha_fletcher@email": userData.email,
    "(000)-123-456": lastorder.shippingAddress.phone,
    "23.05.2023": lastorder.orderDate.toISOString().slice(0, 10),
    "7181 Gentle Butterfly": lastorder.shippingAddress.address,
    Orchard: lastorder.shippingAddress.district,
    Dynamite: lastorder.shippingAddress.state,
    "68669-7444": lastorder.shippingAddress.pincode,
    "2200.00": lastorder.totalAmount,
    "00.00": lastorder.discountAmount,
    "2200.00": lastorder.finalAmount,
    "Payment type": lastorder.paymentMethod,
  };

  let htmlContent = replacePlaceholders(htmlTemplate, replacements);
  const mailOptions = {
    from: process.env.USER_ID,
    to: email,
    subject: "your order seccessfully ",
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
module.exports = {
  thankyou,
};
