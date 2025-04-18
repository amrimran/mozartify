require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const axios = require("axios");
const ABCFileModel = require("./models/ABCFile");
const DeletedABCFile = require("./models/deletedABCFile");
const Artwork = require("./models/Arts.js");
const DeletedArtwork = require('./models/DeletedArts.js');
const DynamicField = require('./models/DynamicFields');


const app = express();
app.use(express.json());

// CORS setup with multiple origins and enhanced configuration
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow your frontend origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow all methods you're using
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true // Allow cookies if you need them
}));

// Static file serving for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Configure file storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const acceptedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (acceptedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed."
        )
      );
    }
  },
});

// Endpoint to upload file, transcribe, convert, and save to MongoDB
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const inputFilePath = path.join(__dirname, "uploads", req.file.filename);
  const outputDir = path.join(
    __dirname,
    "uploads",
    `${path.parse(req.file.filename).name}`
  );
  const mxlFilePath = path.join(
    outputDir,
    `${path.parse(req.file.filename).name}.mxl`
  );
  const abcFilePath = path.join(
    outputDir,
    `${path.parse(req.file.filename).name}.abc`
  );

  fs.mkdir(outputDir, { recursive: true }, (err) => {
    if (err) {
      console.error(`Error creating directory: ${err.message}`);
      return res
        .status(500)
        .json({ message: "Error creating directory", error: err.message });
    }

    console.log(`Running Audiveris on file: ${inputFilePath}`);
    const command = `audiveris -batch -transcribe -export -output ${outputDir} ${inputFilePath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Audiveris: ${error.message}`);
        return res
          .status(500)
          .json({
            message: "Error processing file with Audiveris",
            error: error.message,
          });
      }

      const xml2abcPath = path.resolve(__dirname, "node_modules/.bin/xml2abc");
      const xml2abcCommand = `"${xml2abcPath}" -o ${outputDir} ${mxlFilePath}`;

      exec(xml2abcCommand, (xml2abcError) => {
        if (xml2abcError) {
          return res
            .status(500)
            .json({
              message: "Error converting .xml to .abc with xml2abc-js",
              error: xml2abcError.message,
            });
        }

        fs.readFile(abcFilePath, "utf8", async (readError, data) => {
          if (readError) {
            return res
              .status(500)
              .json({
                message: "Error reading .abc file",
                error: readError.message,
              });
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
              abcFilePath: `/uploads/${path.parse(req.file.filename).name}/${path.parse(req.file.filename).name}.abc`,
              message: "File uploaded and processed successfully",
            });
          } catch (saveError) {
            res
              .status(500)
              .json({
                message: "Error saving .abc file to MongoDB",
                error: saveError.message,
              });
          }
        });
      });
    });
  });
});

// Endpoint to handle emotion prediction request based on Firebase URL
app.post("/predictEmotion", async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    console.error("No file URL provided");
    return res.status(400).send("No file URL provided.");
  }

  try {
    console.log("Sending Firebase file URL to FastAPI server:", fileUrl);
    const response = await axios.post("http://127.0.0.1:5173/predict-emotion", {
      fileUrl,
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error while predicting emotion:", error.message);
    res.status(500).send("Error while predicting emotion");
  }
});

// Endpoint to handle gender prediction request based on Firebase URL
app.post("/predictGender", async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    console.error("No file URL provided");
    return res.status(400).send("No file URL provided.");
  }

  try {
    console.log("Sending Firebase file URL to FastAPI gender server:", fileUrl);
    const genderResponse = await axios.post(
      "http://127.0.0.1:9000/predict-gender",
      { fileUrl }
    );

    // Return the gender prediction
    res.json({ gender: genderResponse.data.gender });
  } catch (error) {
    console.error("Error while predicting gender:", error.message);
    res.status(500).send("Error while predicting gender");
  }
});

// Endpoint to handle genre prediction request based on Firebase URL
app.post("/predictGenre", async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    console.error("No file URL provided");
    return res.status(400).send("No file URL provided.");
  }

  try {
    console.log("Sending Firebase file URL to FastAPI genre server:", fileUrl);
    const genreResponse = await axios.post(
      "http://127.0.0.1:8001/predict-genre",
      { fileUrl }
    );

    // Return the genre prediction
    res.json({ genre: genreResponse.data.genre });
  } catch (error) {
    console.error("Error while predicting genre:", error.message);
    res.status(500).send("Error while predicting genre");
  }
});

