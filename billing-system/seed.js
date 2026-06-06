const db = require("./config/db");
const Customer = require("./models/Customer");
const Order = require("./models/Order");

async function seed() {
    try {
        console.log("Connecting to database...");
        await db.connectPromise;
        // Wait for connection to open
        await new Promise((resolve) => {
            if (db.connection.readyState === 1) resolve();
            else db.connection.once("open", resolve);
        });
        console.log("Connected to MongoDB.");

        // Clear existing documents
        await Customer.deleteMany({});
        await Order.deleteMany({});
        console.log("Cleared existing Customer and Order collections.");

        // Insert Customer Master Documents
        const customers = await Customer.insertMany([
            {
                customerId: 1,
                name: "Rahul Patel",
                city: "Ahmedabad",
                mobile: "9876543210",
                email: "rahul@gmail.com"
            },
            {
                customerId: 2,
                name: "Amit Shah",
                city: "Surat",
                mobile: "9876543211",
                email: "amit@gmail.com"
            },
            {
                customerId: 3,
                name: "Priya Desai",
                city: "Ahmedabad",
                mobile: "9876543212",
                email: "priya@gmail.com"
            }
        ]);
        console.log("Inserted Customer Master Documents:", customers.length);

        // Insert Order Master Documents
        const orders = await Order.insertMany([
            {
                orderNo: 101,
                customerId: 1,
                product: "Laptop",
                quantity: 1,
                amount: 50000,
                orderDate: new Date()
            },
            {
                orderNo: 102,
                customerId: 2,
                product: "Mouse",
                quantity: 2,
                amount: 1000,
                orderDate: new Date()
            },
            {
                orderNo: 103,
                customerId: 3,
                product: "Keyboard",
                quantity: 1,
                amount: 2000,
                orderDate: new Date()
            }
        ]);
        console.log("Inserted Order Master Documents:", orders.length);

        // Step 6: Fetch Orders Given Within Last 5 Days
        console.log("\n------------------------------------------------");
        console.log("STEP 6: Orders Given Within Last 5 Days");
        console.log("------------------------------------------------");
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const recentOrders = await Order.find({
            orderDate: { $gte: fiveDaysAgo }
        });
        console.log(JSON.stringify(recentOrders, null, 2));

        // Step 7: Show Order Details + Customer Details from Ahmedabad
        console.log("\n------------------------------------------------");
        console.log("STEP 7: Order Details + Customer Details (Ahmedabad)");
        console.log("------------------------------------------------");
        const ahmedabadOrders = await Order.aggregate([
            {
                $lookup: {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "customerId",
                    as: "customer"
                }
            },
            {
                $unwind: "$customer"
            },
            {
                $match: {
                    "customer.city": "Ahmedabad"
                }
            },
            {
                $project: {
                    _id: 0,
                    orderNo: 1,
                    product: 1,
                    quantity: 1,
                    amount: 1,
                    customerName: "$customer.name",
                    city: "$customer.city",
                    mobile: "$customer.mobile"
                }
            }
        ]);

        console.table(ahmedabadOrders);

    } catch (err) {
        console.error("Error seeding database:", err);
    } finally {
        // Disconnect mongoose
        await db.disconnect();
        console.log("\nDatabase connection closed.");
    }
}

seed();
