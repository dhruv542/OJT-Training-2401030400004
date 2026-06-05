const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // Main cover image
  images: [{ type: String }], // Gallery for roll-over/detailed zoom
  category: { type: String, required: true, index: true },
  reviewsCount: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  isClearance: { type: Boolean, default: false, index: true },
  stock: { type: Number, default: 20 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
