const usercollection = require("../../models/usermodel");
const productDatabase = require("../../models/productModel");
const categoryDatabase = require("../../models/category");
const Offer = require("../../models/offerModel");
const smallInfo = require("../../models/extra/smallInfo");

// get
const landingpage = async (req, res) => {
  try {
    if (!req.session.user) {
      const info = await smallInfo.find({ block: true });
      const products = await productDatabase
        .find({ unlist: true })
        .populate("product_category");
      const productCategoryList = products.filter(
        (a) => a.product_category.blocked == true
      );
      const categories = await categoryDatabase.find({ blocked: true });
      res.render("user/homepage", {
        status: false,
        products: productCategoryList,
        categories,
        info,
      });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error);
  }
};
const login = (req, res) => {
  try {
    if (req.session.user) {
      res.redirect("/home");
    } else {
      res.render("user/login", { error: null, status: false });
    }
  } catch (error) {
    console.log(error);
  }
};
const signup = (req, res) => {
  try {
    if (!req.session.user) {
      res.render("user/signup", { status: false });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error);
  }
};
const home = async (req, res) => {
  try {
    const info = await smallInfo.find({ block: true });
    const products = await productDatabase
      .find({ unlist: true })
      .populate("product_category");
    const productCategoryList = products.filter(
      (a) => a.product_category.blocked == true
    );
    const user = await usercollection.findOne({ email: req.session.user });
    const categories = await categoryDatabase.find({ blocked: true });
    if (user) {
      res.render("user/homepage", {
        user: req.session.user,
        status: true,
        products: productCategoryList,
        categories,
        wishlistCount: res.locals.wishlistCount,
        cartCount: res.locals.cartCount,
        info,
      });
    } else if (req.session.user) {
      req.session.user = false;
      res.render("user/login", { status: false, error: null });
    } else {
      res.render("user/login", { status: false, error: null });
    }
  } catch (error) {
    console.log(error);
  }
};

// post
const loginpost = async (req, res) => {
  try {
    const check = await usercollection.findOne({ email: req.body.email });
    if (check.status == "active") {
      if (check.password === req.body.password) {
        req.session.user = req.body.email;
        res.redirect("/home");
      } else {
        return res
          .status(400)
          .render("user/login", { error: "User not found", status: false });
      }
    } else {
      return res
        .status(403)
        .render("user/login", {
          error: "Your account has been blocked. Please contact support.",
          status: false,
        });
    }
  } catch (error) {
    return res
      .status(400)
      .render("user/login", { error: "User not found", status: false });
  }
};

// productview

const getProductView = async (req, res) => {
  try {
    const user = req.session.user ? true : false;
    const id = req.params.id;
    const product = await productDatabase
      .findOne({ _id: id })
      .populate("product_category")
      .populate("offers");

    const categoryOffers = await Offer.find({
      offerType: "category",
      referenceId: product.product_category._id,
      isActive: true,
    });
    const productOffers = await Offer.find({
      offerType: "productdb",
      referenceId: product._id,
      isActive: true,
    });

    const offers = [...categoryOffers, ...productOffers].map((offer) => {
      const discountedPrice =
        product.product_price -
        (product.product_price * offer.discountPercent) / 100;
      return {
        ...offer.toObject(),
        discountedPrice: discountedPrice.toFixed(2),
      };
    });
    console.log(offers);
    const totalOffer =
      offers.map((a) => a.discountPercent).reduce((a, b) => a + b) || 0;

    const products = await productDatabase.find({
      product_category: product.product_category,
    });

    res.render("user/productView", {
      status: user,
      product,
      products,
      offers,
      wishlistCount: res.locals.wishlistCount,
      cartCount: res.locals.cartCount,
      totalOffer,
    });
  } catch (error) {
    console.log(error);
  }
};

const userLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Server Error");
    }
    res.redirect("/login");
  });
};
module.exports = {
  landingpage,
  login,
  signup,
  loginpost,
  home,
  getProductView,
  userLogout,
};
