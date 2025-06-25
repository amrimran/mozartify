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
const DeletedArtwork = require("./models/DeletedArts");
const ArtsDynamicField = require("./models/ArtsDynamicField");
const ArtsTab = require("./models/ArtsTab");
const MusicDynamicField = require("./models/MusicDynamicField");
const MusicTab = require("./models/MusicTab");

const app = express();
app.use(express.json());

// ================== ENVIRONMENT CONFIG ==================
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = isProduction
  ? process.env.FRONTEND_PROD_URL
  : process.env.FRONTEND_DEV_URL;
const backendUrl = isProduction
  ? process.env.BACKEND_PROD_URL
  : process.env.BACKEND_DEV_URL;

const allowedOrigins = [
  frontendUrl,
  backendUrl,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// ================== FASTAPI ENDPOINT CONFIG ==================
const FASTAPI_BASE_URL = isProduction ? 
  'https://api.nasir-um.com' : 
  'http://127.0.0.1';

const fastApiEndpoints = {
  emotion: `${FASTAPI_BASE_URL}:5173/predict-emotion`,
  gender: `${FASTAPI_BASE_URL}:9000/predict-gender`,
  genre: `${FASTAPI_BASE_URL}:8001/predict-genre`,
  instrument: `${FASTAPI_BASE_URL}:8000/predict-instrument`
};

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
        return res.status(500).json({
          message: "Error processing file with Audiveris",
          error: error.message,
        });
      }

      const xml2abcPath = path.resolve(__dirname, "node_modules/.bin/xml2abc");
      const xml2abcCommand = `"${xml2abcPath}" -o ${outputDir} ${mxlFilePath}`;

      exec(xml2abcCommand, (xml2abcError) => {
        if (xml2abcError) {
          return res.status(500).json({
            message: "Error converting .xml to .abc with xml2abc-js",
            error: xml2abcError.message,
          });
        }

        fs.readFile(abcFilePath, "utf8", async (readError, data) => {
          if (readError) {
            return res.status(500).json({
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
            res.status(500).json({
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
    return res.status(400).send("No file URL provided.");
  }

  try {
    const response = await axios.post(fastApiEndpoints.emotion, { fileUrl });
    res.json(response.data);
  } catch (error) {
    console.error("Error predicting emotion:", error);
    res.status(500).send("Error predicting emotion");
  }
});

// Gender prediction
app.post("/predictGender", async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).send("No file URL provided.");
  }

  try {
    const response = await axios.post(fastApiEndpoints.gender, { fileUrl });
    res.json({ gender: response.data.gender });
  } catch (error) {
    console.error("Error predicting gender:", error);
    res.status(500).send("Error predicting gender");
  }
});

// Endpoint to handle genre prediction request based on Firebase URL
app.post("/predictGenre", async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).send("No file URL provided.");
  }

  try {
    const response = await axios.post(fastApiEndpoints.genre, { fileUrl });
    res.json({ genre: response.data.genre });
  } catch (error) {
    console.error("Error predicting genre:", error);
    res.status(500).send("Error predicting genre");
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

// Save catalog metadata with strict:false approach
app.post("/catalog", async (req, res) => {
  try {
    // Get the filename from the request body
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ message: "Filename is required" });
    }

    // Use the entire request body as the update data
    const abcFile = await ABCFileModel.findOneAndUpdate(
      { filename },
      req.body,
      { new: true, strict: false }
    );

    if (!abcFile) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json({ message: "Metadata saved successfully" });
  } catch (err) {
    console.error("Error saving metadata:", err);
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
app.post("/catalogArts", async (req, res) => {
  try {
    // Extract basic and dynamic fields from request body
    const { _id, imageUrl, ...allFields } = req.body;

    // If _id is provided, update existing artwork
    if (_id) {
      const updateData = { ...allFields };

      // Only include imageUrl in the update if it's provided (not empty)
      if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl;
      }

      const artwork = await Artwork.findByIdAndUpdate(_id, updateData, {
        new: true,
      });

      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }

      return res.status(200).json(artwork);
    }

    // If no _id, create new artwork with all fields directly
    const artwork = new Artwork({
      ...allFields,
      imageUrl,
      dateUploaded: new Date(),
    });

    await artwork.save();
    res.status(201).json(artwork);
  } catch (err) {
    console.error("Error in /catalogArts:", err);
    res
      .status(500)
      .json({ message: "Error processing artwork", error: err.message });
  }
});

// Get artwork by ID
app.get("/catalogArts/:id", async (req, res) => {
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
      return res.status(404).json({ message: "Artwork not found" });
    }

    res.status(200).json(artwork);
  } catch (err) {
    console.error("Error fetching artwork:", err);
    res
      .status(500)
      .json({ message: "Error fetching artwork", error: err.message });
  }
});

