import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  apikey: '432542282457729',
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default cloudinary;
