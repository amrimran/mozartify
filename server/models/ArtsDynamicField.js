const mongoose = require('mongoose');

// Define validation rules schema
const validationRuleSchema = new mongoose.Schema({
  min: { type: Number },
  max: { type: Number },
  pattern: { type: String },
  errorMessage: { type: String }
}, { _id: false });

// Define option schema for select fields
const optionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true }
}, { _id: false });

// ArtsDynamicField schema - updated to match MusicDynamicField structure
const DynamicFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'number', 'textarea', 'date', 'select', 'price', 'image'],
    default: 'text'
  },
  tabId: {
    type: Number,
    required: true,
    default: 0
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  required: {
    type: Boolean,
    default: false
  },
  options: {
    type: [optionSchema],
    default: [],
    validate: {
      validator: function(options) {
        // Options are only required for select fields
        return this.fieldType !== 'select' || options.length > 0;
      },
      message: 'Select fields must have at least one option'
    }
  },
  validationRules: {
    type: validationRuleSchema,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a text index for searching
DynamicFieldSchema.index({ name: 'text', label: 'text' });

module.exports = mongoose.model('DynamicField', DynamicFieldSchema);