const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  Index: Number,
  Name: String,
  Brand: String,
  Category: String,
  Price: Number,
  Currency: String,
  Stock: Number,
  InternalID: String,
  Image: String,
  Description: String,
  Color: String,
  Size: String,
  Availability: String,
  EAN: String,
  ShortDescription: String,
});

module.exports = mongoose.model('Product', ProductSchema);
