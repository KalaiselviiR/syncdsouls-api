require('dotenv').config();
const mongoose = require('mongoose');

// Define your schema
const productSchema = new mongoose.Schema({
  Index: Number,
  Name: String,
  Brand: String,
  Category: String,
  Price: Number,
  Currency: String,
  Stock: Number,
  InternalID: String
});

// Create model
const Product = mongoose.model('Product', productSchema);

// Sample data
const products = [
  {
    Index: 1001,
    Name: "Portable Clock Drone Charger Clean Ultra",
    Brand: "Ruiz Group",
    Category: "Accessories (Bags, Hats, Belts)",
    Price: 562,
    Currency: "USD",
    Stock: 925,
    InternalID: "04cc19ed-772c-4cab-9758-057962c2a475"
  },
  {
    Index: 1002,
    Name: "Smart Wireless Speaker Pro",
    Brand: "AudioVibe",
    Category: "Electronics",
    Price: 129,
    Currency: "USD",
    Stock: 300,
    InternalID: "f82d91f0-7c64-4c9a-b9f7-456738a8d411"
  }
];

// Mongo connection and insert
async function uploadData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("MongoDB connected ✅");

    // Clear collection first if needed
    await Product.deleteMany({});
    console.log("Old data cleared 🧹");

    await Product.insertMany(products);
    console.log("Sample data inserted ✅");

    process.exit();
  } catch (error) {
    console.error("Mongo Error ❌", error);
    process.exit(1);
  }
}

uploadData();
