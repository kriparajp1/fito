const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("db connected successfully"))
  .catch(() => console.log("db not connected"));

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userbasecollections",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    landmark: String,
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields

const addressDatabase = mongoose.model("addressDatabase", addressSchema);

module.exports = addressDatabase;
