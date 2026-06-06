const db = require("../config/db");
const Order = require("../models/Order");

async function generateReport() {
    try {
        await db.connectPromise;
        // Wait for connection to open
        await new Promise((resolve) => {
            if (db.connection.readyState === 1) resolve();
            else db.connection.once("open", resolve);
        });

        // 1. Total sales report aggregation
        const totalSales = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        // 2. Customer-wise billing aggregation
        const customerSales = await Order.aggregate([
            {
                $group: {
                    _id: "$customerId",
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $sort: { _id: 1 } // Sort by customer ID ascending
            }
        ]);

        const stats = totalSales[0] || { totalOrders: 0, totalAmount: 0 };
        const totalOrders = stats.totalOrders;
        const totalRevenue = stats.totalAmount.toLocaleString('en-IN');

        console.log("---------------------------------");
        console.log("BILLING REPORT");
        console.log("---------------------------------");
        console.log("");
        console.log(`Total Orders : ${totalOrders}`);
        console.log(`Total Revenue : ₹${totalRevenue}`);
        console.log("");
        console.log("Customer Wise Sales");
        console.log("");

        customerSales.forEach((c) => {
            const formattedAmount = c.totalAmount.toLocaleString('en-IN');
            console.log(`Customer ${c._id} : ₹${formattedAmount}`);
        });

        console.log("");
        console.log("---------------------------------");

    } catch (err) {
        console.error("Error generating billing report:", err);
    } finally {
        await db.disconnect();
    }
}

if (require.main === module) {
    generateReport();
}

module.exports = generateReport;
