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
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

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
                      title: '',
                      composer: '',
                      genre: '',
                      artist: '',
                      instrumentation: ''
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

app.get('/abc-file/:filename', async (req, res) => {
  try {
    const abcFile = await ABCFileModel.findOne({ filename: req.params.filename });
    if (!abcFile) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(200).json({ content: abcFile.content });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching file', error: err.message });
  }
});

app.put('/abc-file/:filename', async (req, res) => {
  try {
    const { title, composer, genre, artist, instrumentation } = req.body;
    const abcFile = await ABCFileModel.findOneAndUpdate(
      { filename: req.params.filename },
      { title, composer, genre, artist, instrumentation },
      { new: true }
    );
    if (!abcFile) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(200).json({ message: 'File updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating file', error: err.message });
  }
});

app.post('/catalog', async (req, res) => {
  try {
    const {
      filename,
      title,
      albums,
      alternativeTitle,
      artist,
      backgroundResources,
      callNumber,
      composer,
      composerTimePeriod,
      contributor,
      copyright,
      cosmeticsAndProp,
      county,
      creator,
      dateAccessioned,
      dateAvailable,
      dateIssued,
      dateOfBirth,
      dateOfCreation,
      dateOfRecording,
      description,
      digitalCollection,
      edition,
      editor,
      ethnicGroup,
      firstPublication,
      format,
      gamutScale,
      genre,
      historicalContext,
      identifier,
      instrumentation,
      intention,
      key,
      language,
      lastModified,
      length,
      librettist,
      lyrics,
      melodicClassification,
      melodyDescriptions,
      methodOfImplementation,
      miscNotes,
      movementsSections,
      notation,
      numberInPublication,
      objectCollections,
      occasionOfPerforming,
      performingSkills,
      permalink,
      pieceStyle,
      placeOfBirth,
      placeOfOrigin,
      placeOfProsper,
      placeOfResidence,
      position,
      prevalence,
      publisher,
      purposeOfCreation,
      recordingPerson,
      region,
      relatedArtists,
      relatedWork,
      rights,
      sheetMusic,
      sponsor,
      stagePerformance,
      subject,
      targetAudience,
      temperament,
      timeOfOrigin,
      timeOfProsper,
      trackFunction,
      tracks,
      type,
      uri,
      vocalStyle,
      westernParallel,
      workTitle,
      yearDateOfComposition,
    } = req.body;

    const abcFile = await ABCFileModel.findOneAndUpdate(
      { filename },
      {
        title,
        albums,
        alternativeTitle,
        artist,
        backgroundResources,
        callNumber,
        composer,
        composerTimePeriod,
        contributor,
        copyright,
        cosmeticsAndProp,
        county,
        creator,
        dateAccessioned,
        dateAvailable,
        dateIssued,
        dateOfBirth,
        dateOfCreation,
        dateOfRecording,
        description,
        digitalCollection,
        edition,
        editor,
        ethnicGroup,
        firstPublication,
        format,
        gamutScale,
        genre,
        historicalContext,
        identifier,
        instrumentation,
        intention,
        key,
        language,
        lastModified,
        length,
        librettist,
        lyrics,
        melodicClassification,
        melodyDescriptions,
        methodOfImplementation,
        miscNotes,
        movementsSections,
        notation,
        numberInPublication,
        objectCollections,
        occasionOfPerforming,
        performingSkills,
        permalink,
        pieceStyle,
        placeOfBirth,
        placeOfOrigin,
        placeOfProsper,
        placeOfResidence,
        position,
        prevalence,
        publisher,
        purposeOfCreation,
        recordingPerson,
        region,
        relatedArtists,
        relatedWork,
        rights,
        sheetMusic,
        sponsor,
        stagePerformance,
        subject,
        targetAudience,
        temperament,
        timeOfOrigin,
        timeOfProsper,
        trackFunction,
        tracks,
        type,
        uri,
        vocalStyle,
        westernParallel,
        workTitle,
        yearDateOfComposition,
      },
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
