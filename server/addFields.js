require("dotenv").config();
const mongoose = require("mongoose");

// MongoDB connection URI from your .env file
const DB_URI = process.env.DB_URI;

// Connect to MongoDB
mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Feedback schema
const feedbackSchema = new mongoose.Schema({}, { strict: false });
const Feedback = mongoose.model("Feedback", feedbackSchema);

// Update all documents in the Feedback collection
const updateFeedbackFields = async () => {
  try {
    const result = await Feedback.updateMany(
      {},
      {
        $set: {
          feedbackDate: new Date(), // Set feedbackDate to current date
          replyMessage: null,      // Set replyMessage to null
          replyDate: null,         // Set replyDate to null
        },
      }
    );

    console.log(`Updated ${result.nModified} documents`);
  } catch (error) {
    console.error("Error updating documents:", error);
  } finally {
    mongoose.connection.close(); // Close the connection
  }
};

// Execute the update function
updateFeedbackFields();
