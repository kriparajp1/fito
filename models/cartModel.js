const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("db connected successfully"))
  .catch(() => console.log("db not connected"));

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userbasecollections",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "productdb",
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          required: true,
          min: 1,
        },
        discount: {
          type: Number,
          default: 0,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
