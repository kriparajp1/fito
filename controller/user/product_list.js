const productDatabase = require("../../models/productModel");
const categoryDb = require("../../models/category");
const offerModel = require("../../models/offerModel");
const mongoose = require("mongoose");

const productList = async (req, res) => {
  try {
    const current = req.session.user ? true : false;
    const search = req.query.search || "";
    const sort = req.query.sort || "default";
    const categoryId = req.query.category;

    // Fetch all categories for rendering the category filter options
    const categories = await categoryDb.find({ blocked: true });

    // Determine sort option
    let sortOption;
    switch (sort) {
      case "price-asc":
        sortOption = { product_price: 1 };
        break;
      case "price-desc":
        sortOption = { product_price: -1 };
        break;
      case "name-asc":
        sortOption = { product_name: 1 };
        break;
      case "name-desc":
        sortOption = { product_name: -1 };
        break;
      default:
        sortOption = { product_name: 1 };
        break;
    }

    let query = {
      product_name: { $regex: search, $options: "i" },
    };

    // Add category to query if provided
    if (categoryId) {
      const category = await categoryDb.findOne({ categoryName: categoryId });
      if (category) {
        query.product_category = category._id;
      }
    }

    // Fetch products based on query and sort options
    const products = await productDatabase
      .find(query)
      .sort(sortOption)
      .populate("product_category");
    const isListed = products.filter(
      (product) =>
        product.unlist == true && product.product_category.blocked == true
    );
    // Fetch active offers
    const offers = await offerModel.find({ isActive: true });

    // Calculate offer price for each product
    const productsWithOffer = isListed.map((product) => {
      let offerPrice = 0;
      let productOffer = 0;
      let categoryOffer = 0;

      // Check for product-specific and category-specific offers
      offers.forEach((offer) => {
        if (offer.referenceId.toString() === product._id.toString()) {
          productOffer += (product.product_price * offer.discountPercent) / 100;
          console.log("productOffer", productOffer);
          console.log(product.product_category.toString());
        }

        if (
          offer.referenceId.toString() ===
          product.product_category._id.toString()
        ) {
          categoryOffer +=
            (product.product_price * offer.discountPercent) / 100;
          console.log("categoryOffer", categoryOffer);
        }
      });
      offerPrice = product.product_price - (productOffer + categoryOffer);
      console.log(offerPrice);

      return {
        ...product.toObject(),
        offerPrice: offerPrice.toFixed(2), // Round to 2 decimal places
      };
    });
    console.log(productsWithOffer);

    // Send response based on request type (XHR or regular)
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      res.json({ products: productsWithOffer });
    } else {
      res.render("user/product_list", {
        categories,
        search,
        product: productsWithOffer,
        status: current,
        wishlistCount: res.locals.wishlistCount,
        cartCount: res.locals.cartCount,
      });
    }
  } catch (error) {
    console.error("Error occurred while fetching products:", error);
    res.status(500).send("Error occurred while fetching products");
  }
};

module.exports = {
  productList,
};
