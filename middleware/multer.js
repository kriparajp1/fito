const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/image"); // specify the location where image is uploaded
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // generate unique file name
  },
});

const upload = multer({ storage: storage });

module.exports = {
  upload,
};
