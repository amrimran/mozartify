require("dotenv").config();
const mongoose = require("mongoose");

// MongoDB connection URI from your .env file
const DB_URI = process.env.DB_URI;

// Connect to MongoDB
mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define schema with strict mode disabled
const ABCFileSchema = new mongoose.Schema({}, { strict: false });
const ABCFile = mongoose.model("ABCFile", ABCFileSchema);

// Update all documents in the ABCFile collection to remove fields
const removeFieldsFromABCFile = async () => {
  try {
    const result = await ABCFile.updateMany(
      {},
      {
        $unset: {
          downloads: "", // Field to remove
          downloadEvents: "", // Field to remove
        },
      }
    );

    console.log(`Removed fields from ${result.modifiedCount} documents`);
  } catch (error) {
    console.error("Error removing fields:", error);
  } finally {
    mongoose.connection.close(); // Close the connection
  }
};

// Execute the function
removeFieldsFromABCFile();