// Get all artworks
app.get("/catalogArts", async (req, res) => {
  try {
    const artworks = await Artwork.find({ deleted: { $ne: true } });
    res.status(200).json(artworks);
  } catch (err) {
    console.error("Error fetching artworks:", err);
    res
      .status(500)
      .json({ message: "Error fetching artworks", error: err.message });
  }
});

// Delete artwork
app.delete("/catalogArts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    // Move to deleted collection
    const deletedArtwork = new DeletedArtwork({
      ...artwork.toObject(),
      deletedAt: new Date(),
    });
    await deletedArtwork.save();

    // Remove from active collection
    await Artwork.findByIdAndDelete(id);

    res.status(200).json({ message: "Artwork deleted successfully" });
  } catch (err) {
    console.error("Error deleting artwork:", err);
    res
      .status(500)
      .json({ message: "Error deleting artwork", error: err.message });
  }
});

// ARTS DYNAMIC FIELD ENDPOINTS

// GET all dynamic fields
app.get("/dynamic-fields", async (req, res) => {
  try {
    const fields = await ArtsDynamicField.find({ isActive: true }).sort({
      displayOrder: 1,
    });
    res.status(200).json(fields);
  } catch (err) {
    console.error("Error fetching dynamic fields:", err);
    res
      .status(500)
      .json({ message: "Error fetching dynamic fields", error: err.message });
  }
});

// GET a specific dynamic field by ID
app.get("/dynamic-fields/:id", async (req, res) => {
  try {
    const field = await ArtsDynamicField.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ message: "Dynamic field not found" });
    }
    res.status(200).json(field);
  } catch (err) {
    console.error("Error fetching dynamic field:", err);
    res
      .status(500)
      .json({ message: "Error fetching dynamic field", error: err.message });
  }
});

// CREATE a new dynamic field
app.post("/dynamic-fields", async (req, res) => {
  try {
    const newField = new ArtsDynamicField(req.body);
    const savedField = await newField.save();
    res.status(201).json(savedField);
  } catch (err) {
    console.error("Error creating dynamic field:", err);
    res
      .status(500)
      .json({ message: "Error creating dynamic field", error: err.message });
  }
});

// UPDATE a dynamic field
app.put("/dynamic-fields/:id", async (req, res) => {
  try {
    const updatedField = await ArtsDynamicField.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedField) {
      return res.status(404).json({ message: "Dynamic field not found" });
    }
    res.status(200).json(updatedField);
  } catch (err) {
    console.error("Error updating dynamic field:", err);
    res
      .status(500)
      .json({ message: "Error updating dynamic field", error: err.message });
  }
});

// DELETE a dynamic field (soft delete by setting isActive to false)
app.delete("/dynamic-fields/:id", async (req, res) => {
  try {
    const field = await ArtsDynamicField.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!field) {
      return res.status(404).json({ message: "Dynamic field not found" });
    }
    res.status(200).json({ message: "Dynamic field deactivated successfully" });
  } catch (err) {
    console.error("Error deactivating dynamic field:", err);
    res
      .status(500)
      .json({
        message: "Error deactivating dynamic field",
        error: err.message,
      });
  }
});

// GET all dynamic fields organized by tab
app.get("/dynamic-fields/by-tab", async (req, res) => {
  try {
    const fields = await ArtsDynamicField.find({ isActive: true }).sort({
      tabId: 1,
      displayOrder: 1,
    });

    // Group fields by tabId
    const fieldsByTab = fields.reduce((acc, field) => {
      const tabId = field.tabId || 0;
      if (!acc[tabId]) {
        acc[tabId] = [];
      }
      acc[tabId].push(field);
      return acc;
    }, {});

    res.status(200).json(fieldsByTab);
  } catch (err) {
    console.error("Error fetching fields by tab:", err);
    res
      .status(500)
      .json({ message: "Error fetching fields by tab", error: err.message });
  }
});

// ========== ARTS TAB ENDPOINTS ==========

