require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const PORT = process.env.PORT;

const MONGODB_URI = process.env.MONGODB_URI;

//This is the configuration for cloudinary. It uses the credentials provided in the .env file.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = { PORT, MONGODB_URI, cloudinary };