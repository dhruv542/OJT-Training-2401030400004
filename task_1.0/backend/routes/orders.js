const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// POST /api/orders - Place a new order (Protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pin || !shippingAddress.phone) {
      return res.status(400).json({ error: 'Shipping address is required and incomplete.' });
    }

    // Retrieve active user cart
    const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cannot checkout. Shopping cart is empty.' });
    }

    let calculatedTotal = 0;
    const orderItems = [];

    // Parse and validate items against DB price values to prevent price tampering
    for (const item of cart.items) {
      const dbProduct = await Product.findById(item.product._id);
      if (!dbProduct) {
        return res.status(400).json({ error: `Product ${item.product.name} no longer exists.` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${dbProduct.name}` });
      }

      const itemCost = dbProduct.price * item.quantity;
      calculatedTotal += itemCost;

      orderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity
      });

      // Deduct inventory stock
      dbProduct.stock -= item.quantity;
      await dbProduct.save();
    }

    // Create order
    const newOrder = new Order({
      user: req.userId,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName || '',
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pin: shippingAddress.pin,
        phone: shippingAddress.phone
      }
    });

    await newOrder.save();

    // Clear user cart
    cart.items = [];
    await cart.save();

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Order creation error:', err.message);
    res.status(500).json({ error: 'Server error during checkout process.' });
  }
});

// GET /api/orders - Fetch current user's order history (Protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Orders fetch error:', err.message);
    res.status(500).json({ error: 'Server error fetching order history.' });
  }
});

module.exports = router;
