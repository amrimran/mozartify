const mongoose = require("mongoose");

// Schema for defining dynamic form fields
const DynamicFieldSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  label: { 
    type: String, 
    required: true 
  },
  fieldType: { 
    type: String, 
    required: true,
    enum: ['text', 'number', 'date', 'select', 'textarea', 'price', 'image'] 
  },
  required: { 
    type: Boolean, 
    default: false 
  },
  options: [{ 
    label: String, 
    value: String 
  }],
  defaultValue: { 
    type: mongoose.Schema.Types.Mixed 
  },
  validationRules: {
    min: Number,
    max: Number,
    pattern: String,
    message: String
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
    default: 'general' 
  },
  tabIndex: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

DynamicFieldSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const DynamicField = mongoose.model("DynamicField", DynamicFieldSchema);

module.exports = DynamicField;