// Get all tabs
app.get("/arts-tabs", async (req, res) => {
  try {
    const tabs = await ArtsTab.find({}).sort({ displayOrder: 1 });
    res.status(200).json(tabs);
  } catch (err) {
    console.error("Error fetching arts tabs:", err);
    res
      .status(500)
      .json({ message: "Error fetching arts tabs", error: err.message });
  }
});

// Get a specific tab by ID
app.get("/arts-tabs/:id", async (req, res) => {
  try {
    const tab = await ArtsTab.findOne({ tabId: req.params.id });
    if (!tab) {
      return res.status(404).json({ message: "Tab not found" });
    }
    res.status(200).json(tab);
  } catch (err) {
    console.error("Error fetching tab:", err);
    res.status(500).json({ message: "Error fetching tab", error: err.message });
  }
});

// Create a new tab
app.post("/arts-tabs", async (req, res) => {
  try {
    // Find the highest tabId to ensure uniqueness
    const highestTab = await ArtsTab.findOne().sort("-tabId");
    const nextTabId = highestTab ? highestTab.tabId + 1 : 0;

    // Find the highest displayOrder to add the new tab at the end
    const lastTab = await ArtsTab.findOne().sort("-displayOrder");
    const nextDisplayOrder = lastTab ? lastTab.displayOrder + 1 : 0;

    const newTab = new ArtsTab({
      ...req.body,
      tabId: nextTabId,
      displayOrder: nextDisplayOrder,
    });

    const savedTab = await newTab.save();
    res.status(201).json(savedTab);
  } catch (err) {
    console.error("Error creating tab:", err);
    res.status(500).json({ message: "Error creating tab", error: err.message });
  }
});

// Update a tab
app.put("/arts-tabs/:id", async (req, res) => {
  try {
    const updatedTab = await ArtsTab.findOneAndUpdate(
      { tabId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTab) {
      return res.status(404).json({ message: "Tab not found" });
    }
    res.status(200).json(updatedTab);
  } catch (err) {
    console.error("Error updating tab:", err);
    res.status(500).json({ message: "Error updating tab", error: err.message });
  }
});

// Delete a tab (only if it has no fields)
app.delete("/arts-tabs/:id", async (req, res) => {
  try {
    // Check if there are any fields in this tab
    const fieldsInTab = await ArtsDynamicField.countDocuments({
      tabId: req.params.id,
    });

    if (fieldsInTab > 0) {
      return res.status(400).json({
        message:
          "Cannot delete tab with fields. Please move or deactivate fields first.",
      });
    }

    const deletedTab = await ArtsTab.findOneAndDelete({ tabId: req.params.id });

    if (!deletedTab) {
      return res.status(404).json({ message: "Tab not found" });
    }

    res.status(200).json({ message: "Tab deleted successfully" });
  } catch (err) {
    console.error("Error deleting tab:", err);
    res.status(500).json({ message: "Error deleting tab", error: err.message });
  }
});

// Update tab order - batch update
app.put("/arts-tabs/reorder", async (req, res) => {
  try {
    const { tabs } = req.body;

    if (!Array.isArray(tabs)) {
      return res
        .status(400)
        .json({ message: "Invalid request format. Expected array of tabs." });
    }

    // Update each tab's display order
    const updatePromises = tabs.map((tab, index) =>
      ArtsTab.findOneAndUpdate(
        { tabId: tab.tabId },
        { displayOrder: index },
        { new: true }
      )
    );

    const updatedTabs = await Promise.all(updatePromises);
    res.status(200).json(updatedTabs);
  } catch (err) {
    console.error("Error reordering tabs:", err);
    res
      .status(500)
      .json({ message: "Error reordering tabs", error: err.message });
  }
});

// Initialize default tabs if none exist
app.post("/arts-tabs/initialize", async (req, res) => {
  try {
    const existingTabs = await ArtsTab.countDocuments();

    if (existingTabs > 0) {
      return res.status(400).json({ message: "Tabs are already initialized" });
    }

    const defaultTabs = [
      { tabId: 0, name: "Identification", displayOrder: 0 },
      { tabId: 1, name: "Date", displayOrder: 1 },
      { tabId: 2, name: "Additional Info", displayOrder: 2 },
      { tabId: 3, name: "Image", displayOrder: 3 },
    ];

    await ArtsTab.insertMany(defaultTabs);

    res.status(201).json({ message: "Default tabs initialized successfully" });
  } catch (err) {
    console.error("Error initializing tabs:", err);
    res
      .status(500)
      .json({ message: "Error initializing tabs", error: err.message });
  }
});

// Update dynamic-fields endpoints to use tabId instead of category
app.get("/dynamic-fields/by-tab/:tabId", async (req, res) => {
  try {
    const fields = await ArtsDynamicField.find({
      tabId: parseInt(req.params.tabId),
      isActive: true,
    }).sort({ displayOrder: 1 });

    res.status(200).json(fields);
  } catch (err) {
    console.error("Error fetching fields by tab:", err);
    res
      .status(500)
      .json({ message: "Error fetching fields by tab", error: err.message });
  }
});

// ========== MUSIC DYNAMIC FIELD ENDPOINTS ==========

// Get all dynamic fields
app.get("/music-dynamic-fields", async (req, res) => {
  try {
    const fields = await MusicDynamicField.find({}).sort({
      tabId: 1,
      displayOrder: 1,
    });
    res.status(200).json(fields);
  } catch (err) {
    console.error("Error fetching music dynamic fields:", err);
    res
      .status(500)
      .json({
        message: "Error fetching music dynamic fields",
        error: err.message,
      });
  }
});

// Get a specific dynamic field by ID
app.get("/music-dynamic-fields/:id", async (req, res) => {
  try {
    const field = await MusicDynamicField.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ message: "Dynamic field not found" });
    }
    res.status(200).json(field);
  } catch (err) {
    console.error("Error fetching dynamic field:", err);
    res
      .status(500)
      .json({ message: "Error fetching dynamic field", error: err.message });
  }
});

