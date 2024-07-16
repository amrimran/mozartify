require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const MetadataModel = require('./models/Metadata');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.DB_URI);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const acceptedFileTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (acceptedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and JPG files are allowed.'));
    }
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const inputFilePath = path.join(__dirname, 'uploads', req.file.filename);
  const outputDir = path.join(__dirname, 'uploads', `${path.parse(req.file.filename).name}`);
  const outputFilePath = path.join(outputDir, `${path.parse(req.file.filename).name}.mxl`);

  // Create a new directory for this upload
  fs.mkdir(outputDir, { recursive: true }, (err) => {
    if (err) {
      console.error(`Error creating directory: ${err.message}`);
      return res.status(500).json({ message: 'Error creating directory', error: err.message });
    }

    console.log(`Running Audiveris on file: ${inputFilePath}`);

    const command = `audiveris -batch -transcribe -export -output ${outputDir} ${inputFilePath}`;

    exec(command, (error, stdout, stderr) => {
      console.log(`Audiveris command: ${command}`);

      if (error) {
        console.error(`Error executing Audiveris: ${error.message}`);
        console.error(`Error details: ${stderr}`);
        return res.status(500).json({ message: 'Error processing file with Audiveris', error: error.message });
      }

      console.log(`Audiveris stdout: ${stdout}`);
      console.log(`Audiveris stderr: ${stderr}`);

      // Verify the .mxl file exists
      fs.access(outputFilePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(`Error: ${outputFilePath} does not exist`);
          return res.status(500).json({ message: 'Error: .mxl file was not created' });
        }

        console.log(`Success: ${outputFilePath} exists`);
        res.json({ filePath: `/uploads/${req.file.filename}`, mxlFilePath: `/uploads/${path.parse(req.file.filename).name}/${path.parse(req.file.filename).name}.mxl` });
      });
    });
  });
});

app.post('/catalog', async (req, res) => {
  try {
    const metadata = new MetadataModel(req.body);
    await metadata.save();
    res.status(200).json({ message: 'Metadata saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving metadata', error: err });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});