const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products
router.get('/', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const products = await Product.find()
    .skip((page - 1) * limit)
    .limit(Math.min(limit, 100));
  const total = await Product.countDocuments();
  res.json({
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await Product.findOne({ InternalID: req.params.id });
  if (!product) return res.status(404).json({ error: "Not Found" });
  res.json(product);
});

// GET /api/products/search
router.get('/search', async (req, res) => {
  const { q = '', page = 1, limit = 50 } = req.query;
  const query = { InternalID: { $regex: q, $options: 'i' } };
  const products = await Product.find(query)
    .skip((page - 1) * limit)
    .limit(Math.min(limit, 100));
  const total = await Product.countDocuments(query);
  res.json({
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

// GET /api/products/latest
router.get('/latest', async (req, res) => {
  const { limit = 10 } = req.query;
  const products = await Product.find().sort({ Index: -1 }).limit(Number(limit));
  res.json({ products });
});

// GET /api/categories
router.get('/categories', async (req, res) => {
  const categories = await Product.distinct("Category");
  res.json(categories);
});

module.exports = router;
