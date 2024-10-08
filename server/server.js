require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const ABCFileModel = require('./models/ABCFile'); // Import the ABCFile model

const app = express();
app.use(express.json());

// Configure CORS with specific origin and credentials
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend origin
  credentials: true,               // Allow credentials (cookies, authorization headers, etc.)
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Preserve the original filename
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

// Upload endpoint
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
      console.log(`Audiveris command: ${command}`);
      if (error) {
        console.error(`Error executing Audiveris: ${error.message}`);
        console.error(`Error details: ${stderr}`);
        return res.status(500).json({ message: 'Error processing file with Audiveris', error: error.message });
      }

      console.log(`Audiveris stdout: ${stdout}`);
      console.log(`Audiveris stderr: ${stderr}`);

      fs.access(mxlFilePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(`Error: ${mxlFilePath} does not exist`);
          return res.status(500).json({ message: 'Error: .mxl file was not created' });
        }

        console.log(`Success: ${mxlFilePath} exists`);

        const musescorePath = process.env.MUSESCORE_PATH || "C:\\Program Files\\MuseScore 4\\bin\\MuseScore4.exe";
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

          fs.access(xmlFilePath, fs.constants.F_OK, (err) => {
            if (err) {
              console.error(`Error: ${xmlFilePath} does not exist`);
              return res.status(500).json({ message: 'Error: .xml file was not created' });
            }

            console.log(`Success: ${xmlFilePath} exists`);
            const xml2abcPath = path.resolve(__dirname, 'node_modules/.bin/xml2abc');
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

              fs.access(abcFilePath, fs.constants.F_OK, (err) => {
                if (err) {
                  console.error(`Error: ${abcFilePath} does not exist`);
                  return res.status(500).json({ message: 'Error: .abc file was not created' });
                }

                console.log(`Success: ${abcFilePath} exists`);

                // Read the .abc file content
                fs.readFile(abcFilePath, 'utf8', async (readError, data) => {
                  if (readError) {
                    console.error(`Error reading .abc file: ${readError.message}`);
                    return res.status(500).json({ message: 'Error reading .abc file', error: readError.message });
                  }

                  // Save the .abc file content to MongoDB
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
                    console.error(`Error saving .abc file to MongoDB: ${saveError.message}`);
                    return res.status(500).json({ message: 'Error saving .abc file to MongoDB', error: saveError.message });
                  }
                });
              });
            });
          });
        });
      });
    });
  });
});

// New endpoint to get all ABC files (dashboard)
app.get('/abc-file', async (req, res) => {
  try {
    // Fetch all ABC files where deleted is false, sorted in descending order by _id (latest entries first)
    const abcFiles = await ABCFileModel.find({ deleted: false }).sort({ _id: -1 });
    res.status(200).json(abcFiles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching files', error: err.message });
  }
});



// Combined Endpoint to fetch a single ABC file by filename or _id (clerkmusicscoreview & preview)
app.get('/abc-file/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    let abcFile;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      // Query by _id if the identifier is a valid ObjectId
      abcFile = await ABCFileModel.findById(identifier);
    } else {
      // Otherwise, query by filename
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

// New endpoint to update ABC content by filename (edit)
app.put('/abc-file/:filename/content', async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;

    console.log(`Attempting to update ABC content for filename: ${filename}`);

    const abcFile = await ABCFileModel.findOneAndUpdate(
      { filename },
      { content },
      { new: true }
    );

    if (!abcFile) {
      console.error(`File not found: ${filename}`);
      return res.status(404).json({ message: 'File not found' });
    }

    console.log('ABC content updated successfully.');

    res.status(200).json({ message: 'ABC content updated successfully', abcFile });
  } catch (err) {
    console.error('Error updating ABC content:', err);
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


app.post('/catalog', async (req, res) => {
  try {
    const fields = [
      // All your existing fields
      'albums', 'alternativeTitle', 'artist', 'backgroundResources',
      'callNumber', 'composer', 'composerTimePeriod', 'contributor',
      'copyright', 'cosmeticsAndProp', 'country', 'coverImageUrl',
      'creator', 'dateAccessioned', 'dateAvailable', 'dateIssued',
      'dateOfBirth', 'dateOfComposition', 'dateOfCreation', 'dateOfRecording',
      'description', 'digitalCollection', 'edition', 'editor', 'element',
      'ethnicGroup', 'firstPublication', 'format', 'gamutScale', 'genre',
      'historicalContext', 'identifier', 'instrumentation', 'intonation',
      'key', 'language', 'lastModified', 'length', 'librettist', 'lyrics',
      'melodicClassification', 'melodyDescriptions', 'methodOfImplementation',
      'miscNotes', 'movementsSections', 'notation', 'numberInPublication',
      'objectCollections', 'occasionOfPerforming', 'performingSkills', 'permalink',
      'pieceStyle', 'placeOfBirth', 'placeOfOrigin', 'placeOfProsper',
      'placeOfResidence', 'position', 'prevalence', 'publisher',
      'purposeOfCreation', 'recordingPerson', 'region', 'relatedArtists',
      'relatedWork', 'rights', 'sheetMusic', 'sponsor', 'stagePerformance',
      'subject', 'targetAudience', 'temperament', 'timeOfOrigin', 'timeOfProsper',
      'title', 'trackFunction', 'tracks', 'type', 'uri', 'vocalStyle',
      'westernParallel', 'workTitle'
    ];

    // Initialize updateData as empty object
    const updateData = {};

    // Handle the case when a deletion request is made
    if (req.body.deleted === true) {
      // Only set `deleted` to true, don't touch other fields
      updateData.deleted = true;
    } else {
      // Normal metadata update logic
      fields.forEach(field => {
        updateData[field] = req.body[field] || ""; // Set to empty string if undefined
      });
    }

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
