const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_DB);

const wallet = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userbasecollection",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  transations: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderDatabase",
        required: false,
      },
    },
  ],
});

const walletdb = mongoose.model("wallet", wallet);

module.exports = walletdb;
