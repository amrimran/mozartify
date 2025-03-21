// models/FormSchema.js
const mongoose = require('mongoose');

// Schema to store field configuration
const fieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
    trim: true
  },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'number', 'date', 'select', 'multiSelect', 'checkbox', 'radio', 'textarea', 'file', 'imageUpload', 'audioUpload'],
    default: 'text'
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  tabIndex: {
    type: Number,
    required: true,
    min: 0
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  helpText: {
    type: String,
    trim: true
  },
  placeholder: {
    type: String,
    trim: true
  },
  defaultValue: mongoose.Schema.Types.Mixed,
  validations: {
    minLength: Number,
    maxLength: Number,
    pattern: String,
    min: Number,
    max: Number
  },
  options: [{ 
    label: String, 
    value: String 
  }], // For select, multiSelect, radio, checkbox types
  isAiPredicted: {
    type: Boolean,
    default: false
  }, // For fields with AI predictions like emotion, genre, instrumentation
  aiEndpoint: {
    type: String,
    trim: true
  }, // For fields with AI predictions, the API endpoint to call
  style: {
    width: String,
    height: String
  },
  dependsOn: {
    field: String,
    value: String
  } // For conditional display logic
});

// Schema to store tab configuration
const tabSchema = new mongoose.Schema({
  tabIndex: {
    type: Number,
    required: true,
    unique: true,
    min: 0
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  shortLabel: {
    type: String,
    trim: true
  }, // For mobile display
  isVisible: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true
  }
});

// Main form configuration schema
const formConfigSchema = new mongoose.Schema({
  formId: {
    type: String,
    required: true,
    default: 'catalogMetadata',
    unique: true
  },
  version: {
    type: Number,
    default: 1
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String
  },
  fields: [fieldSchema],
  tabs: [tabSchema],
  global: {
    submitButtonText: {
      type: String,
      default: 'Save Metadata'
    },
    requireFileUpload: {
      type: Boolean,
      default: true
    },
    formTitle: {
      type: String,
      default: 'Catalog Metadata'
    },
    successMessage: {
      type: String,
      default: 'Data saved successfully.'
    }
  }
}, { timestamps: true });

// Add index for faster queries
formConfigSchema.index({ formId: 1, version: -1 });

// Find latest version method
formConfigSchema.statics.findLatestVersion = function(formId) {
  return this.findOne({ formId })
    .sort({ version: -1 })
    .exec();
};

// Create initial schema method
formConfigSchema.statics.createInitialSchema = async function(initialConfig) {
  const exists = await this.findOne({ formId: 'catalogMetadata' });
  if (!exists) {
    return this.create(initialConfig);
  }
  return exists;
};

const FormConfig = mongoose.model('FormConfig', formConfigSchema);

module.exports = FormConfig;