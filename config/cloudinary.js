const cloudinary = require('cloudinary')
const cloudinaryStorage = require('multer-storage-cloudinary')
var express = require('express');
const multer = require('multer')
var app = express();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
});

var storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'folder-name',
    allowedFormats: ['jpg', 'png'],
    filename: function (req, file, cb) {
      cb(undefined, 'my-file-name');
    }
  });
   
  const uploadCloud = multer({ storage: storage });

  module.exports = uploadCloud; 