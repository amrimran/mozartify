require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.DB_URI;
const dbName = "mozartify";
const collectionName = "users";

async function addFields() {
  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const updateResult = await collection.updateMany(
      {},
      {
        $set: {
          first_timer: false,
        }
      }
    );

    console.log(`Documents updated: ${updateResult.modifiedCount}`);
  } catch (err) {
    console.error(`Error: ${err}`);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

addFields();

