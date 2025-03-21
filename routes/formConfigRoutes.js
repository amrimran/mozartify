// routes/formConfigRoutes.js
const express = require('express');
const router = express.Router();
const FormConfig = require('../models/FormConfig');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/form-config
 * @desc    Get latest form configuration
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const config = await FormConfig.findLatestVersion('catalogMetadata');
    if (!config) {
      return res.status(404).json({ message: 'Form configuration not found' });
    }
    res.json(config);
  } catch (error) {
    console.error('Error fetching form config:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/form-config/version/:version
 * @desc    Get specific version of form configuration
 * @access  Public
 */
router.get('/version/:version', async (req, res) => {
  try {
    const version = parseInt(req.params.version);
    if (isNaN(version)) {
      return res.status(400).json({ message: 'Invalid version number' });
    }
    
    const config = await FormConfig.findOne({ 
      formId: 'catalogMetadata', 
      version 
    });
    
    if (!config) {
      return res.status(404).json({ message: `Version ${version} not found` });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching form config version:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/form-config/history
 * @desc    Get version history of form configurations
 * @access  Admin
 */
router.get('/history', auth.isAdmin, async (req, res) => {
  try {
    const history = await FormConfig.find({ formId: 'catalogMetadata' })
      .select('version lastUpdated updatedBy')
      .sort({ version: -1 });
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching form config history:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/form-config
 * @desc    Create new version of form configuration
 * @access  Admin
 */
router.post('/', auth.isAdmin, async (req, res) => {
  try {
    // Find the latest version
    const latestConfig = await FormConfig.findLatestVersion('catalogMetadata');
    const newVersion = latestConfig ? latestConfig.version + 1 : 1;
    
    // Create new config with incremented version
    const newConfig = new FormConfig({
      ...req.body,
      formId: 'catalogMetadata',
      version: newVersion,
      lastUpdated: new Date(),
      updatedBy: req.user.username
    });
    
    // Validate the config structure
    if (!newConfig.fields || !Array.isArray(newConfig.fields) || !newConfig.tabs || !Array.isArray(newConfig.tabs)) {
      return res.status(400).json({ message: 'Invalid configuration structure. Fields and tabs must be arrays.' });
    }
    
    await newConfig.save();
    res.status(201).json(newConfig);
  } catch (error) {
    console.error('Error creating form config:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/form-config/clone/:version
 * @desc    Clone a specific version as the new latest version
 * @access  Admin
 */
router.post('/clone/:version', auth.isAdmin, async (req, res) => {
  try {
    const version = parseInt(req.params.version);
    if (isNaN(version)) {
      return res.status(400).json({ message: 'Invalid version number' });
    }
    
    // Find the config to clone
    const configToClone = await FormConfig.findOne({ 
      formId: 'catalogMetadata', 
      version 
    });
    
    if (!configToClone) {
      return res.status(404).json({ message: `Version ${version} not found` });
    }
    
    // Find the latest version number
    const latestConfig = await FormConfig.findLatestVersion('catalogMetadata');
    const newVersion = latestConfig ? latestConfig.version + 1 : 1;
    
    // Create a clone with new version number
    const configData = configToClone.toObject();
    delete configData._id; // Remove MongoDB ID to create a new document
    
    const newConfig = new FormConfig({
      ...configData,
      version: newVersion,
      lastUpdated: new Date(),
      updatedBy: req.user.username
    });
    
    await newConfig.save();
    res.status(201).json(newConfig);
  } catch (error) {
    console.error('Error cloning form config:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/form-config/tabs
 * @desc    Update tabs in the latest version
 * @access  Admin
 */
router.put('/tabs', auth.isAdmin, async (req, res) => {
  try {
    const { tabs } = req.body;
    
    if (!tabs || !Array.isArray(tabs)) {
      return res.status(400).json({ message: 'Invalid tabs data. Tabs must be an array.' });
    }
    
    // Find the latest config
    const latestConfig = await FormConfig.findLatestVersion('catalogMetadata');
    if (!latestConfig) {
      return res.status(404).json({ message: 'Form configuration not found' });
    }
    
    // Create a new version
    const newVersion = latestConfig.version + 1;
    const configData = latestConfig.toObject();
    delete configData._id;
    
    const newConfig = new FormConfig({
      ...configData,
      tabs: tabs,
      version: newVersion,
      lastUpdated: new Date(),
      updatedBy: req.user.username
    });
    
    await newConfig.save();
    res.json(newConfig);
  } catch (error) {
    console.error('Error updating tabs:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/form-config/fields
 * @desc    Update fields in the latest version
 * @access  Admin
 */
router.put('/fields', auth.isAdmin, async (req, res) => {
  try {
    const { fields } = req.body;
    
    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: 'Invalid fields data. Fields must be an array.' });
    }
    
    // Find the latest config
    const latestConfig = await FormConfig.findLatestVersion('catalogMetadata');
    if (!latestConfig) {
      return res.status(404).json({ message: 'Form configuration not found' });
    }
    
    // Create a new version
    const newVersion = latestConfig.version + 1;
    const configData = latestConfig.toObject();
    delete configData._id;
    
    const newConfig = new FormConfig({
      ...configData,
      fields: fields,
      version: newVersion,
      lastUpdated: new Date(),
      updatedBy: req.user.username
    });
    
    await newConfig.save();
    res.json(newConfig);
  } catch (error) {
    console.error('Error updating fields:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/form-config/global
 * @desc    Update global settings in the latest version
 * @access  Admin
 */
router.put('/global', auth.isAdmin, async (req, res) => {
  try {
    const { global } = req.body;
    
    if (!global || typeof global !== 'object') {
      return res.status(400).json({ message: 'Invalid global settings data' });
    }
    
    // Find the latest config
    const latestConfig = await FormConfig.findLatestVersion('catalogMetadata');
    if (!latestConfig) {
      return res.status(404).json({ message: 'Form configuration not found' });
    }
    
    // Create a new version
    const newVersion = latestConfig.version + 1;
    const configData = latestConfig.toObject();
    delete configData._id;
    
    const newConfig = new FormConfig({
      ...configData,
      global: global,
      version: newVersion,
      lastUpdated: new Date(),
      updatedBy: req.user.username
    });
    
    await newConfig.save();
    res.json(newConfig);
  } catch (error) {
    console.error('Error updating global settings:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/form-config/fields
 * @desc    Add a new field
 * @access  Admin
 */
router.post('/fields', auth.isAdmin, async (req, res) => {
  try {
    const field = req.body;
    
    if (!field || !field.fieldName || !field.fieldType || !field.label) {
      return res.status(400).json({ 
        message: 'Invalid field data. Required properties: fieldName, fieldType, label' 
      });
    }
    
    // Check if tabIndex is valid
    if (field.tabIndex === undefined || field.tabIndex === null) {
      return res.status(400).json({ message: 'tabIndex is required' });
    }
    
    // Find the latest config
    const latestConfig = await FormConfig.findLatestVersion('catalogMetadata');
    if (!latestConfig) {
      return res.status(404).json({ message: 'Form configuration not found' });
    }
    
    // Check if field with same name already exists
    const fieldExists = latestConfig.fields.some(f => f.fieldName === field.fieldName);
    if (fieldExists) {
      return res.status(400).json({ message: `Field '${field.fieldName}' already exists` });
    }
    
    // Create a new version with the added field
    const newVersion = latestConfig.version + 1;
    const configData = latestConfig.toObject();
    delete configData._id;
    
    // Determine field order (appended to end of current fields in the same tab by default)
    if (field.order === undefined) {
      const tabFields = latestConfig.fields.filter(f => f.tabIndex === field.tabIndex);
      const maxOrder = tabFields.length > 0 
        ? Math.max(...tabFields.map(f => f.order)) 
        : -1;
      field.order = maxOrder + 1;
    }
    
    const newConfig = new FormConfig({
      ...configData,
      fields: [...configData.fields, field],
      version: newVersion,
      lastUpdated: new Date(),
      updatedBy: req.user.username
    });
    
    await newConfig.save();
    res.status(201).json(newConfig);
  } catch (error) {
    console.error('Error adding field:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/form-config/tabs
 * @desc    Add a new tab
 * @access  Admin
 */
router.post('/tabs', auth.isAdmin, async (req, res) => {
  try {
    const tab = req.body;
    
    if (!tab || tab.tabIndex === undefined || !tab.label) {
      return res.status(400).json({ 
        message: 'Invalid tab data. Required properties: tabIndex, label' 
      });
    }
    
    // Find the latest config
    const latestConfig = await FormConfig.findLatestVersion('catalogMetadata');
    if (!latestConfig) {
      return res.status(404).json({ message: 'Form configuration not found' });
    }
    
    // Check if tab with same index already exists
    const tabExists = latestConfig.tabs.some(t => t.tabIndex === tab.tabIndex);
    if (tabExists) {
      return res.status(400).json({ message: `Tab with index '${tab.tabIndex}' already exists` });
    }
    
    // Create a new version with the added tab
    const newVersion = latestConfig.version + 1;
    const configData = latestConfig.toObject();
    delete configData._id;
    
    // Determine tab order (appended to end by default)
    if (tab.order === undefined) {
      const maxOrder = latestConfig.tabs.length > 0 
        ? Math.max(...latestConfig.tabs.map(t => t.order)) 
        : -1;
      tab.order = maxOrder + 1;
    }
    
    const newConfig = new FormConfig({
      ...configData,
      tabs: [...configData.tabs, tab],
      version: newVersion,
      lastUpdated: new Date(),
      updatedBy: req.user.username
    });
    
    await newConfig.save();
    res.status(201).json(newConfig);
  } catch (error) {
    console.error('Error adding tab:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/form-config/fields/:fieldName
 * @desc    Remove a field
 * @access  Admin
 */
router.delete('/fields/:fieldName', auth.isAdmin, async (req, res) => {
  try {
    const { fieldName } = req.params;
    
    // Find the latest config
    const latestConfig = await FormConfig.findLatestVersion('catalogMetadata');
    if (!latestConfig) {
      return res.status(404).json({ message: 'Form configuration not found' });
    }
    
    // Check if field exists
    const fieldExists = latestConfig.fields.some(f => f.fieldName === fieldName);
    if (!fieldExists) {
      return res.status(404).json({ message: `Field '${fieldName}' not found` });
    }
    
    // Create a new version without the field
    const newVersion = latestConfig.version + 1;
    const configData = latestConfig.toObject();
    delete configData._id;
    
    const newConfig = new FormConfig({
      ...configData,
      fields: configData.fields.filter(f => f.fieldName !== fieldName),
      version: newVersion,
      lastUpdated: new Date(),
      updatedBy: req.user.username
    });
    
    await newConfig.save();
    res.json(newConfig);
  } catch (error) {
    console.error('Error removing field:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/form-config/tabs/:tabIndex
 * @desc    Remove a tab and all its fields
 * @access  Admin
 */
router.delete('/tabs/:tabIndex', auth.isAdmin, async (req, res) => {
  try {
    const tabIndex = parseInt(req.params.tabIndex);
    if (isNaN(tabIndex)) {
      return res.status(400).json({ message: 'Invalid tab index' });
    }
    
    // Find the latest config
    const latestConfig = await FormConfig.findLatestVersion('catalogMetadata');
    if (!latestConfig) {
      return res.status(404).json({ message: 'Form configuration not found' });
    }
    
    // Check if tab exists
    const tabExists = latestConfig.tabs.some(t => t.tabIndex === tabIndex);
    if (!tabExists) {
      return res.status(404).json({ message: `Tab with index '${tabIndex}' not found` });
    }
    
    // Create a new version without the tab and its fields
    const newVersion = latestConfig.version + 1;
    const configData = latestConfig.toObject();
    delete configData._id;
    
    const newConfig = new FormConfig({
      ...configData,
      tabs: configData.tabs.filter(t => t.tabIndex !== tabIndex),
      fields: configData.fields.filter(f => f.tabIndex !== tabIndex),
      version: newVersion,
      lastUpdated: new Date(),
      updatedBy: req.user.username
    });
    
    await newConfig.save();
    res.json(newConfig);
  } catch (error) {
    console.error('Error removing tab:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/form-config/fields/:fieldName
 * @desc    Update a specific field
 * @access  Admin
 */
router.put('/fields/:fieldName', auth.isAdmin, async (req, res) => {
  try {
    const { fieldName } = req.params;
    const updatedField = req.body;
    
    // Find the latest config
    const latestConfig = await FormConfig.findLatestVersion('catalogMetadata');
    if (!latestConfig) {
      return res.status(404).json({ message: 'Form configuration not found' });
    }
    
    // Find index of the field to update
    const fieldIndex = latestConfig.fields.findIndex(f => f.fieldName === fieldName);
    if (fieldIndex === -1) {
      return res.status(404).json({ message: `Field '${fieldName}' not found` });
    }
    
    // Create a new version with the updated field
    const newVersion = latestConfig.version + 1;
    const configData = latestConfig.toObject();
    delete configData._id;
    
    // Update the field with new values
    configData.fields[fieldIndex] = {
      ...configData.fields[fieldIndex],
      ...updatedField,
      fieldName // Ensure field name doesn't change
    };
    
    const newConfig = new FormConfig({
      ...configData,
      version: newVersion,
      lastUpdated: new Date(),
      updatedBy: req.user.username
    });
    
    await newConfig.save();
    res.json(newConfig);
  } catch (error) {
    console.error('Error updating field:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/form-config/tabs/:tabIndex
 * @desc    Update a specific tab
 * @access  Admin
 */
router.put('/tabs/:tabIndex', auth.isAdmin, async (req, res) => {
  try {
    const tabIndex = parseInt(req.params.tabIndex);
    if (isNaN(tabIndex)) {
      return res.status(400).json({ message: 'Invalid tab index' });
    }
    
    const updatedTab = req.body;
    
    // Find the latest config
    const latestConfig = await FormConfig.findLatestVersion('catalogMetadata');
    if (!latestConfig) {
      return res.status(404).json({ message: 'Form configuration not found' });
    }
    
    // Find index of the tab to update
    const tabIdx = latestConfig.tabs.findIndex(t => t.tabIndex === tabIndex);
    if (tabIdx === -1) {
      return res.status(404).json({ message: `Tab with index '${tabIndex}' not found` });
    }
    
    // Create a new version with the updated tab
    const newVersion = latestConfig.version + 1;
    const configData = latestConfig.toObject();
    delete configData._id;
    
    // Update the tab with new values
    configData.tabs[tabIdx] = {
      ...configData.tabs[tabIdx],
      ...updatedTab,
      tabIndex // Ensure tab index doesn't change
    };
    
    const newConfig = new FormConfig({
      ...configData,
      version: newVersion,
      lastUpdated: new Date(),
      updatedBy: req.user.username
    });
    
    await newConfig.save();
    res.json(newConfig);
  } catch (error) {
    console.error('Error updating tab:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/form-config/initialize
 * @desc    Initialize form configuration with default values
 * @access  Admin
 */
router.post('/initialize', auth.isAdmin, async (req, res) => {
  try {
    // Check if configuration already exists
    const existingConfig = await FormConfig.findOne({ formId: 'catalogMetadata' });
    if (existingConfig) {
      return res.status(400).json({ message: 'Form configuration already exists' });
    }
    
    // Create initial configuration based on current form structure
    const initialConfig = {
      formId: 'catalogMetadata',
      version: 1,
      updatedBy: req.user.username,
      tabs: [
        {
          tabIndex: 0,
          label: 'Identification',
          shortLabel: 'ID',
          order: 0,
          isVisible: true
        },
        {
          tabIndex: 1,
          label: 'Creators',
          order: 1,
          isVisible: true
        },
        // Add more tabs from your current form structure
      ],
      fields: [
        {
          fieldName: 'title',
          fieldType: 'text',
          label: 'Title',
          tabIndex: 0,
          order: 0,
          isRequired: true,
          isVisible: true
        },
        {
          fieldName: 'artist',
          fieldType: 'text',
          label: 'Artist',
          tabIndex: 0,
          order: 1,
          isRequired: true,
          isVisible: true
        },
        // Add more fields from your current form structure
      ],
      global: {
        submitButtonText: 'Save Metadata',
        formTitle: 'Catalog Metadata',
        successMessage: 'Data saved successfully.'
      }
    };
    
    const newConfig = new FormConfig(initialConfig);
    await newConfig.save();
    
    res.status(201).json(newConfig);
  } catch (error) {
    console.error('Error initializing form config:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;