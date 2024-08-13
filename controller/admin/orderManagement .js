const OrderDatabase = require("../../models/orderModel");

const getOrderManagement = async (req, res) => {
  try {
    const orders = await OrderDatabase.find().populate(
      "orderedItems.productId"
    );
    res.render("admin/orderManagement", { orders, menu: "orders" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

const postOrderManagement = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    console.log(orderId, status);

    const validStatuses = [
      "Pending",
      "Shipped",
      "Processing",
      "Delivered",
      "Cancelled",
      "Returned",
    ];
    const currentOrder = await OrderDatabase.findOne({ _id: orderId });
    console.log(currentOrder);

    if (!currentOrder) {
      return res.status(404).send("Order not found");
    }

    // Prevent status change to previous statuses
    if (
      validStatuses.indexOf(status) <=
      validStatuses.indexOf(currentOrder.status)
    ) {
      return res.status(400).send("Invalid status change");
    }

    currentOrder.status = status;
    await currentOrder.save();

    res.send("Order status updated");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

module.exports = {
  getOrderManagement,
  postOrderManagement,
};