// // Endpoint for instrument prediction from URL
// app.post('/predictInstrument', async (req, res) => {
//   const { fileUrl } = req.body;
//   if (!fileUrl) {
//     return res.status(400).json({ message: 'No file URL provided.' });
//   }

//   try {
//     // Forward the file URL to FastAPI for instrument prediction
//     const genderResponse = await axios.post('http://127.0.0.1:8000/predict-instrument', { fileUrl });

//     // Return the response from FastAPI (list of top instruments) to the frontend
//     res.json({
//       instrumentation: response.data.top_instruments,
//     });

//   } catch (error) {
//     console.error('Error predicting instrument:', error);
//     res.status(500).json({ message: 'Error predicting instrument', error: error.message });
//   }
// });

// Additional endpoints
app.get("/abc-file", async (req, res) => {
  try {
    const { sortOrder = "desc", sortBy = "_id" } = req.query;
    const mongoSortOrder = sortOrder === "asc" ? 1 : -1;

    const abcFiles = await ABCFileModel.find({ deleted: false }).sort({
      [sortBy]: mongoSortOrder,
    });

    res.status(200).json(abcFiles);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching files", error: err.message });
  }
});

app.get("/abc-file/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    let abcFile;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      abcFile = await ABCFileModel.findById(identifier);
    } else {
      abcFile = await ABCFileModel.findOne({ filename: identifier });
    }

    if (!abcFile) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json(abcFile);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching file", error: err.message });
  }
});

app.put("/abc-file/:filename/content", async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;

    const abcFile = await ABCFileModel.findOneAndUpdate(
      { filename },
      { content },
      { new: true }
    );

    if (!abcFile) {
      return res.status(404).json({ message: "File not found" });
    }

    res
      .status(200)
      .json({ message: "ABC content updated successfully", abcFile });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating ABC content", error: err.message });
  }
});

// Endpoint to get catalog data by filename
app.get("/catalog/:fileName", async (req, res) => {
  try {
    const catalogData = await ABCFileModel.findOne({
      filename: req.params.fileName,
    });
    if (!catalogData) {
      return res.status(404).json({ message: "File not found" });
    }
    res.status(200).json(catalogData);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching catalog data", error: err.message });
  }
});

// Save catalog metadata
app.post("/catalog", async (req, res) => {
  try {
    const fields = [
      "albums",
      "alternativeTitle",
      "artist",
      "backgroundResources",
      "callNumber",
      "composer",
      "composerTimePeriod",
      "contributor",
      "copyright",
      "cosmeticsAndProp",
      "country",
      "coverImageUrl",
      "creator",
      "dateAccessioned",
      "dateAvailable",
      "dateIssued",
      "dateOfBirth",
      "dateOfComposition",
      "dateOfCreation",
      "dateOfRecording",
      "description",
      "digitalCollection",
      "edition",
      "editor",
      "element",
      "ethnicGroup",
      "firstPublication",
      "format",
      "gamutScale",
      "genre",
      "historicalContext",
      "identifier",
      "instrumentation",
      "intonation",
      "key",
      "language",
      "lastModified",
      "length",
      "librettist",
      "lyrics",
      "melodicClassification",
      "melodyDescriptions",
      "methodOfImplementation",
      "miscNotes",
      "movementsSections",
      "mp3FileUrl",
      "mp3FileName",
      "notation",
      "numberInPublication",
      "objectCollections",
      "occasionOfPerforming",
      "performingSkills",
      "permalink",
      "pieceStyle",
      "placeOfBirth",
      "placeOfOrigin",
      "placeOfProsper",
      "placeOfResidence",
      "position",
      "prevalence",
      "publisher",
      "purposeOfCreation",
      "recordingPerson",
      "region",
      "relatedArtists",
      "relatedWork",
      "rights",
      "sheetMusic",
      "sponsor",
      "stagePerformance",
      "subject",
      "targetAudience",
      "temperament",
      "timeOfOrigin",
      "timeOfProsper",
      "title",
      "trackFunction",
      "tracks",
      "type",
      "uri",
      "vocalStyle",
      "westernParallel",
      "workTitle",
      "emotion",
      "gender",
      "price",
      "collection",
      "dateUploaded",
    ];

    const updateData = {};
    if (req.body.deleted === true) {
      // Only set `deleted` to true, don't touch other fields
      updateData.deleted = true;
    } else {
      // Normal metadata update logic
      fields.forEach((field) => {
        updateData[field] = req.body[field] || ""; // Set to empty string if undefined
      });
    }

    const abcFile = await ABCFileModel.findOneAndUpdate(
      { filename: req.body.filename },
      updateData,
      { new: true }
    );

    if (!abcFile) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json({ message: "Metadata saved successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error saving metadata", error: err.message });
  }
});

