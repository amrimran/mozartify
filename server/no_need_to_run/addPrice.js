require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.DB_URI;
const dbName = "mozartify";
const collectionName = "abcfiles";

async function addPriceField() {
  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const updateResult = await collection.updateMany(
      {},
      [
        {
          $set: {
            price: {
              $toString: {
                $round: [
                  { $add: [20, { $multiply: [{ $rand: {} }, 30] }] }, // Generate value in range [20, 50)
                  2 // Round to 2 decimal points
                ]
              }
            }
          }
        }
      ]
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

addPriceField();
