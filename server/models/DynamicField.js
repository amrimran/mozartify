const mongoose = require("mongoose");

const DynamicFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  label: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'number', 'date', 'select', 'textarea', 'boolean']
  },
  required: {
    type: Boolean,
    default: false
  },
  defaultValue: {
    type: String,
    default: ''
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    default: 'General'
  },
  tabIndex: {
    type: Number,
    default: 0
  },
  options: [{
    value: String,
    label: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
  
});

// Update the updatedAt field before saving
DynamicFieldSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const DynamicFieldModel = mongoose.model("DynamicField", DynamicFieldSchema, "dynamicfields");
module.exports = DynamicFieldModel;