app.post("/delete-and-transfer-abc-file", async (req, res) => {
  try {
    const { filename } = req.body;

    // Find the original file
    const originalFile = await ABCFileModel.findOne({ filename });

    if (!originalFile) {
      return res.status(404).json({ message: "File not found" });
    }

    // Create a new document in the DeletedABCFile collection
    const deletedFile = new DeletedABCFile({
      ...originalFile.toObject(),
      dateUploaded: originalFile.dateUploaded || new Date(),
      deleted: true,
      downloads: originalFile.downloads || 0,
      downloadEvents: originalFile.downloadEvents || [],
    });

    // Save the file to the deleted collection
    await deletedFile.save();

    // Update the original document to mark it as deleted
    await ABCFileModel.findOneAndDelete({ filename });

    res.status(200).json({
      message: "File successfully transferred to deleted collection",
      deletedFile,
    });
  } catch (err) {
    console.error("Error in delete and transfer:", err);
    res.status(500).json({
      message: "Error transferring file to deleted collection",
      error: err.message,
    });
  }
});

//ARTS ENDPOINTS

// Create a new artwork or update existing one
app.post('/catalogArts', async (req, res) => {
  try {
    // Pull everything from the request body, including dynamicFieldValues
    const { _id, imageUrl, dynamicFieldValues, ...otherFields } = req.body;
    
    // If _id is provided, update existing artwork
    if (_id) {
      // Create update object with dynamicFieldValues and any other fields
      const updateData = { 
        ...otherFields,
        dynamicFieldValues
      };
      
      // Only include imageUrl in the update if it's provided (not empty)
      if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl;
      }

      const artwork = await Artwork.findByIdAndUpdate(
        _id,
        updateData,
        { new: true }
      );

      if (!artwork) {
        return res.status(404).json({ message: 'Artwork not found' });
      }

      return res.status(200).json(artwork);
    }
    
    // If no _id, create new artwork
    const artwork = new Artwork({
      ...otherFields,
      imageUrl,
      dynamicFieldValues
    });

    await artwork.save();
    res.status(201).json(artwork);
  } catch (err) {
    console.error("Error in /catalogArts:", err);
    res.status(500).json({ message: 'Error processing artwork', error: err.message });
  }
});

// Get artwork by ID
app.get('/catalogArts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find by ID if valid ObjectId, otherwise try to find by filename
    let artwork;
    if (mongoose.Types.ObjectId.isValid(id)) {
      artwork = await Artwork.findById(id);
    } else {
      artwork = await Artwork.findOne({ filename: id }); 
    }

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    res.status(200).json(artwork);
  } catch (err) {
    console.error("Error fetching artwork:", err);
    res.status(500).json({ message: 'Error fetching artwork', error: err.message });
  }
});

// Get all artworks
app.get("/catalogArts", async (req, res) => {
  try {
    const artworks = await Artwork.find({ deleted: { $ne: true } });
    res.status(200).json(artworks);
  } catch (err) {
    console.error("Error fetching artworks:", err);
    res.status(500).json({ message: "Error fetching artworks", error: err.message });
  }
});


// Delete artwork
app.delete('/catalogArts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Move to deleted collection
    const deletedArtwork = new DeletedArtwork({
      ...artwork.toObject(),
      deletedAt: new Date(),
    });
    await deletedArtwork.save();

    // Remove from active collection
    await Artwork.findByIdAndDelete(id);

    res.status(200).json({ message: 'Artwork deleted successfully' });
  } catch (err) {
    console.error("Error deleting artwork:", err);
    res.status(500).json({ message: 'Error deleting artwork', error: err.message });
  }
});

