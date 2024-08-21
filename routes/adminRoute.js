const express = require("express");
const adminRoute = express.Router();
const adminController = require("../controller/admin/adminController");
const admin_session = require("../middleware/adminsession");
const multer = require("../middleware/multer");
const categoryController = require("../controller/admin/categoryController");
const productController = require("../controller/admin/productController");
const isAdmin = require("../middleware/adminsession");
const OrderManagement = require("../controller/admin/orderManagement ");
const saleReport = require("../controller/admin/salesReport");
const coupons = require("../controller/admin/coupons");
const offer = require("../controller/admin/offercontroller");
const smallInfo = require("../controller/admin/info");
const chart = require("../controller/admin/chart");

// login
adminRoute.get("/", adminController.adminLogin);

adminRoute.post("/adminLoginPost", adminController.adminLoginPost);

adminRoute.get("/adminDashBoard", isAdmin, adminController.adminDashBoard);
adminRoute.get("/adminCustomer", isAdmin, adminController.adminCustomer);

// block unblock user
adminRoute.get("/blockUser/:id", isAdmin, adminController.blockUser);
adminRoute.get("/unBlockUser/:id", isAdmin, adminController.unBlock);

// logout
adminRoute.get("/logout", isAdmin, adminController.adminLogout);

// category
adminRoute.get("/category", isAdmin, categoryController.getCategory);
adminRoute.get("/addCategory", isAdmin, categoryController.addCategory);
adminRoute.post("/addCategory", isAdmin, categoryController.postAddCategory);
adminRoute.get("/editCategory/:id", isAdmin, categoryController.editCategory);
adminRoute.post(
  "/editCategory/:id",
  isAdmin,
  categoryController.editCategoryPost
);
adminRoute.get("/blockCategory", isAdmin, categoryController.getBlockCategory);
adminRoute.get(
  "/checkCategoryExists",
  isAdmin,
  categoryController.checkCategoryExists
);

// product view
adminRoute.get(
  "/productManagement",
  isAdmin,
  productController.getProductManage
);
adminRoute.get("/addProduct", isAdmin, productController.getAddProduct);
adminRoute.post(
  "/addProduct",
  multer.upload.array("productImage", 3),
  productController.postAddProduct
);
adminRoute.get(
  "/editProduct/:proId",
  isAdmin,
  productController.getEditProduct
);
adminRoute.post(
  "/editProduct/:proId",
  multer.upload.array("productImage", 3),
  productController.postEditProduct
);
adminRoute.get("/blockProduct", isAdmin, productController.getBlockProduct);
adminRoute.get(
  "/deleteSingleImage/:id/:index",
  isAdmin,
  productController.getDeleteSingleImage
);
adminRoute.post("/listProduct", isAdmin, productController.listProduct);

// order management

adminRoute.get("/orders", isAdmin, OrderManagement.getOrderManagement);
adminRoute.post(
  "/orders/:orderId/status",
  isAdmin,
  OrderManagement.postOrderManagement
);

// salesReport

adminRoute.get("/sales-report", isAdmin, saleReport.getSalesReports);
// adminRoute.get("/sales-reports/pdf",saleReport.saleReport)
adminRoute.get("/sales-reports", isAdmin, saleReport.generatePDFReport);

// coupons
adminRoute.get("/coupons", isAdmin, coupons.getCoupons);
adminRoute.get("/addCoupons", isAdmin, coupons.getAddCoupons);
adminRoute.post("/coupons/add", isAdmin, coupons.postAddCoupon);
adminRoute.get("/coupons/edit/:id", isAdmin, coupons.getEditCoupon);
adminRoute.post("/coupons/edit/:id", isAdmin, coupons.postEditCoupon);
adminRoute.post("/coupons/delete/:id", isAdmin, coupons.deleteCoupon);

// offer

adminRoute.get("/offer", isAdmin, offer.offerGet);
adminRoute.get("/addOffer", isAdmin, offer.addOffer);
adminRoute.post("/addOffer", isAdmin, offer.addOfferPost);
adminRoute.get("/editOffers/:id", isAdmin, offer.editOfferGet);
adminRoute.get("/getReferences", isAdmin, offer.getReference);
adminRoute.put("/editOffer/:offerId", isAdmin, offer.editOfferPut);
adminRoute.delete("/removeOffer/:offerId", isAdmin, offer.removeOffer);

// small info page

adminRoute.get("/infoPage", isAdmin, smallInfo.infoPageRender);
adminRoute.get("/addInfo", isAdmin, smallInfo.renderAddInfo);
adminRoute.post("/addInfo", isAdmin, smallInfo.addInfo);

// chart
adminRoute.get("/salesData", isAdmin, chart.getSalesData);

module.exports = adminRoute;
