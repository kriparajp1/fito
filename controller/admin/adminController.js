const collection = require("../../models/usermodel");
const Product = require("../../models/productModel");
const OrderDatabase = require("../../models/orderModel");

// get
const adminLogin = (req, res) => {
  try {
    if (req.session.admin) {
      res.redirect("/admin/adminDashBoard");
    } else {
      res.render("admin/adminLogin");
    }
  } catch (error) {
    console.log(error);
  }
};

const adminDashBoard = async (req, res) => {
  try {
    const totals = await OrderDatabase.aggregate([
      {
        $match: {
          status: { $in: ["Delivered", "Returned", "Cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: {
              $cond: [{ $eq: ["$status", "Delivered"] }, "$finalAmount", 0],
            },
          },
          totalCoupons: { $sum: { $ifNull: ["$couponDiscount", 0] } },
          totalOfferDiscount: { $sum: { $ifNull: ["$offerDiscount", 0] } },
          totalSalesCount: {
            $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] },
          },
          totalCanceledReturnedCount: {
            $sum: {
              $cond: [{ $in: ["$status", ["Returned", "Cancelled"]] }, 1, 0],
            },
          },
        },
      },
    ]);
    const orders = await OrderDatabase.find();
    const users = await collection.find();
    console.log("totals", totals);
    res.render("admin/adminDash", { menu: "dashboard", totals, users, orders });
  } catch (error) {
    console.log(error);
  }
};


const adminCustomer = async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    const users = await collection.find({
      name: { $regex: searchQuery, $options: "i" },
    });
    res.render("admin/adminCustomer", {
      users,
      searchQuery,
      menu: "customers",
    });
  } catch (error) {
    console.log(error);
  }
};

const adminLoginPost = (req, res) => {
  let email = process.env.ADMIN_USERNAME;
  let password = process.env.ADMIN_PASSWORD;
  if (email === req.body.email && password === req.body.password) {
    req.session.admin = true;
    res.redirect("/admin/adminDashBoard");
  } else {
    res.redirect("/admin");
  }
};


const blockUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await collection.findByIdAndUpdate(userId, { status: "blocked" });
    res.redirect("/admin/adminCustomer?status=blocked");
  } catch (error) {
    console.log(error);
  }
};

const unBlock = async (req, res) => {
  const userId = req.params.id;
  try {
    await collection.findByIdAndUpdate(userId, { status: "active" });
    res.redirect("/admin/adminCustomer?status=unblocked");
  } catch (error) {
    console.log(error);
  }
};

// add product
const addProduct = async (req, res) => {
  try {
    const { productName, quantity, price, category, description } = req.body;
    const image = req.file.filename; 

    const newProduct = new Product({
      productName,
      quantity,
      price,
      category,
      description,
      image,
    });

    await newProduct.save();
    res.redirect("/admin/adminDashBoard"); 
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

const adminLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Server Error");
    }
    res.redirect("/admin");
  });
};

module.exports = {
  adminDashBoard,
  adminLogin,
  adminLoginPost,
  adminCustomer,
  blockUser,
  unBlock,
  addProduct,
  adminLogout,
};