// Create a new dynamic field
app.post("/music-dynamic-fields", async (req, res) => {
  try {
    const newField = new MusicDynamicField(req.body);
    const savedField = await newField.save();
    res.status(201).json(savedField);
  } catch (err) {
    console.error("Error creating dynamic field:", err);
    res
      .status(500)
      .json({ message: "Error creating dynamic field", error: err.message });
  }
});

// Update a dynamic field
app.put("/music-dynamic-fields/:id", async (req, res) => {
  try {
    const updatedField = await MusicDynamicField.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedField) {
      return res.status(404).json({ message: "Dynamic field not found" });
    }
    res.status(200).json(updatedField);
  } catch (err) {
    console.error("Error updating dynamic field:", err);
    res
      .status(500)
      .json({ message: "Error updating dynamic field", error: err.message });
  }
});

// Deactivate a dynamic field (soft delete)
app.delete("/music-dynamic-fields/:id", async (req, res) => {
  try {
    const field = await MusicDynamicField.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!field) {
      return res.status(404).json({ message: "Dynamic field not found" });
    }
    res.status(200).json({ message: "Dynamic field deactivated successfully" });
  } catch (err) {
    console.error("Error deactivating dynamic field:", err);
    res
      .status(500)
      .json({
        message: "Error deactivating dynamic field",
        error: err.message,
      });
  }
});

// Get all dynamic fields by tabId
app.get("/music-dynamic-fields/by-tab/:tabId", async (req, res) => {
  try {
    const fields = await MusicDynamicField.find({
      tabId: req.params.tabId,
      isActive: true,
    }).sort({ displayOrder: 1 });

    res.status(200).json(fields);
  } catch (err) {
    console.error("Error fetching fields by tab:", err);
    res
      .status(500)
      .json({ message: "Error fetching fields by tab", error: err.message });
  }
});

// ========== MUSIC TAB ENDPOINTS ==========

// Get all tabs
app.get("/music-tabs", async (req, res) => {
  try {
    const tabs = await MusicTab.find({}).sort({ displayOrder: 1 });
    res.status(200).json(tabs);
  } catch (err) {
    console.error("Error fetching music tabs:", err);
    res
      .status(500)
      .json({ message: "Error fetching music tabs", error: err.message });
  }
});

// Get a specific tab by ID
app.get("/music-tabs/:id", async (req, res) => {
  try {
    const tab = await MusicTab.findOne({ tabId: req.params.id });
    if (!tab) {
      return res.status(404).json({ message: "Tab not found" });
    }
    res.status(200).json(tab);
  } catch (err) {
    console.error("Error fetching tab:", err);
    res.status(500).json({ message: "Error fetching tab", error: err.message });
  }
});

