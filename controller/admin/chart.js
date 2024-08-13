const OrderDatabase = require("../../models/orderModel");

const getSalesData = async (req, res) => {
  try {
    const now = new Date();

    // Daily sales
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dailySales = await OrderDatabase.aggregate([
      { $match: { orderDate: { $gte: dayStart } } },
      {
        $group: {
          _id: { $hour: "$orderDate" },
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Weekly sales
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weeklySales = await OrderDatabase.aggregate([
      { $match: { orderDate: { $gte: weekStart } } },
      {
        $group: {
          _id: { $dayOfWeek: "$orderDate" },
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Monthly sales
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlySales = await OrderDatabase.aggregate([
      { $match: { orderDate: { $gte: monthStart } } },
      {
        $group: {
          _id: { $dayOfMonth: "$orderDate" },
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Yearly sales
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearlySales = await OrderDatabase.aggregate([
      { $match: { orderDate: { $gte: yearStart } } },
      {
        $group: {
          _id: { $month: "$orderDate" },
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    res.json({ dailySales, weeklySales, monthlySales, yearlySales });
  } catch (error) {
    res.status(500).json({ error: "Failed to get sales data" });
  }
};
module.exports = {
  getSalesData,
};
