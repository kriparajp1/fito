const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("db connected successfully"))
  .catch(() => console.log("db not connected"));

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userbasecollection",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productdb",
        required: true,
      },
    },
  ],
});

const wishlist = mongoose.model("wishlistdb", wishlistSchema);

module.exports = wishlist;
