const Wallet = require("../../models/wallet");
const User = require("../../models/usermodel");

const wallet = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.user });
    const wallet =
      (await Wallet.findOne({ userId: user._id }).populate(
        "transations.orderId"
      )) || 0;
    res.render("user/wallet", {
      wishlistCount: res.locals.wishlistCount,
      cartCount: res.locals.cartCount,
      status: true,
      wallet,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  wallet,
};
