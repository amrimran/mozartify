const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "mozartify";
const collectionName = "musicscores";

async function addField() {
  let client;

  try {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const updateResult = await collection.updateMany(
      {},
      { $set: { ms_cover_image: "" } }
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

addField();
