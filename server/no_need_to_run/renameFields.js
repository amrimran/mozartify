const { MongoClient } = require("mongodb");

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "mozartify";

async function renameFields() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection("musicscores");

    // Rename fields
    const result = await collection.updateMany(
      {},
      {
        $rename: {
          "mss_id": "ms_id",
          "mss_title": "ms_title",
          "mss_content": "ms_content",
          "mss_genre": "ms_genre",
          "mss_composer": "ms_composer",
          "mss_copyright": "ms_copyright",
          "mss_artist": "ms_artist",
          "mss_desc": "ms_desc",
          "mss_historical_context": "ms_historical_context",
          "mss_instrumentation": "ms_instrumentation",
          "mss_key": "ms_key",
          "mss_lyrics": "ms_lyrics",
          "mss_date_published": "ms_date_published",
          "mss_date_uploaded": "ms_date_uploaded",
          "mss_price": "ms_price",
          "mss_audio": "ms_audio"
          
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} documents`);

  } finally {
    // Close the connection
    await client.close();
  }
}

renameFields().catch(console.error);
