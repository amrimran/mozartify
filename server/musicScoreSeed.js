const mongoose = require('mongoose');
const MusicScore = require('./models/MusicScore');
const User = require('./models/User');

mongoose.connect("mongodb://localhost:27017/mozartify");

const seedDatabase = async () => {
  const userId1 = '6663a93dd0f65edd4857eb95';
  const userId2 = '666425c6199bdc6ac5074e40';

  const musicScores = [
   {}
  ];

  try {
    await MusicScore.insertMany(musicScores);
    console.log('Database seeded with 10 new music scores!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedDatabase();
