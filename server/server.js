require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const ABCFileModel = require('./models/ABCFile'); // Import the ABCFile model

const app = express();
app.use(express.json());

// CORS setup to allow multiple origins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Static file serving for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Configure file storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const acceptedFileTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (acceptedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed.'));
    }
  }
});

// Endpoint to upload file, transcribe, convert, and save to MongoDB
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const inputFilePath = path.join(__dirname, 'uploads', req.file.filename);
  const outputDir = path.join(__dirname, 'uploads', `${path.parse(req.file.filename).name}`);
  const mxlFilePath = path.join(outputDir, `${path.parse(req.file.filename).name}.mxl`);
  const xmlFilePath = path.join(outputDir, `${path.parse(req.file.filename).name}.xml`);
  const abcFilePath = path.join(outputDir, `${path.parse(req.file.filename).name}.abc`);

  fs.mkdir(outputDir, { recursive: true }, (err) => {
    if (err) {
      console.error(`Error creating directory: ${err.message}`);
      return res.status(500).json({ message: 'Error creating directory', error: err.message });
    }

    console.log(`Running Audiveris on file: ${inputFilePath}`);
    const command = `audiveris -batch -transcribe -export -output ${outputDir} ${inputFilePath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Audiveris: ${error.message}`);
        return res.status(500).json({ message: 'Error processing file with Audiveris', error: error.message });
      }

      const musescorePath = process.env.MUSESCORE_PATH || "C:\\Program Files\\MuseScore 4\\bin\\MuseScore4.exe";
      const musescoreCommand = `"${musescorePath}" "${mxlFilePath}" -o "${xmlFilePath}"`;

      exec(musescoreCommand, (musescoreError) => {
        if (musescoreError) {
          return res.status(500).json({ message: 'Error converting .mxl to .xml with MuseScore', error: musescoreError.message });
        }

        const xml2abcPath = path.resolve(__dirname, 'node_modules/.bin/xml2abc');
        const xml2abcCommand = `"${xml2abcPath}" -o ${outputDir} ${xmlFilePath}`;

        exec(xml2abcCommand, (xml2abcError) => {
          if (xml2abcError) {
            return res.status(500).json({ message: 'Error converting .xml to .abc with xml2abc-js', error: xml2abcError.message });
          }

          fs.readFile(abcFilePath, 'utf8', async (readError, data) => {
            if (readError) {
              return res.status(500).json({ message: 'Error reading .abc file', error: readError.message });
            }

            try {
              const abcFile = new ABCFileModel({
                filename: req.file.filename,
                content: data,
              });
              await abcFile.save();

              res.json({
                filePath: `/uploads/${req.file.filename}`,
                mxlFilePath: `/uploads/${path.parse(req.file.filename).name}/${path.parse(req.file.filename).name}.mxl`,
                xmlFilePath: `/uploads/${path.parse(req.file.filename).name}/${path.parse(req.file.filename).name}.xml`,
                abcFilePath: `/uploads/${path.parse(req.file.filename).name}/${path.parse(req.file.filename).name}.abc`,
                message: 'File uploaded and processed successfully'
              });
            } catch (saveError) {
              res.status(500).json({ message: 'Error saving .abc file to MongoDB', error: saveError.message });
            }
          });
        });
      });
    });
  });
});

// Endpoint to handle prediction request based on Firebase URL
app.post('/predictFromURL', async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    console.error("No file URL provided");
    return res.status(400).send("No file URL provided.");
  }

  try {
    console.log("Sending Firebase file URL to FastAPI server:", fileUrl);
    const response = await axios.post('http://127.0.0.1:5173/predictFromURL', { fileUrl });
    res.json(response.data);
  } catch (error) {
    console.error("Error while sending to FastAPI:", error.message);
    res.status(500).send("Error while predicting mood");
  }
});

// Additional endpoints
app.get('/abc-file', async (req, res) => {
  try {
    const abcFiles = await ABCFileModel.find({ deleted: false }).sort({ _id: -1 });
    res.status(200).json(abcFiles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching files', error: err.message });
  }
});

app.get('/abc-file/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let abcFile;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      abcFile = await ABCFileModel.findById(identifier);
    } else {
      abcFile = await ABCFileModel.findOne({ filename: identifier });
    }

    if (!abcFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json(abcFile);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching file', error: err.message });
  }
});

app.put('/abc-file/:filename/content', async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;

    const abcFile = await ABCFileModel.findOneAndUpdate(
      { filename },
      { content },
      { new: true }
    );

    if (!abcFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({ message: 'ABC content updated successfully', abcFile });
  } catch (err) {
    res.status(500).json({ message: 'Error updating ABC content', error: err.message });
  }
});

// Endpoint to get catalog data by filename
app.get('/catalog/:fileName', async (req, res) => {
  try {
    const catalogData = await ABCFileModel.findOne({ filename: req.params.fileName });
    if (!catalogData) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(200).json(catalogData);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching catalog data', error: err.message });
  }
});

// Save catalog metadata
app.post('/catalog', async (req, res) => {
  try {
    const fields = [
      'albums', 'alternativeTitle', 'artist', 'backgroundResources', 'callNumber', 'composer', 
      'composerTimePeriod', 'contributor', 'copyright', 'cosmeticsAndProp', 'country', 'coverImageUrl',
      'creator', 'dateAccessioned', 'dateAvailable', 'dateIssued', 'dateOfBirth', 'dateOfComposition', 
      'dateOfCreation', 'dateOfRecording', 'description', 'digitalCollection', 'edition', 'editor', 
      'element', 'ethnicGroup', 'firstPublication', 'format', 'gamutScale', 'genre', 'historicalContext', 
      'identifier', 'instrumentation', 'intonation', 'key', 'language', 'lastModified', 'length', 
      'librettist', 'lyrics', 'melodicClassification', 'melodyDescriptions', 'methodOfImplementation', 
      'miscNotes', 'movementsSections', 'mp3FileUrl', 'mp3FileName', 'notation', 'numberInPublication',
      'objectCollections', 'occasionOfPerforming', 'performingSkills', 'permalink', 'pieceStyle', 
      'placeOfBirth', 'placeOfOrigin', 'placeOfProsper', 'placeOfResidence', 'position', 'prevalence', 
      'publisher', 'purposeOfCreation', 'recordingPerson', 'region', 'relatedArtists', 'relatedWork', 
      'rights', 'sheetMusic', 'sponsor', 'stagePerformance', 'subject', 'targetAudience', 'temperament', 
      'timeOfOrigin', 'timeOfProsper', 'title', 'trackFunction', 'tracks', 'type', 'uri', 'vocalStyle',
      'westernParallel', 'workTitle', 'emotion'
    ];

    const updateData = {};
    fields.forEach(field => {
      updateData[field] = req.body[field] || "";
    });

    const abcFile = await ABCFileModel.findOneAndUpdate(
      { filename: req.body.filename },
      updateData,
      { new: true }
    );

    if (!abcFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({ message: 'Metadata saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving metadata', error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
