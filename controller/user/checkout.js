const Razorpay = require("razorpay");
const crypto = require("crypto");
const OrderDatabase = require("../../models/orderModel");
const AddressDatabase = require("../../models/addressModel");
const userbasecollections = require("../../models/usermodel");
const Product = require("../../models/productModel");
const Cart = require("../../models/cartModel");
const Offer = require("../../models/offerModel");
const mongoose = require("mongoose");
const Wallet = require("../../models/wallet");

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

// Render checkout page
const renderCheckoutPage = async (req, res) => {
  try {
    const placeOrder = req.query.id;
    const product = await Product.findById(placeOrder);
    const user = await userbasecollections.findOne({ email: req.session.user });
    console.log(user);
    let current = req.session.user ? true : false;
    const addresses = await AddressDatabase.find({ user: user._id });
    const wallet = (await Wallet.findOne({ userId: user._id })) || 0;
    res.render("user/checkout", {
      addresses,
      status: current,
      product,
      wallet,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to load checkout page", details: error.message });
  }
};

// Place an order
const placeOrder = async (req, res) => {
  try {
    const user = await userbasecollections.findOne({ email: req.session.user });
    const userId = user._id;
    const {
      orderedItems,
      address,
      paymentMethod,
      totalAmount,
      discountAmount,
      finalAmount,
      deliveryCharge,
      couponDiscount,
      offerDiscount,
    } = req.body;

    const items = orderedItems.map((item) => ({
      productId: item.productId,
      product_name: item.product_name,
      product_images: item.product_images,
      price: item.price,
      quantity: item.quantity,
      status: "Pending",
      returned: false,
    }));

    const newOrder = new OrderDatabase({
      user_id: userId,
      orderedItems: items,
      shippingAddress: address,
      paymentMethod,
      totalAmount: items[0].price,
      discountAmount,
      finalAmount: items[0].price,
      deliveryCharge,
      couponDiscount,
      offerDiscount,
    });

    await newOrder.save();
    res.redirect("/thankyou");
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to place order", details: error.message });
  }
};
const addAddress = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await userbasecollections.findOne({ email: userId });

    const { name, address, district, state, pincode, mobile, landmark } =
      req.body;

    const newAddress = new AddressDatabase({
      user: user._id,
      name: name,
      mobile: mobile,
      pincode,
      address,
      district: district,
      state,
      landmark: landmark || "",
    });

    await newAddress.save();
    res.redirect("/cart-checkout");
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add address", details: error.message });
  }
};
const buyNow = async (req, res) => {
  try {
    const userId = await userbasecollections.findOne({
      email: req.session.user,
    });
    const { productId } = req.body;

    let cart = await Cart.findOne({ user: userId._id });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const product = await Product.findById(productId);
    const itemIndex = cart.items.findIndex((item) =>
      item.productId.equals(productId)
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ productId, product, quantity: 1 });
    }

    await cart.save();
    res.redirect(`/checkout?id=${productId}`);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to proceed to checkout", details: error.message });
  }
};
// cartcheckout

