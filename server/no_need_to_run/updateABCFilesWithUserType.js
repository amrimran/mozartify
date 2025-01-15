require("dotenv").config();
const mongoose = require("mongoose");

// MongoDB connection URI from your .env file
const DB_URI = process.env.DB_URI;

// Connect to MongoDB
mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define ABCFiles schema
const abcFilesSchema = new mongoose.Schema({}, { strict: false });
const ABCFiles = mongoose.model("ABCFiles", abcFilesSchema);

// Function to get random user type
const getRandomUserType = () => {
  const userTypes = ["Students", "Lecturers", "Freelancers"];
  const randomIndex = Math.floor(Math.random() * userTypes.length);
  return userTypes[randomIndex];
};

// Update all documents in the ABCFiles collection
const updateABCFilesWithUserType = async () => {
  try {
    // Get all documents that don't have a userType field
    const documents = await ABCFiles.find({ userType: { $exists: false } });
    
    let updatedCount = 0;
    
    // Update each document with a random user type
    for (const doc of documents) {
      const result = await ABCFiles.updateOne(
        { _id: doc._id },
        {
          $set: {
            userType: getRandomUserType(),
          },
        }
      );
      
      if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} documents with random user types`);
  } catch (error) {
    console.error("Error updating documents:", error);
  } finally {
    mongoose.connection.close(); // Close the connection
    console.log("MongoDB connection closed");
  }
};

// Execute the update function
updateABCFilesWithUserType();