const orderBase = require("../../models/orderModel");
const userBase = require("../../models/usermodel");
const PDFDocument = require("pdfkit");
const Wallet = require("../../models/wallet");
const mongoose = require("mongoose");
const moment = require("moment");
// Ensure you have installed pdfkit

// const generateInvoice = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const order = await orderBase.findById(orderId).populate('orderedItems');

//         if (!order) {
//             return res.status(404).send('Order not found');
//         }

//         const doc = new PDFDocument();
//         const filename = `invoice_${order._id}.pdf`;
//         res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//         res.setHeader('Content-type', 'application/pdf');

//         doc.fontSize(20).text('Invoice', { align: 'center' });
//         doc.moveDown();

//         doc.fontSize(12).text(`Order ID: ${order._id.toString().slice(-6)}`);
//         doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`);
//         doc.text(`Total Amount: ₹ ${order.finalAmount}`);
//         doc.moveDown();

//         order.orderedItems.forEach(item => {
//             doc.text(`Product: ${item.product_name}`);
//             doc.text(`Quantity: ${item.quantity}`);
//             doc.text(`Price: ₹ ${item.price}`);
//             doc.moveDown();
//         });

//         doc.end();
//         doc.pipe(res);

//     } catch (error) {
//         console.error('Error generating invoice:', error);
//         res.status(500).send('Server error');
//     }
// };

// Fetch order items

// const generateInvoice = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const user= await userBase.findOne({email:req.session.user})
//         const order = await orderBase.findById(orderId).populate('orderedItems').populate('user_id').populate("shippingAddress");

//         if (!order) {
//             return res.status(404).send('Order not found');
//         }

//         const doc = new PDFDocument({ size: 'A4', margin: 50 });
//         const filename = `invoice_${order._id}.pdf`;

//         res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//         res.setHeader('Content-type', 'application/pdf');

//         // Invoice Header
//         doc.fontSize(20).text('Order Invoice', { align: 'center' });
//         doc.moveDown();

//         // Seller Information
//         doc.fontSize(10).text(`Sold By: FITO PVT LMT`, { align: 'left' });
//         doc.text(`Ship-from Address: FITO FACTORY ,`, { align: 'left' });
//         doc.text(`Trivandrum, Kerala, IN - 695001`, { align: 'left' });
//         doc.text(`CIN: U51109KA2012PTC066107`, { align: 'left' });
//         doc.text(`GSTIN: 29AACCF0683K1ZD`, { align: 'left' });
//         doc.moveDown();

//         // Order Details
//         doc.text(`Order ID: ${order._id.toString().slice(-6)}`, { align: 'left' });
//         doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`, { align: 'left' });
//         doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, { align: 'left' });
//         doc.text(`Payment Method: ${order.paymentMethod}`, { align: 'left' });
//         doc.text(`Payment Status: ${order.paymentStatus}`, { align: 'left' });
//         doc.moveDown();

//         // Billing Address
//         doc.text(`Billing Address:`, { align: 'left', underline: true });
//         doc.text(`Name: ${order.user_id.name}`, { align: 'left' });
//         doc.text(`Address: ${order.user_id.address}`, { align: 'left' });
//         doc.text(`District: ${order.user_id.district}`, { align: 'left' });
//         doc.text(`State: ${order.user_id.state}`, { align: 'left' });
//         doc.text(`Pincode: ${order.user_id.pincode}`, { align: 'left' });
//         doc.moveDown();

//         // Product Table
//         const tableTop = doc.y;
//         doc.text('Description', 50, tableTop, { bold: true });
//         doc.text('Qty', 200, tableTop, { bold: true });
//         doc.text('Price', 250, tableTop, { bold: true });
//         doc.text('Offer Price', 300, tableTop, { bold: true });
//         doc.text('Discount', 350, tableTop, { bold: true });
//         doc.text('Final Price', 400, tableTop, { bold: true });
//         doc.moveDown();

//         order.orderedItems.forEach(item => {
//             const position = doc.y;
//             doc.text(item.product_name, 50, position);
//             doc.text(item.quantity, 200, position);
//             doc.text(`Rs:${item.price}`, 250, position);
//             doc.text(`Rs:${item.offerPrice}`, 300, position);
//             doc.text(`Rs:${item.discount}`, 350, position);
//             doc.text(`Rs:${item.finalPrice}`, 400, position);
//             doc.moveDown();
//         });

