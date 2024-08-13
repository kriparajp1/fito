const Razorpay = require("razorpay");
const OrderDatabase = require("../../models/orderModel");
const crypto = require("crypto");

const razorpayInstance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

const createOrder = async (req, res) => {
  const orderId = req.params.orderId;
  const order = await OrderDatabase.findById(orderId);
  const options = {
    amount: order.finalAmount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: `receipt_order_${orderId}`,
  };
  razorpayInstance.orders.create(options, (err, order) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json({
      key: process.env.KEY_ID,
      amount: order.finalAmount,
      orderId: order._id,
    });
  });
};
const updateorder = async (req, res) => {
  const { paymentId, orderId, signature } = req.body;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  if (expectedSignature === signature) {
    await OrderDatabase.findByIdAndUpdate(req.params.orderId, {
      paymentStatus: "Completed",
    });
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
};

module.exports = {
  createOrder,
  updateorder,
};
