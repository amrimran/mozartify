const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const MetadataModel = require('./models/Metadata'); // Importing the Metadata model

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect("mongodb://localhost:27017/mozartify", {});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Endpoint for file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// Endpoint for saving metadata
app.post('/catalog', async (req, res) => {
  try {
    const metadata = new MetadataModel(req.body);
    await metadata.save();
    res.status(200).json({ message: 'Metadata saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving metadata', error: err });
  }
});

const PORT = process.env.PORT || 3002;  // Change to a different port if necessary
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
