// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    Index: Number,
    Name: String,
    Description: String,
    Brand: String,
    Category: String,
    Price: Number,
    Currency: String,
    Stock: Number,
    EAN: String,
    Color: String,
    Size: String,
    Availability: String,
    ShortDescription: String,
    Image: String,
    Internal_ID: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
