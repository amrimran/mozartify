const mongoose = require('mongoose');

const ABCFileSchema = new mongoose.Schema({
  // Identification
  filename: {
    type: String,
  },
  content: {
    type: String,
  },
  title: {
    type: String,
  },
  alternativeTitle: {
    type: String,
  },
  identifier: {
    type: String,
  },
  permalink: {
    type: String,
  },
  uri: {
    type: String,
  },
  coverImageUrl: {
    type: String,
  },
  element: {
    type: String,
  },
  type: {
    type: String,
  },

  // Creators
  artist: {
    type: String,
  },
  albums: {
    type: String,
  },
  composer: {
    type: String,
  },
  composerTimePeriod: {
    type: String,
  },
  contributor: {
    type: String,
  },
  creator: {
    type: String,
  },
  editor: {
    type: String,
  },
  librettist: {
    type: String,
  },
  recordingPerson: {
    type: String,
  },

  // Dates
  dateAccessioned: {
    type: Date,
  },
  dateAvailable: {
    type: Date,
  },
  dateIssued: {
    type: Date,
  },
  dateOfBirth: {
    type: Date,
  },
  dateOfComposition: {
    type: Date,
  },
  dateOfCreation: {
    type: Date,
  },
  dateOfRecording: {
    type: Date,
  },
  lastModified: {
    type: Date,
  },

  // Content
  description: {
    type: String,
  },
  genre: {
    type: String,
  },
  subject: {
    type: String,
  },
  historicalContext: {
    type: String,
  },
  backgroundResources: {
    type: String,
  },
  methodOfImplementation: {
    type: String,
  },
  miscNotes: {
    type: String,
  },
  melodicClassification: {
    type: String,
  },
  melodyDescriptions: {
    type: String,
  },
  lyrics: { // Added missing field
    type: String,
  },
  movementsSections: { // Added missing field
    type: String,
  },

  // Format
  format: {
    type: String,
  },
  edition: {
    type: String,
  },
  length: {
    type: String,
  },
  gamutScale: {
    type: String,
  },
  digitalCollection: {
    type: String,
  },
  notation: {
    type: String,
  },
  cosmeticsAndProp: {
    type: String,
  },

  // Rights
  copyright: {
    type: String,
  },
  rights: {
    type: String,
  },
  sponsor: {
    type: String,
  },
  publisher: {
    type: String,
  },
  firstPublication: {
    type: String,
  },
  callNumber: {
    type: String,
  },
  numberInPublication: {
    type: String,
  },

  // Geography
  placeOfBirth: {
    type: String,
  },
  placeOfOrigin: {
    type: String,
  },
  placeOfResidence: {
    type: String,
  },
  placeOfProsper: {
    type: String,
  },
  region: {
    type: String,
  },
  country: {
    type: String,
  },
  ethnicGroup: {
    type: String,
  },
  targetAudience: {
    type: String,
  },
  language: { // Added missing field
    type: String,
  },

  // Performance
  performingSkills: {
    type: String,
  },
  pieceStyle: {
    type: String,
  },
  occasionOfPerforming: {
    type: String,
  },
  stagePerformance: {
    type: String,
  },
  vocalStyle: {
    type: String,
  },
  trackFunction: {
    type: String,
  },
  tracks: {
    type: String,
  },
  objectCollections: {
    type: String,
  },
  instrumentation: {
    type: String,
  },
  key: {
    type: String,
  },
  intonation: {
    type: String,
  },
  sheetMusic: { // Added missing field
    type: String,
  },

  // Related Work
  relatedArtists: {
    type: String,
  },
  relatedWork: {
    type: String,
  },
  workTitle: {
    type: String,
  },
  temperament: {
    type: String,
  },
  westernParallel: {
    type: String,
  },
  prevalence: {
    type: String,
  },
  purposeOfCreation: {
    type: String,
  },
  position: {
    type: String,
  },
  timeOfOrigin: { // Added missing field
    type: String,
  },
  timeOfProsper: { // Added missing field
    type: String,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  mp3FileUrl: {
    type: String,
  },
  mp3FileName: {
    type: String,
  },
  emotion: {
    type: String,
  },
  gender: {
    type: String,
  },

});

const ABCFile = mongoose.model('ABCFile', ABCFileSchema);

module.exports = ABCFile;