//         // Totals
//         doc.text('Subtotal:', 350, doc.y + 20, { align: 'right' });
//         doc.text(`Rs:${order.subtotal}`, 400, doc.y + 20, { align: 'right' });
//         doc.text('Offer Discount:', 350, doc.y + 40, { align: 'right' });
//         doc.text(`Rs:${order.offerDiscount}`, 400, doc.y + 40, { align: 'right' });
//         doc.text('Delivery Charge:', 350, doc.y + 60, { align: 'right' });
//         doc.text(`Rs:${order.deliveryCharge}`, 400, doc.y + 60, { align: 'right' });
//         doc.text('Total Discount:', 350, doc.y + 80, { align: 'right' });
//         doc.text(`Rs:${order.totalDiscount}`, 400, doc.y + 80, { align: 'right' });
//         doc.text('Grand Total:', 350, doc.y + 100, { align: 'right', bold: true });
//         doc.text(`Rs:${order.finalAmount}`, 400, doc.y + 100, { align: 'right', bold: true });

//         doc.end();
//         doc.pipe(res);

//     } catch (error) {
//         console.error('Error generating invoice:', error);
//         res.status(500).send('Server error');
//     }
// };

const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = await userBase.findOne({ email: req.session.user });
    const order = await orderBase
      .findById(orderId)
      .populate("orderedItems.productId")
      .populate("user_id")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const filename = `invoice_${order._id}.pdf`;

    res.setHeader("Content-disposition", "attachment; filename=" + filename);
    res.setHeader("Content-type", "application/pdf");

    // Invoice Header
    doc.fontSize(20).text("Order Invoice", { align: "center" });
    doc.moveDown();

    // Seller Information
    doc.fontSize(10).text("Sold By: FITO PVT LMT", { align: "left" });
    doc.text("Ship-from Address: FITO FACTORY,", { align: "left" });
    doc.text("Trivandrum, Kerala, IN - 695001", { align: "left" });
    doc.text("CIN: U51109KA2012PTC066107", { align: "left" });
    doc.text("GSTIN: 29AACCF0683K1ZD", { align: "left" });
    doc.moveDown();

    // Order Details
    doc.text(`Order ID: ${order._id.toString().slice(-6)}`, { align: "left" });
    doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`, {
      align: "left",
    });
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, {
      align: "left",
    });
    doc.text(`Payment Method: ${order.paymentMethod}`, { align: "left" });
    doc.text(`Payment Status: ${order.paymentStatus}`, { align: "left" });
    doc.moveDown();

    // Billing Address
    doc.text("Billing Address:", { align: "left", underline: true });
    doc.text(`Name: ${order.user_id.name}`, { align: "left" });
    doc.text(`Address: ${order.shippingAddress.address}`, { align: "left" });
    doc.text(`District: ${order.shippingAddress.district}`, { align: "left" });
    doc.text(`State: ${order.shippingAddress.state}`, { align: "left" });
    doc.text(`Pincode: ${order.shippingAddress.pincode}`, { align: "left" });
    doc.moveDown();

    // Product Table Headers
    const tableTop = doc.y;
    const itemMargin = 20; // Adjust this value to fit the table within the page

    doc.fontSize(10).text("Description", 50, tableTop);
    doc.text("Qty", 200, tableTop);
    doc.text("Price", 250, tableTop);
    doc.text("Offer Price", 300, tableTop);
    doc.text("Discount", 350, tableTop);
    doc.text("Final Price", 400, tableTop);
    doc.moveDown();

    // Product Table Rows
    order.orderedItems.forEach((item) => {
      const position = doc.y;
      doc.fontSize(10).text(item.productId.product_name, 50, position);
      doc.text(item.quantity, 200, position);
      doc.text(`Rs:${item.productId.product_price}`, 250, position);
      doc.text(
        `Rs:${item.productId.product_price - item.discountAmount}`,
        300,
        position
      );
      doc.text(`Rs:${item.discountAmount}`, 350, position);
      doc.text(
        `Rs:${
          (item.productId.product_price - item.discountAmount) * item.quantity
        }`,
        400,
        position
      );
      doc.moveDown();
    });

    // Totals
    const totalY = doc.y + itemMargin;
    doc.fontSize(10).text("Subtotal:", 350, totalY, { align: "right" });
    doc.text(`Rs:${order.totalAmount}`, 400, totalY, { align: "right" });
    doc.text("Offer Discount:", 350, totalY + 20, { align: "right" });
    doc.text(`Rs:${order.offerDiscount}`, 400, totalY + 20, { align: "right" });
    doc.text("Delivery Charge:", 350, totalY + 40, { align: "right" });
    doc.text(`Rs:${order.deliveryCharge}`, 400, totalY + 40, {
      align: "right",
    });
    doc.text("Total Discount:", 350, totalY + 60, { align: "right" });
    doc.text(`Rs:${order.discountAmount}`, 400, totalY + 60, {
      align: "right",
    });
    doc
      .fontSize(12)
      .text("Grand Total:", 350, totalY + 80, { align: "right", bold: true });
    doc.text(`Rs:${order.finalAmount}`, 400, totalY + 80, {
      align: "right",
      bold: true,
    });

    // Finalize and pipe the PDF
    doc.end();
    doc.pipe(res);
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).send("Server error");
  }
};

const orderItems = async (req, res) => {
  try {
    const user = await userBase.findOne({ email: req.session.user });
    const page = parseInt(req.query.page) || 1;
    const perPage = 6;
    const startIndex = (page - 1) * perPage;

    const order = await orderBase
      .find({ user_id: user._id })
      .sort({ orderDate: -1 })
      .skip(startIndex)
      .limit(perPage)
      .populate("orderedItems");

    const totalOrders = await orderBase.countDocuments({ user_id: user._id });
    const totalPages = Math.ceil(totalOrders / perPage);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    res.render("user/orderStatus", {
      order,
      status: true,
      page,
      totalPages,
      perPage, // Pass perPage to the view
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const user = await userBase.findOne({ email: req.session.user });
    const { orderId, reason } = req.body;
    const order = await orderBase.findById(orderId);
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = new Wallet({ userId: user._id, amount: 0, transations: [] });
    }

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", status: "error" });
    }

    if (order.status === "Cancelled" || order.status === "Returned") {
      return res
        .status(400)
        .json({ message: "Order already processed", status: "error" });
    }

    order.status = "Cancelled";
    if (
      order.paymentMethod === "RazorPay" ||
      order.paymentMethod === "Wallet"
    ) {
      wallet.amount += order.finalAmount;
      const newTransaction = { orderId: order._id };
      wallet.transations.push(newTransaction);
      await wallet.save();
    }
    order.cancellationReason = reason;
    await order.save();

    res.json({ message: "Order cancelled successfully", status: "cancelled" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res
      .status(500)
      .json({
        message: "Failed to cancel order",
        status: "error",
        details: error.message,
      });
  }
};

// Return order
const returnOrder = async (req, res) => {
  try {
    const user = await userBase.findOne({ email: req.session.user });
    const { orderId } = req.body;
    const order = await orderBase.findById(orderId);
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = new Wallet({ userId: user._id, amount: 0, transations: [] });
    }

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", status: "error" });
    }

    if (order.status === "cancelled" || order.status === "Returned") {
      return res
        .status(400)
        .json({ message: "Order already processed", status: "error" });
    }
    if (
      order.paymentMethod === "RazorPay" ||
      order.paymentMethod === "Wallet"
    ) {
      wallet.amount += order.finalAmount;
      const newTransaction = { orderId: order._id };
      wallet.transations.push(newTransaction);
      await wallet.save();
    }
    order.status = "Returned";
    await order.save();

    res.json({ message: "Order returned successfully", status: "returned" });
  } catch (error) {
    console.error("Error returning order:", error);
    res
      .status(500)
      .json({
        message: "Failed to return order",
        status: "error",
        details: error.message,
      });
  }
};

module.exports = {
  orderItems,
  cancelOrder,
  returnOrder,
  generateInvoice,
};
