require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.DB_URI;
const dbName = "mozartify";
const collectionName = "carts";

async function addCollection() {
  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const cartDocuments = [
      {
        user_id: "66a06ee509c9d52ac842087f",
        music_score_ids: ["66642542f38eab64210f9ada", "66642542f38eab64210f9ae0"]
      },
    ];

    const insertResult = await collection.insertMany(cartDocuments);

    console.log(`Documents inserted: ${insertResult.insertedCount}`);
  } catch (err) {
    console.error(`Error: ${err}`);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

addCollection();

