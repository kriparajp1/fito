const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("db connected successfully"))
  .catch(() => console.log("db not connected"));

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    ref: "userbasecollections",
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  orderedItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productdb",
        required: true,
      },
      product_name: {
        type: String,
        required: true,
      },
      product_images: {
        type: [String],
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        min: 1,
        max: 15,
        required: true,
      },
      status: {
        type: String,
        default: "Pending",
        enum: [
          "Pending",
          "Shipped",
          "Processing",
          "Delivered",
          "Cancelled",
          "Returned",
        ],
      },
      returned: {
        type: Boolean,
        default: false,
      },
    },
  ],
  status: {
    type: String,
    default: "Pending",
    enum: [
      "Pending",
      "Shipped",
      "Processing",
      "Delivered",
      "Cancelled",
      "Returned",
    ],
  },
  returned: {
    type: Boolean,
    default: false,
  },
  paymentStatus: {
    type: String,
    enum: [
      "Pending",
      "Processing",
      "Completed",
      "failure",
      "Cancelled",
      "Refunded",
    ],
    default: "Pending",
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "addressDatabase",
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["COD", "RazorPay", "Wallet"],
  },
  razorpayOrderId: {
    type: String,
    required: false,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
  deliveryCharge: {
    type: Number,
    default: 0,
  },
  couponDiscount: {
    type: Number,
    default: 0,
  },
  offerDiscount: {
    type: Number,
    default: 0,
  },
  isReviewed: {
    type: Boolean,
    default: false,
  },
});

const OrderDatabase = mongoose.model("OrderDatabase", orderSchema);
module.exports = OrderDatabase;
