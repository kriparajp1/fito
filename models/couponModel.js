const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("db connected successfully"))
  .catch(() => console.log("db not connected"));

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    
  },
  value: {
    type: String,
    required: true,
  },
  blocked: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Coupons = mongoose.model("coupons", Schema);
module.exports = Coupons;
