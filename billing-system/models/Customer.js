const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    customerId: Number,
    name: String,
    city: String,
    mobile: String,
    email: String
});

module.exports = mongoose.model("Customer", customerSchema);
