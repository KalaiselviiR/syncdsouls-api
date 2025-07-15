const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Helper to attach S3 image URL
const attachS3ImageUrl = (product) => {
  const obj = product.toObject();
  const imageName = obj.Image || obj.image;

  if (imageName && !imageName.startsWith("http")) {
    obj.Image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/products/${imageName}`;
  }

  return obj;
};

// Helper functions to format responses according to API spec
const formatListProduct = (product) => {
  const p = product.toObject ? product.toObject() : product;
  return {
    Index: p.Index,
    Name: p.Name,
    Brand: p.Brand,
    Category: p.Category,
    Price: p.Price,
    Currency: p.Currency,
    Stock: p.Stock,
    "Internal ID": p.Internal_ID || p.InternalID,
  };
};

const formatDetailProduct = (product) => {
  const p = attachS3ImageUrl(product);
  return {
    Index: p.Index,
    Name: p.Name,
    Description: p.Description,
    Brand: p.Brand,
    Category: p.Category,
    Price: p.Price,
    Currency: p.Currency,
    Stock: p.Stock,
    EAN: p.EAN,
    Color: p.Color,
    Size: p.Size,
    Availability: p.Availability,
    ShortDescription: p.ShortDescription,
    Image: p.Image,
    "Internal ID": p.Internal_ID || p.InternalID, // Format with space
  };
};

// IMPORTANT: Define specific routes BEFORE parameterized routes

// GET /api/products/categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("Category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/latest
router.get("/latest", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const products = await Product.find()
      .sort({ Index: -1 })
      .limit(Math.min(Number(limit), 100));

    const formattedProducts = products.map(formatListProduct);
    res.json({ products: formattedProducts });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/search
router.get("/search", async (req, res) => {
  try {
    const { q = "", page = 1, limit = 50 } = req.query;
    const pageNum = Number(page);
    const limitNum = Math.min(Number(limit), 100);

    const query = q
      ? {
          $or: [
            { Internal_ID: { $regex: q, $options: "i" } },
            { InternalID: { $regex: q, $options: "i" } },
            { Name: { $regex: q, $options: "i" } },
            { Brand: { $regex: q, $options: "i" } },
            { Category: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    const total = await Product.countDocuments(query);

    const formattedProducts = products.map(formatListProduct);

    res.json({
      products: formattedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products (list all)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Number(page);
    const limitNum = Math.min(Number(limit), 100);

    const products = await Product.find()
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    const total = await Product.countDocuments();

    const formattedProducts = products.map(formatListProduct);

    res.json({
      products: formattedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/:id (get by _id or Internal_ID)
// This MUST be the LAST route
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    // Check if it's a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }

    // If not found by _id, try Internal_ID or InternalID
    if (!product) {
      product = await Product.findOne({
        $or: [{ Internal_ID: id }, { InternalID: id }],
      });
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Product detail endpoint returns just the product, no pagination
    res.json(formatDetailProduct(product));
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
