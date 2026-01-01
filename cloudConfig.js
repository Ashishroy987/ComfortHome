// cloudConfig.js
const cloudinary = require("cloudinary").v2; // Important: use .v2
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "comfortHome_DEV",
    allowed_formats: ["png", "jpg", "jpeg", "pdf"]
  }
});

module.exports = { cloudinary, storage };
