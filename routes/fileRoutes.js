const express = require("express");
const multer = require("multer");

const router = express.Router();

const fileControllers = require('../controllers/fileControllers')

// Set up multer storage for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Destination folder to save the uploaded files
  },
  filename: (req, file, cb) => {
    // Customize the file name if needed
    cb(null, Date.now() + '_' + file.originalname);
  },
});

// Create the multer upload instance
const upload = multer({ storage: storage });

// Define the file upload route using the upload middleware
router.post("/upload", upload.single('file'), fileControllers.uploadFile);
router.get('/download/:filename', fileControllers.downloadFile);

module.exports = router;
