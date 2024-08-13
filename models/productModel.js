const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("db connected successfully"))
  .catch(() => console.log("db not connected"));

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: [true, "Product name is required"],
    unique: true,
    trim: true,
  },
  product_description: {
    type: String,
    required: true,
  },
  product_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  product_price: {
    type: Number,
    required: true,
  },
  product_stock: {
    type: Number,
    required: true,
  },
  product_image: {
    type: [String],
    required: true,
  },
  unlist: {
    type: Boolean,
    default: true,
  },
  offers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "offer",
    },
  ],
});

const Product = mongoose.model("productdb", productSchema);

module.exports = Product;
