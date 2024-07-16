const { MongoClient } = require('mongodb');

async function removeField() {
  const uri = "mongodb://localhost:27017"; // Replace with your MongoDB connection string
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('mozartify'); // Replace with your database name
    const collection = database.collection('musicscores'); // Replace with your collection name

    const updateResult = await collection.updateMany(
      {},
      { $unset: { mss_cover_image: "" } } // Replace with the attribute you want to remove
    );

    console.log('Documents updated:', updateResult.modifiedCount);
  } finally {
    await client.close();
  }
}

removeField().catch(console.error);
