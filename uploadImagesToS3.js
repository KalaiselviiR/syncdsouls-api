const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("./models/Product"); // adjust if needed

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const BUCKET = process.env.AWS_BUCKET_NAME;

const uploadToS3 = async (folder, filename) => {
  const filePath = path.join(__dirname, "images", folder, filename);
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: BUCKET,
    Key: `${folder.toLowerCase()}/${filename}`,
    Body: fileContent,

    ContentType: "image/jpeg",
  };

  const data = await s3.upload(params).promise();
  return data.Location; // S3 URL
};

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const productFiles = fs.readdirSync(
      path.join(__dirname, "images", "Products")
    );
    for (const file of productFiles) {
      const s3Url = await uploadToS3("Products", file);
      const productId = path.parse(file).name; // '1.jpg' => '1'

      const updated = await Product.findOneAndUpdate(
        { Index: parseInt(productId) },
        { image: s3Url },
        { new: true }
      );

      if (updated) {
        console.log(`✅ Product ${productId} updated with image`);
      } else {
        console.log(`⚠️  Product with id ${productId} not found`);
      }
    }

    // (Optional) Upload Banners
    const bannerFiles = fs.readdirSync(
      path.join(__dirname, "images", "Banners")
    );
    for (const file of bannerFiles) {
      const s3Url = await uploadToS3("Banners", file);
      console.log(`✅ Banner ${file} uploaded: ${s3Url}`);
    }

    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
  } catch (err) {
    console.error("❌ Error:", err);
  }
};

main();
