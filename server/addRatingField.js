require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.DB_URI; // Your MongoDB connection string from .env
const dbName = "mozartify";
const collectionName = "purchases";

async function addRatingField() {
  let client;

  try {
    client = new MongoClient(uri); // Create a new MongoDB client
    await client.connect(); // Connect to the MongoDB server
    const db = client.db(dbName); // Access the mozartify database
    const collection = db.collection(collectionName); // Access the purchases collection

    // Add the new field `ratingGiven` with a default value of 0
    const updateResult = await collection.updateMany(
      {}, // Match all documents
      { $set: { ratingGiven: 0 } } // Add the field `ratingGiven` with a default value of 0
    );

    console.log(
      `Documents matched: ${updateResult.matchedCount}, Documents updated: ${updateResult.modifiedCount}`
    );
  } catch (err) {
    console.error(`Error: ${err}`);
  } finally {
    if (client) {
      await client.close(); // Close the database connection
    }
  }
}

addRatingField();
