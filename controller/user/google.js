const passport = require("passport");
const auth = require("./googleAuth");

const googleAuth = (req, res) => {
  try {
    passport.authenticate("google", {
      scope: ["email", "profile"],
    })(req, res);
  } catch (err) {
    console.log(`Error on google authentication ${err}`);
  }
};

const googleAuthCallback = (req, res, next) => {
  try {
    passport.authenticate("google", (err, user, info) => {
      if (err) {
        console.log(`Error on google auth callback: ${err}`);
        return next(err);
      }
      if (!user.status) {
        console.log("error", "User access is blocked by admin");
        return res.redirect("/login");
      }
      if (!user) {
        return res.redirect("/login");
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.session.user = user.email;
        console.log(user);
        return res.redirect("/home");
      });
    })(req, res, next);
  } catch (err) {
    console.log(`Error on google callback ${err}`);
  }
};
module.exports = {
  googleAuth,
  googleAuthCallback,
};