const renderCartCheckoutPage = async (req, res) => {
  try {
    const user = await userbasecollections.findOne({ email: req.session.user });
    const cartDetails = await Cart.findOne({ user: user._id })
      .populate("items")
      .populate("items.productId");
    const totalAmount = cartDetails.items.reduce(
      (total, item) => total + item.product.product_price * item.quantity,
      0
    );
    const wallet = (await Wallet.findOne({ userId: user._id })) || 0;
    console.log(totalAmount);
    const offers = await Offer.find({ isActive: true });

    // Calculate offer price for each product
    // const productsWithOffer = cartDetails.items.map(product => {
    //     let offerPrice = 0

    //     // Check for product-specific and category-specific offers
    //     offers.forEach(offer => {
    //         if (offer.referenceId.toString() === product.product._id.toString() || offer.referenceId.toString() === product.product.product_category.toString()) {
    //             offerPrice = (product.product.product_price - (product.product.product_price * offer.discountPercent / 100))*product.quantity;
    //         }
    //     });

    //     return {
    //         offerPrice: +offerPrice.toFixed(2) // Round to 2 decimal places
    //     };
    // });
    const productsWithOffer = cartDetails.items.map((product) => {
      let offerPrice = 0;

      // Check for product-specific and category-specific offers
      offers.forEach((offer) => {
        if (offer.referenceId.toString() === product.product._id.toString()) {
          offerPrice =
            ((product.product.product_price * offer.discountPercent) / 100) *
            product.quantity;
        }
      });

      return {
        offerPrice: +offerPrice.toFixed(2), // Round to 2 decimal places
      };
    });

    const productsWithCategoryOffer = cartDetails.items.map((product) => {
      let offerPrice = 0;

      // Check for product-specific and category-specific offers
      offers.forEach((offer) => {
        if (
          offer.referenceId.toString() ===
          product.product.product_category.toString()
        ) {
          offerPrice =
            ((product.product.product_price * offer.discountPercent) / 100) *
            product.quantity;
        }
      });
      return {
        offerPrice: +offerPrice.toFixed(2), // Round to 2 decimal places
      };
    });

    const ProductOfferTotal =
      productsWithOffer.map((a) => a.offerPrice).reduce((a, b) => a + b) || 0;
    const categoryOfferTotal =
      productsWithCategoryOffer
        .map((a) => a.offerPrice)
        .reduce((a, b) => a + b) || 0;
    const offerTotal = ProductOfferTotal + categoryOfferTotal;
    console.log("product with offer", productsWithOffer);
    console.log("offertotal", offerTotal);
    const grandTotal = totalAmount - offerTotal;
    console.log("grand total", grandTotal);

    const addresses = await AddressDatabase.find({ user: user._id });

    const cartItems = cartDetails.items.map((item) => ({
      productId: item.product._id,
      product: item.product,
      quantity: item.quantity,
    }));

    // const cartTotal = cartItems.reduce(
    //   (total, item) => total + item.product.product_price * item.quantity,
    //   0
    // );

    res.render("user/cartCheckOut", {
      wallet,
      status: true,
      cartItems,
      addresses,
      discount: offerTotal,
      cartTotal: totalAmount,
      afterDiscount: grandTotal,
      user: user.firstName,
      user, // Pass the user object to the template
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", status: "error" });
  }
};

// render razor pay
const renderRazorPay = async (req, res) => {
  try {
    const user = await userbasecollections.findOne({ email: req.session.user });
    const cartDetails = await Cart.findOne({ user: user._id })
      .populate("items")
      .populate("items.productId");

    const totalAmount = cartDetails.items.reduce(
      (total, item) => total + item.product.product_price * item.quantity,
      0
    );
    console.log(totalAmount);
    const offers = await Offer.find({ isActive: true });

    // Calculate offer price for each product
    const productsWithOffer = cartDetails.items.map((product) => {
      let offerPrice = 0;

      // Check for product-specific and category-specific offers
      offers.forEach((offer) => {
        if (offer.referenceId.toString() === product.product._id.toString()) {
          offerPrice =
            ((product.product.product_price * offer.discountPercent) / 100) *
            product.quantity;
        }
      });

      return {
        offerPrice: +offerPrice.toFixed(2), // Round to 2 decimal places
      };
    });
    const productsWithCategoryOffer = cartDetails.items.map((product) => {
      let offerPrice = 0;

      // Check for product-specific and category-specific offers
      offers.forEach((offer) => {
        if (
          offer.referenceId.toString() ===
          product.product.product_category.toString()
        ) {
          offerPrice =
            ((product.product.product_price * offer.discountPercent) / 100) *
            product.quantity;
        }
      });
      return {
        offerPrice: +offerPrice.toFixed(2), // Round to 2 decimal places
      };
    });
    const ProductOfferTotal =
      productsWithOffer.map((a) => a.offerPrice).reduce((a, b) => a + b) || 0;
    const categoryOfferTotal =
      productsWithCategoryOffer
        .map((a) => a.offerPrice)
        .reduce((a, b) => a + b) || 0;

    const offerTotal = ProductOfferTotal + categoryOfferTotal;

    console.log(productsWithOffer);
    console.log(offerTotal);
    const grandTotal = totalAmount - offerTotal;
    console.log(grandTotal);

    var instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    instance.orders.create(
      {
        amount: grandTotal * 100,
        currency: "INR",
        receipt: "receipt#1",
      },
      (err, data) => {
        if (err) {
          console.log(err);
          return res.json(404).json({ error: err });
        }

        console.log("hereee");

        return res
          .status(200)
          .json({
            success: "open razor pay",
            totalAmount: grandTotal,
            userName: user.name,
            userPhone: user.phone,
            userEmail: user.email,
            orderId: data.id,
          });
      }
    );
  } catch (err) {
    console.log("error on razor pay render", err);
  }
};

const placeCartOrder = async (req, res) => {
  try {
    const user = await userbasecollections.findOne({ email: req.session.user });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", status: "error" });
    }

    const { address, paymentMethod, couponCode } = req.body;

    // wallet
    const wallet = await Wallet.findOne({ userId: user._id });

    // Validate quantities within the allowed range
    const validOrderedItems = await Cart.findOne({ user: user._id }).populate(
      "items.productId"
    );
    const cartDetails = await Cart.findOne({ user: user._id })
      .populate("items")
      .populate("items.productId");
    const totalAmount = cartDetails.items.reduce(
      (total, item) => total + item.product.product_price * item.quantity,
      0
    );
    const offers = await Offer.find({ isActive: true });
    const productsWithOffer = cartDetails.items.map((product) => {
      let offerPrice = product.product.product_price;

      // Check for product-specific and category-specific offers
      offers.forEach((offer) => {
        if (
          offer.referenceId.toString() === product.product._id.toString() ||
          offer.referenceId.toString() ===
            product.product.product_category.toString()
        ) {
          offerPrice =
            (product.product.product_price -
              (product.product.product_price * offer.discountPercent) / 100) *
            product.quantity;
        }
      });

      return {
        offerPrice: +offerPrice.toFixed(2), // Round to 2 decimal places
      };
    });
    const offerTotal = productsWithOffer.reduce(
      (a, b) => a.offerPrice + b.offerPrice
    );

    const grandTotal =
      cartDetails.items.length == 1 ? offerTotal.offerPrice : offerTotal;

    const items = validOrderedItems.items.map((a) => {
      let orderedItems = {
        productId: a.productId._id,
        product_name: a.productId.product_name,
        product_images: a.productId.product_image,
        price: a.productId.product_price,
        quantity: a.quantity,
      };
      return orderedItems;
    });
    console.log(items);

    // Assuming a fixed discount for the example

    // Adjust product stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product.product_stock < item.quantity) {
        return res
          .status(400)
          .json({
            message: `Insufficient stock for product: ${product.product_name}`,
            status: "insufficient_stock",
          });
      }
      product.product_stock -= item.quantity;
      await product.save();
    }
    console.log("address", address);
    const newOrder = new OrderDatabase({
      user_id: user._id,
      orderedItems: items,
      shippingAddress: new mongoose.Types.ObjectId(address),
      paymentMethod,
      totalAmount: totalAmount,
      discountAmount:
        totalAmount -
        (cartDetails.items.length == 1 ? offerTotal.offerPrice : offerTotal),
      finalAmount: grandTotal,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Completed",
    });

    await newOrder.save();

    await Cart.findOneAndUpdate({ user: user._id }, { items: [] }); // Clear the cart

    if (paymentMethod === "COD") {
      return res.redirect("/thankyou");
    } else if (paymentMethod === "RazorPay") {
      // If RazorPay, let the RazorPay handler manage the redirect after successful payment
      return res
        .status(200)
        .json({
          success: true,
          orderId: newOrder._id,
          totalAmount: grandTotal,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
        });
    } else {
      wallet.amount -= grandTotal;
      await wallet.save();
      return res
        .status(200)
        .json({
          success: true,
          orderId: newOrder._id,
          totalAmount: grandTotal,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", status: "error" });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const user = await userbasecollections.findOne({ email: req.session.user });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", status: "error" });
    }

    const { orderedItems, address, paymentMethod, couponCode } = req.body;
    console.log("req.body", req.body);

    // Validate quantities within the allowed range
    const validOrderedItems = orderedItems.map((item) => ({
      ...item,
      quantity: Math.min(item.quantity, 15),
    }));

    const totalAmount = validOrderedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const discountAmount = 300;
    const finalAmount = totalAmount - discountAmount;

    // Adjust product stock
    for (const item of validOrderedItems) {
      const product = await Product.findById(item.productId);
      if (product.product_stock < item.quantity) {
        return res
          .status(400)
          .json({
            message: `Insufficient stock for product: ${product.product_name}`,
            status: "insufficient_stock",
          });
      }
      product.product_stock -= item.quantity;
      await product.save();
    }

    const newOrder = new OrderDatabase({
      user_id: user._id,
      orderedItems: validOrderedItems,
      shippingAddress: address,
      paymentMethod,
      totalAmount,
      discountAmount,
      finalAmount,
      status: paymentMethod === "COD" ? "Pending" : "Completed",
    });

    await newOrder.save();
    await Cart.findOneAndUpdate({ user: user._id }, { items: [] }); // Clear the cart

    if (paymentMethod === "COD") {
      return res.redirect("/thankyou");
    } else {
      return res.status(200).json({
        success: true,
        orderId: newOrder._id,
        totalAmount: finalAmount,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        status: "success",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", status: "error" });
  }
};

const failure = (req, res) => {
  try {
    const user = req.session.user;
    res.render("user/failed", { user });
  } catch (error) {
    res.send(error);
  }
};

// failed order

const failedPlaceCartOrder = async (req, res) => {
  try {
    const user = await userbasecollections.findOne({ email: req.session.user });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", status: "error" });
    }

    const { address, paymentMethod, couponCode } = req.body;

    // wallet
    const wallet = await Wallet.findOne({ userId: user._id });

    // Validate quantities within the allowed range
    const validOrderedItems = await Cart.findOne({ user: user._id }).populate(
      "items.productId"
    );
    const cartDetails = await Cart.findOne({ user: user._id })
      .populate("items")
      .populate("items.productId");
    const totalAmount = cartDetails.items.reduce(
      (total, item) => total + item.product.product_price * item.quantity,
      0
    );
    const offers = await Offer.find({ isActive: true });
    const productsWithOffer = cartDetails.items.map((product) => {
      let offerPrice = product.product.product_price;

      // Check for product-specific and category-specific offers
      offers.forEach((offer) => {
        if (
          offer.referenceId.toString() === product.product._id.toString() ||
          offer.referenceId.toString() ===
            product.product.product_category.toString()
        ) {
          offerPrice =
            (product.product.product_price -
              (product.product.product_price * offer.discountPercent) / 100) *
            product.quantity;
        }
      });

      return {
        offerPrice: +offerPrice.toFixed(2), // Round to 2 decimal places
      };
    });
    const offerTotal = productsWithOffer.reduce(
      (a, b) => a.offerPrice + b.offerPrice
    );

    const grandTotal =
      cartDetails.items.length == 1 ? offerTotal.offerPrice : offerTotal;

    const items = validOrderedItems.items.map((a) => {
      let orderedItems = {
        productId: a.productId._id,
        product_name: a.productId.product_name,
        product_images: a.productId.product_image,
        price: a.productId.product_price,
        quantity: a.quantity,
      };
      return orderedItems;
    });
    console.log(items);

    // Assuming a fixed discount for the example

    // Adjust product stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product.product_stock < item.quantity) {
        return res
          .status(400)
          .json({
            message: `Insufficient stock for product: ${product.product_name}`,
            status: "insufficient_stock",
          });
      }
      product.product_stock -= item.quantity;
      await product.save();
    }
    console.log("address", address);
    const newOrder = new OrderDatabase({
      user_id: user._id,
      orderedItems: items,
      shippingAddress: new mongoose.Types.ObjectId(address),
      paymentMethod,
      totalAmount: totalAmount,
      discountAmount:
        totalAmount -
        (cartDetails.items.length == 1 ? offerTotal.offerPrice : offerTotal),
      finalAmount: grandTotal,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "failure",
    });

    await newOrder.save();

    await Cart.findOneAndUpdate({ user: user._id }, { items: [] }); // Clear the cart

    if (paymentMethod === "COD") {
      return res.redirect("/thankyou");
    } else if (paymentMethod === "RazorPay") {
      // If RazorPay, let the RazorPay handler manage the redirect after successful payment
      return res
        .status(200)
        .json({
          success: true,
          orderId: newOrder._id,
          totalAmount: grandTotal,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
        });
    } else {
      wallet.amount -= grandTotal;
      await wallet.save();
      return res
        .status(200)
        .json({
          success: true,
          orderId: newOrder._id,
          totalAmount: grandTotal,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", status: "error" });
  }
};

module.exports = {
  renderCheckoutPage,
  placeOrder,
  addAddress,
  buyNow,
  renderCartCheckoutPage,
  placeCartOrder,
  verifyRazorpayPayment,
  renderRazorPay,
  failedPlaceCartOrder,
  failure,
};
