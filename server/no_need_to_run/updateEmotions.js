const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

// MongoDB URI and Database Name
const uri = process.env.DB_URI;
const client = new MongoClient(uri);
const dbName = "mozartify";

// Emotion mappings
const emotionsByComposer = {
  Beethoven: ["Energetic", "Melancholic", "Joyful"],
  Mozart: ["Happy", "Peaceful", "Joyful"],
  Chopin: ["Sad", "Calm", "Melancholic"],
  Bach: ["Calm", "Peaceful", "Joyful"],
  "Miles Davis": ["Relaxed", "Energetic", "Calm"],
  "John Coltrane": ["Energetic", "Peaceful", "Calm"],
  "John Lennon": ["Happy", "Energetic", "Angry"],
  "Elvis Presley": ["Energetic", "Joyful", "Relaxed"],
  "Bob Marley": ["Peaceful", "Happy", "Calm"],
  "Daft Punk": ["Energetic", "Happy", "Joyful"],
  "Johnny Cash": ["Sad", "Melancholic", "Relaxed"],
  Pachelbel: ["Calm", "Peaceful", "Melancholic"],
  Vivaldi: ["Energetic", "Joyful", "Calm"],
  Debussy: ["Melancholic", "Calm", "Peaceful"],
  Gershwin: ["Energetic", "Joyful", "Relaxed"],
  Holst: ["Energetic", "Powerful", "Majestic"],
  "Scott Joplin": ["Happy", "Energetic", "Joyful"],
  "Erik Satie": ["Calm", "Melancholic", "Peaceful"],
  Tchaikovsky: ["Energetic", "Melancholic", "Powerful"],
  "Rimsky-Korsakov": ["Majestic", "Energetic", "Joyful"],
  Liszt: ["Energetic", "Powerful", "Melancholic"],
  Ravel: ["Calm", "Joyful", "Peaceful"],
};

// Randomly select an emotion based on the composer
function getRandomEmotion(composer) {
  const emotions = emotionsByComposer[composer];
  if (emotions) {
    return emotions[Math.floor(Math.random() * emotions.length)];
  }
  return null; // If composer is not found
}

// Update the ms_emotion field in the database
async function updateEmotions() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("musicscores");

    const cursor = collection.find({});
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const composer = doc.ms_composer;

      if (composer in emotionsByComposer) {
        const randomEmotion = getRandomEmotion(composer);
        if (randomEmotion) {
          await collection.updateOne(
            { _id: doc._id },
            { $set: { ms_emotion: randomEmotion } }
          );
          console.log(`Updated ${composer} with emotion: ${randomEmotion}`);
        }
      }
    }
    console.log("Finished updating emotions.");
  } catch (error) {
    console.error("Error updating emotions:", error);
  } finally {
    await client.close();
  }
}

// Run the update function
updateEmotions();
