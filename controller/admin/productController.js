const productDatabase = require("../../models/productModel");
const categoryDatabase = require("../../models/category");

//product page
const getProductManage = async (req, res) => {
  try {
    if (req.session.admin) {
      const page = parseInt(req.query.page) || 1;
      const perPage = 6;

      const startIndex = (page - 1) * perPage;

      const product = await productDatabase
        .find()
        .populate("product_category")
        .skip(startIndex)
        .limit(perPage);
      const category = await categoryDatabase.find();

      const totalProducts = await productDatabase.countDocuments();
      const totalPages = Math.ceil(totalProducts / perPage);

      const sortOption = req.query.sortOption || null;
      const products = req.query.products || null;
      const search = req.query.search || null;

      res.render("admin/productManagement", {
        product,
        category,
        page,
        totalPages,
        sortOption,
        products,
        search,
        menu: "products",
      });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred");
  }
};

//add product
const getAddProduct = async (req, res) => {
  try {
    if (req.session.admin) {
      const allCategories = await categoryDatabase.find();
      const categories = await allCategories.filter(
        (category) => category.blocked
      );
      const error = req.query.error || "";
      res.render("admin/addProduct", { categories, error, menu: "products" });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    return res.render("admin/addProduct", {
      categories,
      error,
      menu: "products",
    });
  }
};
const postAddProduct = async (req, res) => {
  try {
    let img;
    img = req.files.map((val) => {
      return val.filename;
    });

    const productName = req.body.productName.trim().toLowerCase(); // Convert product name to lowercase

    const catId = req.body.productCategory;
    const category = await categoryDatabase.findById(catId);

    const checkProductExists = await productDatabase.findOne({
      product_name: { $regex: new RegExp("^" + productName + "$", "i") }, // Case-insensitive regex match
    });

    if (checkProductExists) {
      console.log("Product already exists");
      res.redirect("/admin/addProduct?error=Product+already+exists");
    } else {
      productData = {
        product_name: req.body.productName,
        product_description: req.body.productDescription,
        product_category: category._id,
        product_price: req.body.productPrice,
        product_stock: req.body.productStock,
        product_image: img,
      };

      if (productData.product_stock <= 0) {
        console.log("Product stock must be greater than 0");
        return res.redirect(
          "/admin/addProduct?error=Product+stock+must+be+greater+than+0"
        );
      }

      await productDatabase.insertMany([productData]);
      console.log("Product added successfully");
      res.redirect("/admin/productManagement");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred");
  }
};
//edit product
const getEditProduct = async (req, res) => {
  try {
    if (req.session.admin) {
      const proId = req.params.proId;
      const categories = await categoryDatabase.find();
      const product = await productDatabase
        .findById(proId)
        .populate("product_category");

      const errors = req.query.errors || ""; // Retrieves error message from the query parameter

      if (product) {
        res.render("admin/editProduct", {
          product,
          categories,
          errors,
          menu: "product",
        });
      } else {
        res.status(404).send("Product not found");
      }
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred");
  }
};

const postEditProduct = async (req, res) => {
  try {
    let img;
    const category = await categoryDatabase.findById(req.body.productCategory);
    const productName = req.body.productName.trim().toLowerCase();

    // Check if the product name is already taken
    const existingProduct = await productDatabase.findOne({
      _id: { $ne: req.params.proId },
      product_name: { $regex: new RegExp("^" + productName + "$", "i") },
    });

    if (existingProduct) {
      return res.redirect(
        `/admin/editProduct/${req.params.proId}?errors=Product+with+name+'${req.body.productName}'+already+exists`
      );
    }

    if (req.files && req.files.length > 0) {
      img = req.files.map((val) => val.filename);

      const existingProduct = await productDatabase.findById(req.params.proId);
      img = existingProduct.product_image.concat(img);
    } else {
      const existingProduct = await productDatabase.findById(req.params.proId);
      img = existingProduct.product_image;
    }

    await productDatabase.findByIdAndUpdate(
      req.params.proId,
      {
        product_name: req.body.productName,
        product_category: category._id,
        product_price: req.body.productPrice,
        product_stock: req.body.productStock,
        product_image: img,
      },
      {
        new: true,
      }
    );
    res.redirect("/admin/productManagement");
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyValue) {
      // 11000: MongoDB error code for duplicate key
      const duplicateKeyName = Object.keys(error.keyPattern)[0];
      const duplicateKeyValue = error.keyValue[duplicateKeyName];
      res.redirect(
        `/admin/editProduct/${req.params.proId}?errors=Product+with+name+'${duplicateKeyValue}'+already+exists`
      );
    } else {
      console.log(error);
      res.redirect(
        `/admin/editProduct/${req.params.proId}?errors=An+error+occurred+during+editing+the+product`
      );
    }
  }
};

//listing and unlisting product
const getBlockProduct = async (req, res) => {
  try {
    const proId = req.query.productId;

    const product = await productDatabase.findOne({ _id: proId });

    if (product) {
      const block = product.unlist;

      if (block) {
        await productDatabase.findByIdAndUpdate(proId, {
          $set: { unlist: false },
        });
      } else {
        await productDatabase.findByIdAndUpdate(proId, {
          $set: { unlist: true },
        });
      }
    }

    res.redirect("/admin/productManagement");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred during listing product");
  }
};

//get method for deleting single image of product in edit product
const getDeleteSingleImage = async (req, res) => {
  try {
    const { index, id } = req.params;
    const product = await productDatabase.findById(id);

    if (product) {
      // Remove the image at the specified index
      product.product_image.splice(index, 1);
      await product.save();
    }

    res.redirect(`/admin/editProduct/${id}`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred during deleting single image product");
  }
};
const listProduct = async (req, res) => {
  try {
    const productId = req.body.id; // Extract the correct field from the request body
    console.log(productId);

    const product = await productDatabase.findById(productId);
    if (product) {
      product.unlist = !product.unlist; // Toggle the unlist property
      await product.save();
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getProductManage,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  getBlockProduct,
  getDeleteSingleImage,
  listProduct,
};
