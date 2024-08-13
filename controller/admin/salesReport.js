const OrderDatabase = require("../../models/orderModel");
const userbasecollections = require("../../models/usermodel");
const PDFDocument = require("pdfkit-table");
const moment = require("moment");

const getSalesReports = async (req, res) => {
  try {
    const { start, end, range, page = 1, limit = 5 } = req.query;
    let startDate, endDate;

    // Date range logic
    if (range === "daily") {
      startDate = moment().startOf("day");
      endDate = moment().endOf("day");
    } else if (range === "weekly") {
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
    } else if (range === "monthly") {
      startDate = moment().startOf("month");
      endDate = moment().endOf("month");
    } else if (range === "yearly") {
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
    } else if (
      start &&
      end &&
      moment(start).isValid() &&
      moment(end).isValid()
    ) {
      startDate = moment(start);
      endDate = moment(end).endOf("day");
    } else {
      // Default to show orders from the past month
      startDate = moment().subtract(1, "month").startOf("day");
      endDate = moment().endOf("day");
    }

    console.log(
      `Fetching orders from ${startDate.toDate()} to ${endDate.toDate()}`
    );

    const skip = (page - 1) * limit;

    // Fetch paginated orders including returned and canceled statuses
    const orders = await OrderDatabase.find({
      status: { $in: ["Delivered", "Returned", "Cancelled"] },
      orderDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    })
      .populate("user_id", "name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ orderDate: -1 });

    const discount = orders
      .map((a, b) => a.discountAmount)
      .reduce((a, b) => a + b);

    // Count total orders
    const totalOrders = await OrderDatabase.countDocuments({
      status: { $in: ["Delivered", "Returned", "Cancelled"] },
      orderDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    });

    // Calculate totals for all orders in the date range
    const totals = await OrderDatabase.aggregate([
      {
        $match: {
          status: { $in: ["Delivered", "Returned", "Cancelled"] },
          orderDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
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

    const {
      totalSales,
      totalCoupons,
      totalOfferDiscount,
      totalSalesCount,
      totalCanceledReturnedCount,
    } = totals[0] || {
      totalSales: 0,
      totalCoupons: 0,
      totalOfferDiscount: 0,
      totalSalesCount: 0,
      totalCanceledReturnedCount: 0,
    };

    const totalPages = Math.ceil(totalOrders / limit);

    const queryString = req.url.includes("?")
      ? req.url.slice(req.url.indexOf("?"))
      : "";

    res.render("admin/salesReport", {
      orders,
      user: req.session.user,
      totalSales,
      totalCoupons,
      totalOfferDiscount: discount,
      totalOrders,
      totalSalesCount,
      totalCanceledReturnedCount,
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      range,
      queryString,
      currentPage: parseInt(page),
      totalPages,
      limit: parseInt(limit),
      menu: "salesreport",
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    res.status(500).render("error", {
      message: "Error occurred while fetching sales report",
      user: req.session.user,
    });
  }
};

// const generatePDFReport = async (req, res) => {
//     try {
//         const { start, end, range } = req.query;
//         let startDate, endDate;

//         // Date range logic
//         if (range === 'daily') {
//             startDate = moment().startOf('day');
//             endDate = moment().endOf('day');
//         } else if (range === 'weekly') {
//             startDate = moment().startOf('week');
//             endDate = moment().endOf('week');
//         } else if (range === 'monthly') {
//             startDate = moment().startOf('month');
//             endDate = moment().endOf('month');
//         } else if (range === 'yearly') {
//             startDate = moment().startOf('year');
//             endDate = moment().endOf('year');
//         } else if (start && end && moment(start).isValid() && moment(end).isValid()) {
//             startDate = moment(start);
//             endDate = moment(end).endOf('day');
//         } else {
//             startDate = moment().subtract(1, 'month').startOf('day');
//             endDate = moment().endOf('day');
//         }

//         const orders = await OrderDatabase.find({
//             status: "Delivered",
//             orderDate: { $gte: startDate.toDate(), $lte: endDate.toDate() }
//         })
//         .populate('user_id', 'name')
//         .sort({ orderDate: -1 });

//         // Create a new PDF document
//         const doc = new PDFDocument({ margin: 30, size: 'A4' });

//         // Pipe the PDF document to the response
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename=sales_report_${startDate.format('YYYY-MM-DD')}_to_${endDate.format('YYYY-MM-DD')}.pdf`);
//         doc.pipe(res);

//         // Add title
//         doc.fontSize(18).text('Sales Report', { align: 'center' });
//         doc.moveDown();

//         // Add date range
//         doc.fontSize(12).text(`From: ${startDate.format('YYYY-MM-DD')} To: ${endDate.format('YYYY-MM-DD')}`, { align: 'center' });
//         doc.moveDown();

//         // Add summary statistics
//         let totalSales = 0, totalDiscount = 0, totalCoupons = 0, totalOfferDiscount = 0;
//         orders.forEach(order => {
//             totalSales += order.finalAmount;
//             totalDiscount += order.discountAmount || 0;
//             totalCoupons += order.couponDiscount || 0;
//             totalOfferDiscount += order.offerDiscount || 0;
//         });

//         doc.fontSize(14).text('Summary');
//         doc.fontSize(10)
//            .text(`Total Sales: Rs:${totalSales.toFixed(2)}`)
//            .text(`Total Coupons: Rs:${totalCoupons.toFixed(2)}`)
//            .text(`Total Offer Discount: Rs:${totalOfferDiscount.toFixed(2)}`)
//            .text(`Total Orders: Rs:${orders.length}`);
//         doc.moveDown();

//         // Create the table
//         const table = {
//             title: "Orders",
//             headers: ['Order ID', 'User', 'Total Amount', 'Discount', 'Coupon', 'Offer', 'Final Amount', 'Payment', 'Date'],
//             rows: orders.map(order => [
//                 order._id.toString().slice(-6),
//                 `${order.user_id.name}`,
//                 `Rs:${order.totalAmount.toFixed(2)}`,
//                 `Rs:${(order.discountAmount || 0).toFixed(2)}`,
//                 `Rs:${(order.couponDiscount || 0).toFixed(2)}`,
//                 `Rs:${(order.offerDiscount || 0).toFixed(2)}`,
//                 `Rs:${order.finalAmount.toFixed(2)}`,
//                 order.paymentMethod,
//                 moment(order.orderDate).format('YYYY-MM-DD HH:mm')
//             ])
//         };

//         // Draw the table
//         await doc.table(table, {
//             prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
//             prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
//                 doc.font('Helvetica').fontSize(8);
//                 indexColumn === 0 && doc.addBackground(rectRow, 'white', 0.15);
//             },
//         });

//         // Finalize the PDF and end the stream
//         doc.end();

//     } catch (error) {
//         console.error('Error generating PDF:', error);
//         res.status(500).send("Error generating PDF report");
//     }
// };
const generatePDFReport = async (req, res) => {
  try {
    const { start, end, range } = req.query;
    let startDate, endDate;

    // Date range logic
    if (range === "daily") {
      startDate = moment().startOf("day");
      endDate = moment().endOf("day");
    } else if (range === "weekly") {
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
    } else if (range === "monthly") {
      startDate = moment().startOf("month");
      endDate = moment().endOf("month");
    } else if (range === "yearly") {
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
    } else if (
      start &&
      end &&
      moment(start).isValid() &&
      moment(end).isValid()
    ) {
      startDate = moment(start);
      endDate = moment(end).endOf("day");
    } else {
      startDate = moment().subtract(1, "month").startOf("day");
      endDate = moment().endOf("day");
    }

    const orders = await OrderDatabase.find({
      status: "Delivered",
      orderDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    })
      .populate("user_id", "name")
      .sort({ orderDate: -1 });

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 30, size: "A4" });

    // Pipe the PDF document to the response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales_report_${startDate.format(
        "YYYY-MM-DD"
      )}_to_${endDate.format("YYYY-MM-DD")}.pdf`
    );
    doc.pipe(res);

    // Add title
    doc.fontSize(18).text("Sales Report", { align: "center" });
    doc.moveDown();

    // Add date range
    doc
      .fontSize(12)
      .text(
        `From: ${startDate.format("YYYY-MM-DD")} To: ${endDate.format(
          "YYYY-MM-DD"
        )}`,
        { align: "center" }
      );
    doc.moveDown();

    // Add summary statistics
    let totalSales = 0,
      totalDiscount = 0,
      totalCoupons = 0,
      totalOfferDiscount = 0;
    orders.forEach((order) => {
      totalSales += order.finalAmount;
      totalDiscount += order.discountAmount || 0;
      totalCoupons += order.couponDiscount || 0;
      totalOfferDiscount += order.offerDiscount || 0;
    });

    doc.fontSize(14).text("Summary");
    doc
      .fontSize(10)
      .text(`Total Sales: Rs:${totalSales.toFixed(2)}`)
      .text(`Total Coupons: Rs:${totalCoupons.toFixed(2)}`)
      .text(`Total Offer Discount: Rs:${totalOfferDiscount.toFixed(2)}`)
      .text(`Total Orders: Rs:${orders.length}`);
    doc.moveDown();

    // Create the table
    const table = {
      title: "Orders",
      headers: [
        "Order ID",
        "User",
        "Total Amount",
        "Discount",
        "Coupon",
        "Offer",
        "Final Amount",
        "Payment",
        "Date",
      ],
      rows: orders.map((order) => [
        order._id.toString().slice(-6),
        `${order.user_id.name}`,
        `Rs:${order.totalAmount.toFixed(2)}`,
        `Rs:${(order.discountAmount || 0).toFixed(2)}`,
        `Rs:${(order.couponDiscount || 0).toFixed(2)}`,
        `Rs:${(order.offerDiscount || 0).toFixed(2)}`,
        `Rs:${order.finalAmount.toFixed(2)}`,
        order.paymentMethod,
        moment(order.orderDate).format("YYYY-MM-DD HH:mm"),
      ]),
    };

    // Draw the table
    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Helvetica").fontSize(8);
        indexColumn === 0 && doc.addBackground(rectRow, "white", 0.15);
      },
    });

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF report");
  }
};

const getReturnedCanceledOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 2; // Number of orders per page
    const skip = (page - 1) * limit;

    // Fetch returned/canceled orders
    const orders = await OrderDatabase.find({
      status: { $in: ["Cancelled", "Returned"] },
    })
      .populate("user_id") // Assuming user_id is a reference to the User model
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Calculate total pages for pagination
    const totalCount = await OrderDatabase.countDocuments({
      status: { $in: ["Cancelled", "Returned"] },
    });
    const totalPages = Math.ceil(totalCount / limit);

    console.log("Fetched orders:", orders); // Check fetched orders in console

    res.json({
      orders: orders,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error("Error fetching returned and canceled orders:", error);
    res
      .status(500)
      .json({
        message: "Error occurred while fetching returned and canceled orders",
      });
  }
};

module.exports = {
  getSalesReports,
  generatePDFReport,
  getReturnedCanceledOrders,
};
