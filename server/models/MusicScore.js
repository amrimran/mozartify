const mongoose = require('mongoose');

const MusicScoreSchema = new mongoose.Schema({
  mss_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  mss_title: {
    type: String,
    required: true,
  },
  mss_content: {
    type: String,
    required: true,
  },
  mss_genre: {
    type: String,
    required: true,
  },
  mss_composer: {
    type: String,
    required: true,
  },
  mss_copyright: {
    type: String,
    required: true,
  },
  mss_artist: {
    type: String,
    required: true,
  },
  mss_desc: {
    type: String,
    required: true,
  },
  mss_historical_context: {
    type: String,
    required: true,
  },
  mss_instrumentation: {
    type: String,
    required: true,
  },
  mss_key: {
    type: String,
    required: true,
  },
  mss_lyrics: {
    type: String,
    required: true,
  },
  mss_date_published: {
    type: Date,
    required: true,
  },
  mss_date_uploaded: {
    type: Date,
    required: true,
  },
  mss_price: {
    type: Number,
    required: true,
  },
  mss_audio: {
    type: String,
    required: true,
  },
  ownerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});

const MusicScore = mongoose.model('MusicScore', MusicScoreSchema);

module.exports = MusicScore;
