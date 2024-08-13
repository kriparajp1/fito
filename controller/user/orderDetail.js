const OrderDatabase = require("../../models/orderModel");

const cancelOrder = async (req, res) => {
  const { itemId } = req.body;
  try {
    const order = await OrderDatabase.findOne({ "orderedItems._id": itemId });
    if (!order) {
      return res.status(404).send("Item not found");
    }
    const item = order.orderedItems.id(itemId);
    if (item.status === "Cancelled" || item.status === "Returned") {
      return res
        .status(400)
        .json({ message: "Item is already cancelled or returned" });
    }
    item.status = "Cancelled";
    await order.save();
    res.json({ status: "cancelled" });
  } catch (error) {
    console.error("Error cancelling item:", error);
    res.status(500).send("Server error");
  }
};

const returnOrder = async (req, res) => {
  const { itemId } = req.body;
  try {
    const order = await OrderDatabase.findOne({ "orderedItems._id": itemId });
    if (!order) {
      return res.status(404).send("Item not found");
    }
    const item = order.orderedItems.id(itemId);
    if (item.status === "Cancelled" || item.status === "Returned") {
      return res
        .status(400)
        .json({ message: "Item is already cancelled or returned" });
    }
    item.status = "Returned";
    await order.save();
    res.json({ status: "returned" });
  } catch (error) {
    console.error("Error returning item:", error);
    res.status(500).send("Server error");
  }
};

const orderview = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await OrderDatabase.findById(orderId).populate(
      "orderedItems.productId"
    );
    if (!order) {
      return res.status(404).send("Order not found");
    }
    res.render("user/orderDetails", {
      order,
      wishlistCount: res.locals.wishlistCount,
      cartCount: res.locals.cartCount,
      status: true,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).send("Server error");
  }
};

module.exports = {
  orderview,
  cancelOrder,
  returnOrder,
};
