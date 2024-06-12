const mongoose = require('mongoose');

const MusicScoreSchema = new mongoose.Schema({
  ms_title: {
    type: String,
    required: true,
  },
  ms_content: {
    type: String,
    required: true,
  },
  ms_genre: {
    type: String,
    required: true,
  },
  ms_composer: {
    type: String,
    required: true,
  },
  ms_copyright: {
    type: String,
    required: true,
  },
  ms_artist: {
    type: String,
    required: true,
  },
  ms_desc: {
    type: String,
    required: true,
  },
  ms_historical_context: {
    type: String,
    required: true,
  },
  ms_instrumentation: {
    type: String,
    required: true,
  },
  ms_key: {
    type: String,
    required: true,
  },
  ms_lyrics: {
    type: String,
    required: true,
  },
  ms_date_published: {
    type: Date,
    required: true,
  },
  ms_date_uploaded: {
    type: Date,
    required: true,
  },
  ms_price: {
    type: Number,
    required: true,
  },
  ms_audio: {
    type: String,
    required: true,
  },
  ms_cover_image: {
    type: String,
    required: false
  },
  ownerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});

const MusicScore = mongoose.model('MusicScore', MusicScoreSchema);

module.exports = MusicScore;
