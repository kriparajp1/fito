// Middleware to check user session and status
const userDb = require("../models/usermodel");
async function checkSessionAndStatus(req, res, next) {
  try {
    const userDetails = await userDb.findOne({ email: req.session.user });
    if (req.session.user && userDetails.status == "active") {
      next();
    } else {
      res.redirect("/logout");
    }
  } catch (error) {
    console.log(`error while in middleware ${error}`);
    res.redirect("/logout");
  }
}

module.exports = checkSessionAndStatus;
