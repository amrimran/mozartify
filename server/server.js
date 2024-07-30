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
    const acceptedFileTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (acceptedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, , JPG and PDF files are allowed.'));
    }
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const inputFilePath = path.join(__dirname, 'uploads', req.file.filename);
  const outputDir = path.join(__dirname, 'uploads', `${path.parse(req.file.filename).name}`);
  const mxlFilePath = path.join(outputDir, `${path.parse(req.file.filename).name}.mxl`);
  const xmlFilePath = path.join(outputDir, `${path.parse(req.file.filename).name}.xml`);
  const abcFilePath = path.join(outputDir, `${path.parse(req.file.filename).name}.abc`);

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
      fs.access(mxlFilePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(`Error: ${mxlFilePath} does not exist`);
          return res.status(500).json({ message: 'Error: .mxl file was not created' });
        }

        console.log(`Success: ${mxlFilePath} exists`);

        // Full path to the MuseScore executable
        const musescorePath = "C:\\Program Files\\MuseScore 4\\bin\\MuseScore4.exe"; // Adjust this path if needed

        // Convert .mxl to .xml using MuseScore CLI
        const musescoreCommand = `"${musescorePath}" "${mxlFilePath}" -o "${xmlFilePath}"`;

        exec(musescoreCommand, (musescoreError, musescoreStdout, musescoreStderr) => {
          console.log(`MuseScore command: ${musescoreCommand}`);

          if (musescoreError) {
            console.error(`Error executing MuseScore: ${musescoreError.message}`);
            console.error(`Error details: ${musescoreStderr}`);
            return res.status(500).json({ message: 'Error converting .mxl to .xml with MuseScore', error: musescoreError.message });
          }

          console.log(`MuseScore stdout: ${musescoreStdout}`);
          console.log(`MuseScore stderr: ${musescoreStderr}`);

          // Verify the .xml file exists
          fs.access(xmlFilePath, fs.constants.F_OK, (err) => {
            if (err) {
              console.error(`Error: ${xmlFilePath} does not exist`);
              return res.status(500).json({ message: 'Error: .xml file was not created' });
            }

            console.log(`Success: ${xmlFilePath} exists`);

            // Resolve the absolute path to xml2abc
            const xml2abcPath = path.resolve(__dirname, 'node_modules/.bin/xml2abc');
            // Convert .xml to .abc using xml2abc-js with absolute path
            const xml2abcCommand = `"${xml2abcPath}" -o ${outputDir} ${xmlFilePath}`;

            exec(xml2abcCommand, (xml2abcError, xml2abcStdout, xml2abcStderr) => {
              console.log(`xml2abc command: ${xml2abcCommand}`);

              if (xml2abcError) {
                console.error(`Error executing xml2abc-js: ${xml2abcError.message}`);
                console.error(`Error details: ${xml2abcStderr}`);
                return res.status(500).json({ message: 'Error converting .xml to .abc with xml2abc-js', error: xml2abcError.message });
              }

              console.log(`xml2abc-js stdout: ${xml2abcStdout}`);
              console.log(`xml2abc-js stderr: ${xml2abcStderr}`);

              // Verify the .abc file exists
              fs.access(abcFilePath, fs.constants.F_OK, (err) => {
                if (err) {
                  console.error(`Error: ${abcFilePath} does not exist`);
                  return res.status(500).json({ message: 'Error: .abc file was not created' });
                }

                console.log(`Success: ${abcFilePath} exists`);
                res.json({
                  filePath: `/uploads/${req.file.filename}`,
                  mxlFilePath: `/uploads/${path.parse(req.file.filename).name}/${path.parse(req.file.filename).name}.mxl`,
                  xmlFilePath: `/uploads/${path.parse(req.file.filename).name}/${path.parse(req.file.filename).name}.xml`,
                  abcFilePath: `/uploads/${path.parse(req.file.filename).name}/${path.parse(req.file.filename).name}.abc` // Return the abcFilePath
                });
              });
            });
          });
        });
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
