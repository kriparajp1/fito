const Wishlist = require("../models/wishlist");
const User = require("../models/usermodel");
const Cart = require("../models/cartModel");

// Middleware to fetch wishlist count
async function fetchWishlistCount(req, res, next) {
  if (req.session.user) {
    try {
      const user = await User.findOne({ email: req.session.user });
      const userWishlist = await Wishlist.findOne({ userId: user._id });
      const cart = await Cart.findOne({ user: user._id });
      res.locals.cartCount = cart ? cart.items.length : 0;
      res.locals.wishlistCount = userWishlist
        ? userWishlist.products.length
        : 0;
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
      res.locals.wishlistCount = 0;
      res.locals.cartCount = 0;
    }
  } else {
    res.locals.wishlistCount = 0;
    res.locals.cartCount = 0;
  }
  next();
}

module.exports = fetchWishlistCount;