//DYNAMIC FIELD ENDPOINTS

// GET all dynamic fields
app.get('/dynamic-fields', async (req, res) => {
  try {
    const fields = await DynamicField.find({ isActive: true }).sort({ displayOrder: 1 });
    res.status(200).json(fields);
  } catch (err) {
    console.error("Error fetching dynamic fields:", err);
    res.status(500).json({ message: 'Error fetching dynamic fields', error: err.message });
  }
});

// GET a specific dynamic field by ID
app.get('/dynamic-fields/:id', async (req, res) => {
  try {
    const field = await DynamicField.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ message: 'Dynamic field not found' });
    }
    res.status(200).json(field);
  } catch (err) {
    console.error("Error fetching dynamic field:", err);
    res.status(500).json({ message: 'Error fetching dynamic field', error: err.message });
  }
});

// CREATE a new dynamic field
app.post('/dynamic-fields', async (req, res) => {
  try {
    const newField = new DynamicField(req.body);
    const savedField = await newField.save();
    res.status(201).json(savedField);
  } catch (err) {
    console.error("Error creating dynamic field:", err);
    res.status(500).json({ message: 'Error creating dynamic field', error: err.message });
  }
});

// UPDATE a dynamic field
app.put('/dynamic-fields/:id', async (req, res) => {
  try {
    const updatedField = await DynamicField.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedField) {
      return res.status(404).json({ message: 'Dynamic field not found' });
    }
    res.status(200).json(updatedField);
  } catch (err) {
    console.error("Error updating dynamic field:", err);
    res.status(500).json({ message: 'Error updating dynamic field', error: err.message });
  }
});

// DELETE a dynamic field (soft delete by setting isActive to false)
app.delete('/dynamic-fields/:id', async (req, res) => {
  try {
    const field = await DynamicField.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!field) {
      return res.status(404).json({ message: 'Dynamic field not found' });
    }
    res.status(200).json({ message: 'Dynamic field deactivated successfully' });
  } catch (err) {
    console.error("Error deactivating dynamic field:", err);
    res.status(500).json({ message: 'Error deactivating dynamic field', error: err.message });
  }
});

// GET all dynamic fields organized by tab
app.get('/dynamic-fields/by-tab', async (req, res) => {
  try {
    const fields = await DynamicField.find({ isActive: true }).sort({ tabIndex: 1, displayOrder: 1 });
    
    // Group fields by tabIndex
    const fieldsByTab = fields.reduce((acc, field) => {
      const tabIndex = field.tabIndex || 0;
      if (!acc[tabIndex]) {
        acc[tabIndex] = [];
      }
      acc[tabIndex].push(field);
      return acc;
    }, {});
    
    res.status(200).json(fieldsByTab);
  } catch (err) {
    console.error("Error fetching fields by tab:", err);
    res.status(500).json({ message: 'Error fetching fields by tab', error: err.message });
  }
});

// Get dynamic field values for an artwork
app.get('/catalogArts/:id/dynamic-fields', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find artwork by ID
    const artwork = await Artwork.findById(id)
      .populate({
        path: 'dynamicFieldValues.fieldId',
        model: 'DynamicField'
      });
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    res.status(200).json(artwork.dynamicFieldValues);
  } catch (err) {
    console.error("Error fetching dynamic field values:", err);
    res.status(500).json({ message: 'Error fetching dynamic field values', error: err.message });
  }
});

// Update dynamic field values for an artwork
app.post('/catalogArts/:id/dynamic-fields', async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldValues } = req.body;
    
    if (!Array.isArray(fieldValues)) {
      return res.status(400).json({ message: 'Field values must be an array' });
    }
    
    // Find artwork by ID
    const artwork = await Artwork.findById(id);
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    // Update dynamic field values
    artwork.dynamicFieldValues = fieldValues;
    
    await artwork.save();
    
    res.status(200).json({ 
      message: 'Dynamic field values updated successfully',
      dynamicFieldValues: artwork.dynamicFieldValues
    });
  } catch (err) {
    console.error("Error updating dynamic field values:", err);
    res.status(500).json({ message: 'Error updating dynamic field values', error: err.message });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});