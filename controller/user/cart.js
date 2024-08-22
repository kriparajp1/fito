const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const userBase = require("../../models/usermodel");
const Offer = require("../../models/offerModel");

const addToCart = async (req, res) => {
  try {
    const user = await userBase.findOne({ email: req.session.user });
    const productId = req.body.productId;

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", status: "error" });
    }

    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = new Cart({ user: user._id, items: [] });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", status: "error" });
    }

    const itemIndex = cart.items.findIndex((item) =>
      item.productId.equals(productId)
    );
    if (itemIndex > -1) {
      return res.json({
        message: "Product already exists in cart",
        status: "exists",
      });
    } else {
      cart.items.push({ productId, product, quantity: 1 });
      await cart.save();
      return res.json({
        message: "Product added to cart successfully",
        status: "added",
      });
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return res
      .status(500)
      .json({ error: "Failed to add product to cart", details: error.message });
  }
};

const calculateDiscount = async (cartItems) => {
  let totalDiscount = 0;

  for (let item of cartItems) {
    // Check for product-specific offers
    const productOffer = await Offer.findOne({
      referenceId: item.product._id,
      offerType: "productdb",
      isActive: true,
    });

    // Check for category-specific offers
    const categoryOffer = await Offer.findOne({
      referenceId: item.product.product_category,
      offerType: "category",
      isActive: true,
    });

    let bestDiscount = 0;

    if (productOffer) {
      const discount =
        (item.product.product_price * productOffer.discountPercent) / 100;
      // bestDiscount = Math.max(bestDiscount, discount);
      bestDiscount += discount;
    }

    if (categoryOffer) {
      const discount =
        (item.product.product_price * categoryOffer.discountPercent) / 100;
      bestDiscount = Math.max(bestDiscount, discount);
      bestDiscount += discount;
    }
    console.log("best discount", bestDiscount);
    console.log("offer", productOffer, categoryOffer);
    totalDiscount += bestDiscount * item.quantity;
    item.product.discountPrice = item.product.product_price - bestDiscount;
  }

  return totalDiscount;
};

const getCart = async (req, res) => {
  try {
    const er=req.query.er
    if (req.session.user) {
      const user = await userBase.findOne({ email: req.session.user });
      const status = user ? true : false;
      if (!user) {
        return res
          .status(400)
          .json({ message: "User not found", status: "error" });
      }

      const cart = await Cart.findOne({ user: user._id }).populate(
        "items.product"
      );
      if (!cart) {
        return res.render("user/cart", {
          items: [],
          totalGrantPrice: 0,
          discount: 0,
          totalPrice: 0,
          discountRate: 0,
          status,
          er
        });
      }

      const discount = await calculateDiscount(cart.items);
      const totalGrantPrice = cart.items.reduce(
        (total, item) => total + item.product.product_price * item.quantity,
        0
      );
      const totalPrice = totalGrantPrice - discount;

      // Calculate the discount rate
      const discountRate = (discount / totalGrantPrice) * 100;

      res.render("user/cart", {
        items: cart.items,
        totalGrantPrice,
        discount,
        totalPrice,
        discountRate: discountRate.toFixed(2), // Round to 2 decimal places
        status: !!req.session.user,
        er
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve cart", details: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const user = await userBase.findOne({ email: req.session.user });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", status: "error" });
    }

    const { productId } = req.body;
    const cart = await Cart.findOne({ user: user._id });
    if (cart) {
      cart.items = cart.items.filter(
        (item) => !item.productId.equals(productId)
      );
      await cart.save();
      res.json({ message: "Product removed from cart", status: "removed" });
    } else {
      res.status(400).json({ message: "Cart not found", status: "error" });
    }
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res
      .status(500)
      .json({
        error: "Failed to remove product from cart",
        details: error.message,
      });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const user = await userBase.findOne({ email: req.session.user });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", status: "error" });
    }

    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: user._id });
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", status: "error" });
    }

    if (quantity > product.product_stock) {
      return res
        .status(400)
        .json({ message: "Stock limit reached hiii", status: "error" });
    }

    if (cart) {
      const item = cart.items.find((item) => item.productId.equals(productId));
      if (item) {
        item.quantity = quantity;
        await cart.save();
        res.json({ message: "Cart updated", status: "updated" });
      } else {
        res
          .status(404)
          .json({ message: "Product not found in cart", status: "error" });
      }
    } else {
      res.status(400).json({ message: "Cart not found", status: "error" });
    }
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res
      .status(500)
      .json({
        error: "Failed to update cart quantity",
        details: error.message,
      });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
};
