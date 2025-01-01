require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.DB_URI;
const dbName = "mozartify";
const collectionName = "abcfiles";

async function addFields() {
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
            downloads: {
              $toInt: {
                $add: [10, { $floor: { $multiply: [{ $rand: {} }, 91] } }],
              },
            },
          },
        },
        {
          $set: {
            downloadEvents: {
              $map: {
                input: { $range: [0, "$downloads"] },
                as: "index",
                in: {
                  timestamp: {
                    $dateFromParts: {
                      year: {
                        $add: [2024, { $floor: { $divide: [{ $add: ["$$index", 11] }, 12] } }],
                      },
                      month: {
                        $add: [2, { $mod: ["$$index", 12] }],
                      },
                      day: {
                        $add: [1, { $floor: { $multiply: [{ $rand: {} }, 27] } }],
                      },
                      hour: { $mod: [{ $floor: { $multiply: [{ $rand: {} }, 24] } }, 24] },
                      minute: { $mod: [{ $floor: { $multiply: [{ $rand: {} }, 60] } }, 60] },
                      second: { $mod: [{ $floor: { $multiply: [{ $rand: {} }, 60] } }, 60] },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $set: {
            dateUploaded: {
              $dateFromParts: {
                year: {
                  $add: [2024, { $floor: { $divide: [{ $rand: {} }, 12] } }],
                },
                month: {
                  $add: [2, { $mod: [{ $floor: { $multiply: [{ $rand: {} }, 12] } }, 12] }],
                },
                day: {
                  $add: [1, { $floor: { $multiply: [{ $rand: {} }, 27] } }],
                },
                hour: { $mod: [{ $floor: { $multiply: [{ $rand: {} }, 24] } }, 24] },
                minute: { $mod: [{ $floor: { $multiply: [{ $rand: {} }, 60] } }, 60] },
                second: { $mod: [{ $floor: { $multiply: [{ $rand: {} }, 60] } }, 60] },
              },
            },
          },
        },
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

addFields();
