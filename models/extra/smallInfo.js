const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_DB);

const smallInfo = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  block: {
    type: String,
    default: true,
    required: true,
  },
});

const info = mongoose.model("info", smallInfo);
module.exports = info;
