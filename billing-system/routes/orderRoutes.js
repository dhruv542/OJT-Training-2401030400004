const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Customer = require("../models/Customer");

// POST /api/orders
// Accepts order data from external applications and creates an Order record.
router.post("/api/orders", async (req, res) => {
    try {
        const { customerId, product, quantity, amount } = req.body;

        // Basic validation
        if (!customerId || !product || !quantity || !amount) {
            return res.status(400).json({ error: "customerId, product, quantity and amount are required" });
        }

        // Ensure the referenced customer exists
        const customer = await Customer.findOne({ customerId: customerId });
        if (!customer) {
            return res.status(404).json({ error: `Customer with customerId=${customerId} not found` });
        }

        // Generate an orderNo if one is not provided in the request body
        if (!req.body.orderNo) {
            const lastOrder = await Order.findOne().sort({ orderNo: -1 });
            req.body.orderNo = lastOrder && lastOrder.orderNo ? lastOrder.orderNo + 1 : 104;
        }

        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
