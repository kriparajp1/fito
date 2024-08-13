const Wishlist = require("../../models/wishlist");
const User = require("../../models/usermodel");
const Cart = require("../../models/cartModel");

const wishlist = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.user });
    if (!user) {
      return res.render("user/wishlist", { status: false, wishlist: null });
    }

    const wishlist = await Wishlist.findOne({ userId: user._id }).populate(
      "products.product"
    );
    console.log("Wishlist:", wishlist);

    if (!wishlist || !Array.isArray(wishlist.products)) {
      return res.render("user/wishlist", {
        status: false,
        wishlist: { products: [] },
      });
    }

    res.render("user/wishlist", { status: true, wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.render("user/wishlist", {
      status: false,
      wishlist: { products: [] },
      wishlistCount: res.locals.wishlistCount,
      cartCount: res.locals.cartCount,
    });
  }
};

const wishlistAdd = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findOne({ email: req.session.user });

  try {
    let wishlist = await Wishlist.findOne({ userId: user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: user._id, products: [] });
    }
    const productExists = wishlist.products.some(
      (p) => p.product.toString() === productId
    );

    if (productExists) {
      return res.status(200).json({ message: "Product already in wishlist" });
    }

    wishlist.products.push({ product: productId });
    await wishlist.save();

    res.status(200).json({ message: "Wishlist added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding to wishlist" });
  }
};

const wishlistDelete = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findOne({ email: req.session.user });

  try {
    let wishlist = await Wishlist.findOne({ userId: user._id });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.product.toString() !== productId
    );
    await wishlist.save();

    res.status(200).json({ message: "Wishlist item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting wishlist item" });
  }
};

const moveAllToCart = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.user });

    const wishlist = await Wishlist.findOne({ userId: user._id }).populate(
      "products.product"
    );
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const cart = await Cart.findOne({ user: user._id });
    const products = wishlist.products.map((item) => ({
      productId: item.product._id,
      product: item.product,
      quantity: 1,
      discount: item.product.offers ? item.product.offers.discount || 0 : 0,
    }));

    if (!cart) {
      const newCart = new Cart({
        user: user._id,
        items: products,
      });
      await newCart.save();
    } else {
      products.forEach((product) => {
        const existingProduct = cart.items.find(
          (item) => item.productId.toString() === product.productId.toString()
        );
        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          cart.items.push(product);
        }
      });
      await cart.save();
    }

    // Clear the wishlist
    wishlist.products = [];
    await wishlist.save();

    res.json({ message: "All items moved to cart successfully" });
  } catch (error) {
    console.error("Error moving items to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  wishlist,
  wishlistAdd,
  wishlistDelete,
  moveAllToCart,
};
