const Coupons = require("../../models/couponModel");

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupons.find({});
    res.render("admin/coupons", { menu: "coupons", coupons });
  } catch (error) {
    console.error("Error rendering coupons page:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getAddCoupons = async (req, res) => {
  try {
    res.render("admin/addCoupons", { menu: "coupons" });
  } catch (error) {
    console.error("Error rendering add coupons page:", error);
    res.status(500).send("Internal Server Error");
  }
};

const postAddCoupon = async (req, res) => {
  try {
    const { name, value, expiryDate } = req.body;
    const newCoupon = { name, value, expiryDate };
    
    await Coupons.create(newCoupon);
    res.redirect("/admin/coupons");
  } catch (error) {
    console.error("Error adding new coupon:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getEditCoupon = async (req, res) => {
  try {
    console.log("hello")
    const coupon = await Coupons.findById(req.params.id);
    res.render("admin/editCoupon", { menu: "coupons", coupon });
  } catch (error) {
    console.error("Error rendering edit coupon page:", error);
    res.status(500).send("Internal Server Error");
  }
};

const postEditCoupon = async (req, res) => {
  try {
    const { name, value, expiryDate } = req.body;
    await Coupons.findByIdAndUpdate(req.params.id, { name, value, expiryDate });
    res.redirect("/admin/coupons");
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).send("Internal Server Error");
  }
}; 

const deleteCoupon = async (req, res) => {
  try {
    await Coupons.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getCoupons,
  getAddCoupons,
  postAddCoupon,
  getEditCoupon,
  postEditCoupon,
  deleteCoupon,
};
