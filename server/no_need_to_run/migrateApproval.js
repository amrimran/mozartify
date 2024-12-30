const { MongoClient } = require("mongodb");

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "mozartify";

async function updateApprovalField() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection("users");

    // Update the approval field
    const result = await collection.updateMany(
      { approval: { $exists: true } }, // Ensure the field exists
      [
        {
          $set: {
            approval: {
              $cond: {
                if: { $eq: ["$approval", true] },
                then: "true",
                else: {
                  $cond: {
                    if: { $eq: ["$approval", false] },
                    then: "false",
                    else: "denied", // Optional default value if needed
                  },
                },
              },
            },
          },
        },
      ]
    );

    console.log(`Updated ${result.modifiedCount} documents`);
  } finally {
    // Close the connection
    await client.close();
  }
}

updateApprovalField().catch(console.error);
