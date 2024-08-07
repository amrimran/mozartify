const mongoose = require('mongoose');

const ABCFileSchema = new mongoose.Schema({
  filename: {
    type: String,
  },
  content: {
    type: String,
  },
  title: {
    type: String,
  },
  albums: {
    type: String,
  },
  alternativeTitle: {
    type: String,
  },
  artist: {
    type: String,
  },
  backgroundResources: {
    type: String,
  },
  callNumber: {
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
  copyright: {
    type: String,
  },
  cosmeticsAndProp: {
    type: String,
  },
  county: {
    type: String,
  },
  creator: {
    type: String,
  },
  dateAccessioned: {
    type: String,
  },
  dateAvailable: {
    type: String,
  },
  dateIssued: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  dateOfCreation: {
    type: String,
  },
  dateOfRecording: {
    type: String,
  },
  description: {
    type: String,
  },
  digitalCollection: {
    type: String,
  },
  edition: {
    type: String,
  },
  editor: {
    type: String,
  },
  ethnicGroup: {
    type: String,
  },
  firstPublication: {
    type: String,
  },
  format: {
    type: String,
  },
  gamutScale: {
    type: String,
  },
  genre: {
    type: String,
  },
  historicalContext: {
    type: String,
  },
  identifier: {
    type: String,
  },
  instrumentation: {
    type: String,
  },
  intention: {
    type: String,
  },
  key: {
    type: String,
  },
  language: {
    type: String,
  },
  lastModified: {
    type: String,
  },
  length: {
    type: String,
  },
  librettist: {
    type: String,
  },
  lyrics: {
    type: String,
  },
  melodicClassification: {
    type: String,
  },
  melodyDescriptions: {
    type: String,
  },
  methodOfImplementation: {
    type: String,
  },
  miscNotes: {
    type: String,
  },
  movementsSections: {
    type: String,
  },
  notation: {
    type: String,
  },
  numberInPublication: {
    type: String,
  },
  objectCollections: {
    type: String,
  },
  occasionOfPerforming: {
    type: String,
  },
  performingSkills: {
    type: String,
  },
  permalink: {
    type: String,
  },
  pieceStyle: {
    type: String,
  },
  placeOfBirth: {
    type: String,
  },
  placeOfOrigin: {
    type: String,
  },
  placeOfProsper: {
    type: String,
  },
  placeOfResidence: {
    type: String,
  },
  position: {
    type: String,
  },
  prevalence: {
    type: String,
  },
  publisher: {
    type: String,
  },
  purposeOfCreation: {
    type: String,
  },
  recordingPerson: {
    type: String,
  },
  region: {
    type: String,
  },
  relatedArtists: {
    type: String,
  },
  relatedWork: {
    type: String,
  },
  rights: {
    type: String,
  },
  sheetMusic: {
    type: String,
  },
  sponsor: {
    type: String,
  },
  stagePerformance: {
    type: String,
  },
  subject: {
    type: String,
  },
  targetAudience: {
    type: String,
  },
  temperament: {
    type: String,
  },
  timeOfOrigin: {
    type: String,
  },
  timeOfProsper: {
    type: String,
  },
  trackFunction: {
    type: String,
  },
  tracks: {
    type: String,
  },
  type: {
    type: String,
  },
  uri: {
    type: String,
  },
  vocalStyle: {
    type: String,
  },
  westernParallel: {
    type: String,
  },
  workTitle: {
    type: String,
  },
  yearDateOfComposition: {
    type: String,
  },
});

const ABCFile = mongoose.model('ABCFile', ABCFileSchema);

module.exports = ABCFile;
