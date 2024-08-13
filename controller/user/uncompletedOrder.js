const Order = require("../../models/orderModel");
const userbasecollections = require("../../models/usermodel");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.USER_SECRET,
});
const renderFailedOrder = async (req, res) => {
  const order = await Order.find({ paymentStatus: "failure" });

  try {
    res.render("user/uncompletedOrder", { status: true, order });
  } catch (error) {}
};
const retryPayment = async (req, res) => {
  const { orderId } = req.body;
  console.log(req.body);
  try {
    const user = await userbasecollections.findOne({ email: req.session.user });
    const order = await Order.findById(orderId);
    const payment_capture = 1;
    const amount = order.finalAmount * 100;
    const currency = "INR";

    const options = {
      amount,
      currency,
      receipt: orderId.toString(),
      payment_capture,
    };

    const response = await razorpay.orders.create(options);
    res.json({
      success: true,
      orderId: response.id,
      totalAmount: order.finalAmount,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const retryPaymentPost = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const user = await userbasecollections.findOne({ email: req.session.user });
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    order.paymentStatus = "Completed";
    order.razorpayOrderId = paymentId;
    await order.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  renderFailedOrder,
  retryPayment,
  retryPaymentPost,
};
