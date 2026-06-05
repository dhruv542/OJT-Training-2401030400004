const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// GET /api/products - Get all products with search & filter options
router.get('/', async (req, res) => {
  try {
    const { category, search, clearance } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== 'All categories' && category.trim() !== '') {
      query.category = category.trim();
    }

    // Filter by Clearance status
    if (clearance === 'true') {
      query.isClearance = true;
    }

    // Search by keyword - Case-insensitive regex
    if (search && search.trim() !== '') {
      const keyword = search.trim();
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error('Products fetch error:', err.message);
    res.status(500).json({ error: 'Server error retrieving products list.' });
  }
});

// GET /api/products/:id - Get a single product details
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Explicitly validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product identifier.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(product);
  } catch (err) {
    console.error('Single product fetch error:', err.message);
    res.status(500).json({ error: 'Server error retrieving product details.' });
  }
});

module.exports = router;
