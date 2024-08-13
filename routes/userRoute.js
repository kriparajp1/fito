const express = require("express");
const route = express.Router();
const usercontroller = require("../controller/user/userController");
const otpcontroller = require("../controller/user/otpvalidate");
const isUser = require("../middleware/usersession");
const product_list = require("../controller/user/product_list");
const userPanel = require("../controller/user/userPanel");
const checkOut = require("../controller/user/checkout");
const cart = require("../controller/user/cart");
const orderController = require("../controller/user/orderStatus");
const wishlist = require("../controller/user/whishlist");
const wishCount = require("../middleware/wishlist");
const wallet = require("../controller/user/wallet");
const orderView = require("../controller/user/orderDetail");
const thankyou = require("../controller/user/thankyou");
const passport = require("../controller/user/google");
const uncompletedOrder = require("../controller/user/uncompletedOrder.js");

const userSchema = require("../models/usermodel");

// login/signup/home
route.get("/", usercontroller.landingpage);
route.get("/login", usercontroller.login);
route.get("/signup", usercontroller.signup);
route.get("/home", isUser, wishCount, usercontroller.home);
route.post("/signuppost", otpcontroller.signuppost);
route.post("/loginpost", usercontroller.loginpost);
route.post("/validate-otp", otpcontroller.sotp);
route.get("/logout", usercontroller.userLogout);
route.post("/resend-otp", otpcontroller.resendOtp);

route.get("/auth/google", passport.googleAuth);
route.get("/auth/google/callback", passport.googleAuthCallback);

route.post("/check-user", async (req, res) => {
  const { value } = req.body;

  const checkuser = await userSchema.findOne({ email: value });

  if (checkuser) {
    return res
      .status(200)
      .json({ success: "User exist proceed with login login" });
  } else {
    return res
      .status(404)
      .json({ error: "User not found please register first" });
  }
});

// product view

route.get("/productView/:id", wishCount, usercontroller.getProductView);

// productList

route.get("/productList", wishCount, product_list.productList);

// userPanel

route.get("/userPanel", isUser, wishCount, userPanel.userPanel);
route.post("/update-profile", isUser, wishCount, userPanel.updateUserProfile);
route.post("/add-address", isUser, wishCount, userPanel.addAddress);
route.post(
  "/update-address/:addressId",
  isUser,
  wishCount,
  userPanel.updateAddress
);

// checkOut
route.get("/checkOut", isUser, wishCount, checkOut.renderCheckoutPage);
route.post("/add-address", isUser, wishCount, checkOut.addAddress);
route.post("/place-order", isUser, wishCount, checkOut.placeOrder);
route.post("/buy-now", isUser, wishCount, checkOut.buyNow);
route.get("/cart-checkout", isUser, wishCount, checkOut.renderCartCheckoutPage);
route.post("/place-cart-order", isUser, wishCount, checkOut.placeCartOrder);
route.post(
  "/place-cart-order-failed",
  isUser,
  wishCount,
  checkOut.failedPlaceCartOrder
);
route.post("/render-razorPay", isUser, wishCount, checkOut.renderRazorPay);
route.post("/verify-razorpay-payment", checkOut.verifyRazorpayPayment);
route.get("/failed", isUser, checkOut.failure);
route.get("/thankyou", isUser, thankyou.thankyou);

// cart
route.post("/add-to-cart", isUser, wishCount, cart.addToCart);
route.get("/cart", isUser, wishCount, cart.getCart);
route.post("/remove", isUser, wishCount, cart.removeFromCart);
route.post("/update-quantity", isUser, wishCount, cart.updateCartQuantity);

// orderStatus
route.get("/order-Status", isUser, wishCount, orderController.orderItems);
route.post("/cancel-order", isUser, wishCount, orderController.cancelOrder);
route.post("/return-order", isUser, wishCount, orderController.returnOrder);
route.get("/generate-invoice/:orderId", orderController.generateInvoice);

// wishlist
route.get("/wishlist", isUser, wishCount, wishlist.wishlist);
route.post("/wishlist/add", isUser, wishCount, wishlist.wishlistAdd);
route.delete("/wishlist/delete", isUser, wishCount, wishlist.wishlistDelete);
route.post("/moveAllToCart", isUser, wishCount, wishlist.moveAllToCart);

// wallet
route.get("/wallet", isUser, wishCount, wallet.wallet);

// orderview
route.get("/order/:orderId", isUser, wishCount, orderView.orderview);
route.post("/cancel-item", isUser, wishCount, orderView.cancelOrder);
route.post("/return-item", isUser, wishCount, orderView.returnOrder);

// FailedOrder
route.get(
  "/uncompletedOrder",
  isUser,
  wishCount,
  uncompletedOrder.renderFailedOrder
);
route.post("/retry-razorpay", isUser, wishCount, uncompletedOrder.retryPayment);
route.post(
  "/retry-payment",
  isUser,
  wishCount,
  uncompletedOrder.retryPaymentPost
);
route.all("*",usercontroller.erroro)

module.exports = route;
