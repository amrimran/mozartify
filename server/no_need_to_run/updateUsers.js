const mongoose = require("mongoose");
const UserModel = require("./models/User"); // Adjust the path to your User model

async function updateExistingUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Update all users to include the new fields
    const result = await UserModel.updateMany(
      {}, // Match all documents
      {
        $set: {
          failedLoginAttempts: 0, // Add default value
          lockUntil: null, // Add default value
          sessionId: null, // Add default value
        },
      }
    );

    console.log(`Updated ${result.nModified} users with new fields`);
    mongoose.connection.close();
  } catch (err) {
    console.error("Error updating users:", err);
  }
}

updateExistingUsers();
