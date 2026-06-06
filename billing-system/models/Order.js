const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderNo: Number,
    customerId: Number,
    product: String,
    quantity: Number,
    amount: Number,
    orderDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order", orderSchema);
