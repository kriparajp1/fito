const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("db connected successfully"))
  .catch(() => console.log("db not connected"));

// schema
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
    unique: true,
  },
  profilePhoto: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active",
  },
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
  checkbox: {
    type: String,
    required: false,
  },
});

const collectionModel = mongoose.model("userbasecollections", schema);
module.exports = collectionModel;
