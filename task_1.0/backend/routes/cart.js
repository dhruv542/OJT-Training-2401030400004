const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const authMiddleware = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/cart - Retrieve logged-in user's cart (Protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    
    // If user has no cart in DB, create one and return it
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
      await cart.save();
    }
    
    res.json(cart);
  } catch (err) {
    console.error('Cart fetch error:', err.message);
    res.status(500).json({ error: 'Server error retrieving shopping cart.' });
  }
});

// POST /api/cart - Add or update product quantity in cart (Protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid product or quantity.' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists, replace/increment quantity
      cart.items[itemIndex].quantity = quantity;
    } else {
      // Product is new to cart
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    
    // Retrieve populated cart to return back to frontend
    const populatedCart = await Cart.findOne({ user: req.userId }).populate('items.product');
    res.json(populatedCart);
  } catch (err) {
    console.error('Cart addition error:', err.message);
    res.status(500).json({ error: 'Server error updating shopping cart.' });
  }
});

// DELETE /api/cart - Remove a product or clear entire cart (Protected)
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.query; // If empty, will clear entire cart

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID.' });
      }
      // Remove specific item
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
    } else {
      // Clear all items
      cart.items = [];
    }

    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.userId }).populate('items.product');
    res.json(populatedCart);
  } catch (err) {
    console.error('Cart removal error:', err.message);
    res.status(500).json({ error: 'Server error clearing cart items.' });
  }
});

module.exports = router;