// Create a new tab
app.post("/music-tabs", async (req, res) => {
  try {
    // Find the highest tabId to ensure uniqueness
    const highestTab = await MusicTab.findOne().sort("-tabId");
    const nextTabId = highestTab ? highestTab.tabId + 1 : 0;

    // Find the highest displayOrder to add the new tab at the end
    const lastTab = await MusicTab.findOne().sort("-displayOrder");
    const nextDisplayOrder = lastTab ? lastTab.displayOrder + 1 : 0;

    const newTab = new MusicTab({
      ...req.body,
      tabId: nextTabId,
      displayOrder: nextDisplayOrder,
    });

    const savedTab = await newTab.save();
    res.status(201).json(savedTab);
  } catch (err) {
    console.error("Error creating tab:", err);
    res.status(500).json({ message: "Error creating tab", error: err.message });
  }
});

// Update a tab
app.put("/music-tabs/:id", async (req, res) => {
  try {
    const updatedTab = await MusicTab.findOneAndUpdate(
      { tabId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTab) {
      return res.status(404).json({ message: "Tab not found" });
    }
    res.status(200).json(updatedTab);
  } catch (err) {
    console.error("Error updating tab:", err);
    res.status(500).json({ message: "Error updating tab", error: err.message });
  }
});

// Delete a tab (only if it has no fields)
app.delete("/music-tabs/:id", async (req, res) => {
  try {
    // Check if there are any fields in this tab
    const fieldsInTab = await MusicDynamicField.countDocuments({
      tabId: req.params.id,
    });

    if (fieldsInTab > 0) {
      return res.status(400).json({
        message:
          "Cannot delete tab with fields. Please move or deactivate fields first.",
      });
    }

    const deletedTab = await MusicTab.findOneAndDelete({
      tabId: req.params.id,
    });

    if (!deletedTab) {
      return res.status(404).json({ message: "Tab not found" });
    }

    res.status(200).json({ message: "Tab deleted successfully" });
  } catch (err) {
    console.error("Error deleting tab:", err);
    res.status(500).json({ message: "Error deleting tab", error: err.message });
  }
});

// Update tab order - batch update
app.put("/music-tabs/reorder", async (req, res) => {
  try {
    const { tabs } = req.body;

    if (!Array.isArray(tabs)) {
      return res
        .status(400)
        .json({ message: "Invalid request format. Expected array of tabs." });
    }

    // Update each tab's display order
    const updatePromises = tabs.map((tab, index) =>
      MusicTab.findOneAndUpdate(
        { tabId: tab.tabId },
        { displayOrder: index },
        { new: true }
      )
    );

    const updatedTabs = await Promise.all(updatePromises);
    res.status(200).json(updatedTabs);
  } catch (err) {
    console.error("Error reordering tabs:", err);
    res
      .status(500)
      .json({ message: "Error reordering tabs", error: err.message });
  }
});

// Initialize default tabs if none exist
app.post("/music-tabs/initialize", async (req, res) => {
  try {
    const existingTabs = await MusicTab.countDocuments();

    if (existingTabs > 0) {
      return res.status(400).json({ message: "Tabs are already initialized" });
    }

    const defaultTabs = [
      { tabId: 0, name: "Identification", displayOrder: 0 },
      { tabId: 1, name: "Creators", displayOrder: 1 },
      { tabId: 2, name: "Dates", displayOrder: 2 },
      { tabId: 3, name: "Content", displayOrder: 3 },
      { tabId: 4, name: "Format", displayOrder: 4 },
      { tabId: 5, name: "Rights", displayOrder: 5 },
      { tabId: 6, name: "Geography", displayOrder: 6 },
      { tabId: 7, name: "Performance", displayOrder: 7 },
      { tabId: 8, name: "Related Work", displayOrder: 8 },
    ];

    await MusicTab.insertMany(defaultTabs);

    res.status(201).json({ message: "Default tabs initialized successfully" });
  } catch (err) {
    console.error("Error initializing tabs:", err);
    res
      .status(500)
      .json({ message: "Error initializing tabs", error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running in ${isProduction ? 'production' : 'development'} mode`);
  console.log(`Frontend URL: ${frontendUrl}`);
  console.log(`Backend URL: ${backendUrl}`);
  console.log(`FastAPI Base: ${FASTAPI_BASE_URL}`);
  console.log(`Server is running on port ${PORT}`);
});
