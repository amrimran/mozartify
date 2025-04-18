import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  AppBar,
  Toolbar,
  Avatar,
  Drawer
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createGlobalStyle } from "styled-components";
import { useNavigate } from "react-router-dom";
import ClerkSidebar from "./ArtsClerkSidebar";

const DRAWER_WIDTH = 225;

// Theme setup
const customTheme = createTheme({
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
  breakpoints: {
    values: {
      xs: 0, // mobile phones
      sm: 600, // tablets
      md: 960, // small laptops
      lg: 1280, // desktops
      xl: 1920, // large screens
    },
  },
});

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

// Styles for consistency with your application
const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'price', label: 'Price' }
];

const defaultTabs = ['Identification', 'Date', 'Additional Info'];

const buttonStyles = {
  fontFamily: 'Montserrat',
  fontWeight: 'bold',
  backgroundColor: '#FFB6C1',
  color: 'white',
  '&:hover': {
    backgroundColor: '#FFA0B3'
  }
};

export default function DynamicFieldManager() {
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery(customTheme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(customTheme.breakpoints.between("sm", "lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Styles object for responsive layout
  const styles = {
    root: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#FFFFFF",
    },
    appBar: {
      display: isLargeScreen ? "none" : "block",
      backgroundColor: "#FFFFFF",
      boxShadow: "none",
      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    },
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
      display: isLargeScreen ? "block" : "none",
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
      },
    },
    mobileDrawer: {
      display: isLargeScreen ? "none" : "block",
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
      },
    },
    mainContent: {
      flexGrow: 1,
      p: { xs: 2, sm: 3 },
      ml: isLargeScreen ? 1 : 0,
      mt: isLargeScreen ? 2 : 8,
      width: "100%",
    },
    title: {
      fontFamily: 'Montserrat',
      fontWeight: 'bold',
      marginBottom: 3
    },
    paper: {
      padding: 3,
      marginBottom: 3
    },
    formControl: {
      width: '100%',
      marginBottom: 2
    },
    deleteButton: {
      fontFamily: 'Montserrat',
      fontWeight: 'bold',
      backgroundColor: '#f44336',
      color: 'white',
      '&:hover': {
        backgroundColor: '#d32f2f'
      }
    },
    tableContainer: {
      marginTop: 3,
      marginBottom: 3
    },
    fieldCard: {
      marginBottom: 2,
      borderLeft: '4px solid #FFB6C1'
    },
    chip: {
      margin: 0.5
    },
    categoryActions: {
      display: 'flex',
      alignItems: 'center',
      ml: 1
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const [fields, setFields] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [selectOptions, setSelectOptions] = useState([{ label: '', value: '' }]);
  const [tabIndex, setTabIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openRemoveCategoryDialog, setOpenRemoveCategoryDialog] = useState(false);
  const [categoryToRemove, setCategoryToRemove] = useState('');
  
  // Form state for creating/editing fields
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    fieldType: 'text',
    required: false,
    category: '',
    tabIndex: 0,
    defaultValue: '',
    displayOrder: 0,
    options: []
  });

  // Fetch all fields
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await axios.get('http://localhost:3001/dynamic-fields');
        setFields(response.data);
        
        // Get unique categories
        const uniqueCategories = [...new Set(response.data.map(field => field.category || '').filter(cat => cat !== ''))];
        setCategories(uniqueCategories);

        // Check if we should set a specific tab based on URL parameter or other logic
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        
        if (tabParam && uniqueCategories.includes(tabParam)) {
          setTabIndex(uniqueCategories.indexOf(tabParam));
        }
      } catch (error) {
        console.error('Error fetching fields:', error);
      }
    };
    
    fetchFields();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddOption = () => {
    setSelectOptions([...selectOptions, { label: '', value: '' }]);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...selectOptions];
    newOptions[index][field] = value;
    setSelectOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    const newOptions = selectOptions.filter((_, i) => i !== index);
    setSelectOptions(newOptions);
  };

  const openNewFieldDialog = () => {
    setEditingField(null);
    setFormData({
      name: '',
      label: '',
      fieldType: 'text',
      required: false,
      category: categories.length > 0 ? categories[tabIndex] : '',
      tabIndex: tabIndex,
      defaultValue: '',
      displayOrder: fields.length,
      options: []
    });
    setSelectOptions([{ label: '', value: '' }]);
    setOpenDialog(true);
  };

  const openEditFieldDialog = (field) => {
    setEditingField(field);
    
    // Find the index of the field's category in the categories array
    const categoryIndex = categories.indexOf(field.category || '');
    
    // If the category exists in our list, set the tab index to that category
    if (categoryIndex !== -1) {
      setTabIndex(categoryIndex);
    }
    
    setFormData({
      ...field,
      category: field.category || (categories.length > 0 ? categories[0] : ''),
      tabIndex: categoryIndex !== -1 ? categoryIndex : field.tabIndex || 0
    });
    
    if (field.options && field.options.length > 0) {
      setSelectOptions(field.options);
    } else {
      setSelectOptions([{ label: '', value: '' }]);
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingField(null);
  };

  const handleSaveField = async () => {
    try {
      // Create a copy of the form data
      const fieldData = {
        ...formData,
        tabIndex: tabIndex // Ensure we're sending the current tab index to the database
      };
      
      // Only include options if field type is select
      if (fieldData.fieldType === 'select') {
        fieldData.options = selectOptions.filter(opt => opt.label.trim() !== '' && opt.value.trim() !== '');
      } else {
        delete fieldData.options;
      }
      
      let response;
      
      if (editingField) {
        // Update existing field
        response = await axios.put(`http://localhost:3001/dynamic-fields/${editingField._id}`, fieldData);
      } else {
        // Create new field
        response = await axios.post('http://localhost:3001/dynamic-fields', fieldData);
      }
      
      // Refresh fields list
      const updatedFieldsResponse = await axios.get('http://localhost:3001/dynamic-fields');
      setFields(updatedFieldsResponse.data);
      
      // Close dialog
      handleCloseDialog();
      
      // If this was a new field, make sure we're on the correct tab for the category
      if (!editingField) {
        const categoryIndex = categories.indexOf(fieldData.category);
        if (categoryIndex !== -1) {
          setTabIndex(categoryIndex);
        }
      }
      
    } catch (error) {
      console.error('Error saving field:', error);
      alert('Error saving field: ' + error.message);
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field? This will remove it from all forms.')) {
      try {
        await axios.delete(`http://localhost:3001/dynamic-fields/${fieldId}`);
        
        // Refresh fields list
        const updatedFieldsResponse = await axios.get('http://localhost:3001/dynamic-fields');
        setFields(updatedFieldsResponse.data);
        
      } catch (error) {
        console.error('Error deleting field:', error);
        alert('Error deleting field: ' + error.message);
      }
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') {
      alert('Category name cannot be empty');
      return;
    }
    
    if (categories.includes(newCategoryName)) {
      alert('Category already exists');
      return;
    }
    
    const newCategories = [...categories, newCategoryName];
    setCategories(newCategories);
    
    // Automatically switch to the new category tab
    setTabIndex(newCategories.length - 1);
    
    setNewCategoryName('');
    setOpenCategoryDialog(false);
  };

  const openRemoveCategoryConfirmation = (category) => {
    setCategoryToRemove(category);
    setOpenRemoveCategoryDialog(true);
  };

  const handleRemoveCategory = async () => {
    if (!categoryToRemove) return;
    
    try {
      // Count fields in this category
      const fieldsInCategory = fields.filter(field => field.category === categoryToRemove);
      
      if (fieldsInCategory.length > 0) {
        // There are fields in this category - we need to handle them
        const confirmed = window.confirm(
          `This category contains ${fieldsInCategory.length} fields. Deleting it will also delete all these fields. Are you sure you want to continue?`
        );
        
        if (!confirmed) {
          setOpenRemoveCategoryDialog(false);
          return;
        }
        
        // Delete all fields in this category
        for (const field of fieldsInCategory) {
          await axios.delete(`http://localhost:3001/dynamic-fields/${field._id}`);
        }
      }
      
      // Remove the category
      const newCategories = categories.filter(cat => cat !== categoryToRemove);
      setCategories(newCategories);
      
      // Set tab index to the first category, if any
      if (newCategories.length > 0) {
        setTabIndex(0);
      }
      
      // Refresh fields list
      const updatedFieldsResponse = await axios.get('http://localhost:3001/dynamic-fields');
      setFields(updatedFieldsResponse.data);
      
      setOpenRemoveCategoryDialog(false);
    } catch (error) {
      console.error('Error removing category:', error);
      alert('Error removing category: ' + error.message);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    
    // Update URL to reflect tab change (optional)
    if (categories[newValue]) {
      const url = new URL(window.location);
      url.searchParams.set('tab', categories[newValue]);
      window.history.pushState({}, '', url);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const currentCategory = categories[tabIndex];
    
    // Only work with fields from the current category
    const categoryFields = fields.filter(field => field.category === currentCategory);
    
    // Create a copy of the filtered fields and perform the reorder
    const reorderedCategoryFields = Array.from(categoryFields);
    const [removed] = reorderedCategoryFields.splice(result.source.index, 1);
    reorderedCategoryFields.splice(result.destination.index, 0, removed);
    
    // Update display order for all fields in this category
    const updatedCategoryFields = reorderedCategoryFields.map((field, index) => ({
      ...field,
      displayOrder: index
    }));
    
    // Update the full fields array with the updated category fields
    const updatedFields = fields.map(field => {
      if (field.category === currentCategory) {
        // Find this field in the updated category fields
        const updatedField = updatedCategoryFields.find(f => f._id === field._id);
        return updatedField || field;
      }
      return field;
    });
    
    // Update state
    setFields(updatedFields);
    
    // Update all fields in this category in the database
    try {
      for (const field of updatedCategoryFields) {
        await axios.put(`http://localhost:3001/dynamic-fields/${field._id}`, {
          ...field,
          displayOrder: field.displayOrder
        });
      }
      
      console.log('Field order updated successfully');
    } catch (error) {
      console.error('Error updating field order:', error);
    }
  };

  // Filter fields by current category/tab and ensure proper sorting by displayOrder
  const filteredFields = categories.length > 0 && tabIndex >= 0 && tabIndex < categories.length
    ? fields.filter(field => 
        field.category === categories[tabIndex]
      ).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : fields.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <ThemeProvider theme={customTheme}>
      <GlobalStyle />
      <Box sx={styles.root}>
        {/* Mobile AppBar */}
        <AppBar position="fixed" sx={styles.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: "#3B3183" }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ color: "#3B3183", fontWeight: "bold" }}
            >
              Manage Fields
            </Typography>

            {/* Mobile user info */}
            {!isLargeScreen && (
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {!isMobile && (
                  <Typography variant="body2" sx={{ color: "#3B3183" }}>
                    {user?.username}
                  </Typography>
                )}
                <Avatar
                  alt={user?.username}
                  src={user?.profile_picture}
                  sx={{ width: 32, height: 32 }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Permanent drawer for large screens */}
        <Drawer variant="permanent" sx={styles.drawer}>
          <ClerkSidebar active="manageField" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <ClerkSidebar active="manageField" />
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={styles.mainContent}>
          {/* Header Section - Desktop */}
          {isLargeScreen && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
                  }}
                >
                  Field Management
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body1">{user?.username}</Typography>
                  <Avatar
                    alt={user?.username}
                    src={user?.profile_picture}
                    sx={{ width: 40, height: 40 }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              </Box>
              <Divider sx={{ mb: 4 }} />
            </>
          )}

          <Paper sx={styles.paper}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Montserrat' }}>
                Field Management
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => setOpenCategoryDialog(true)}
                sx={buttonStyles}
              >
                Add Category
              </Button>
            </Box>
            
            {categories.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Tabs
                  value={tabIndex}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    flexGrow: 1,
                    "& .MuiTab-root": { textTransform: "none" },
                    "& .Mui-selected": { color: "#FFB6C1 !important" },
                    "& .MuiTabs-indicator": { backgroundColor: "#FFB6C1" }
                  }}
                >
                  {categories.map((category, index) => (
                    <Tab key={index} label={category} />
                  ))}
                </Tabs>
                
                {/* Remove category button */}
                {categories.length > 0 && tabIndex >= 0 && (
                  <Box sx={styles.categoryActions}>
                    <Tooltip title="Remove this category">
                      <IconButton 
                        color="error" 
                        onClick={() => openRemoveCategoryConfirmation(categories[tabIndex])}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            )}
            
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={openNewFieldDialog}
                sx={buttonStyles}
                disabled={categories.length === 0}
              >
                Add New Field
              </Button>
              {categories.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
                  Please add a category first
                </Typography>
              )}
            </Box>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="fields-list">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {filteredFields.length === 0 ? (
                      <Typography variant="body1" sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
                        {categories.length > 0 
                          ? "No fields in this category. Add your first field using the button above."
                          : "No fields or categories found. Add a category first, then add fields to it."}
                      </Typography>
                    ) : (
                      filteredFields.map((field, index) => (
                        <Draggable key={field._id} draggableId={field._id} index={index}>
                          {(provided) => (
                            <Card 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={styles.fieldCard}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box {...provided.dragHandleProps} sx={{ mr: 2, color: 'text.secondary' }}>
                                    <DragIcon />
                                  </Box>
                                  
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6">{field.label}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      Field name: {field.name}
                                    </Typography>
                                    
                                    <Box sx={{ mt: 1 }}>
                                      <Chip 
                                        label={fieldTypes.find(type => type.value === field.fieldType)?.label || field.fieldType} 
                                        size="small"
                                        sx={styles.chip}
                                      />
                                      {field.required && (
                                        <Chip label="Required" size="small" color="error" sx={styles.chip} />
                                      )}
                                      <Chip 
                                        label={field.category || 'Identification'} 
                                        size="small" 
                                        color="primary"
                                        sx={styles.chip}
                                      />
                                    </Box>
                                  </Box>
                                  
                                  <Box>
                                    <IconButton onClick={() => openEditFieldDialog(field)} color="primary">
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteField(field._id)} color="error">
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
        </Box>

        {/* Add/Edit Field Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingField ? `Edit Field: ${editingField.label}` : 'Add New Field'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Field Name (internal ID)"
                  variant="outlined"
                  fullWidth
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  helperText="Use alphanumeric characters and underscores only (e.g., 'item_price')"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="label"
                  label="Field Label (displayed to user)"
                  variant="outlined"
                  fullWidth
                  value={formData.label}
                  onChange={handleInputChange}
                  required
                  helperText="This is what users will see as the field label"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="field-type-label">Field Type</InputLabel>
                  <Select
                    labelId="field-type-label"
                    name="fieldType"
                    value={formData.fieldType}
                    onChange={handleInputChange}
                    label="Field Type"
                  >
                    {fieldTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category (Tab)</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category (Tab)"
                  >
                    {categories.map((category, index) => (
                      <MenuItem key={index} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="displayOrder"
                  label="Display Order"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  helperText="Lower numbers appear first"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.required}
                      onChange={handleInputChange}
                      name="required"
                      color="primary"
                    />
                  }
                  label="Required Field"
                />
              </Grid>
              
              {formData.fieldType !== 'select' && (
                <Grid item xs={12}>
                  <TextField
                    name="defaultValue"
                    label="Default Value (optional)"
                    variant="outlined"
                    fullWidth
                    value={formData.defaultValue || ''}
                    onChange={handleInputChange}
                    helperText="Pre-filled value when creating new entries"
                  />
                </Grid>
              )}
              
              {formData.fieldType === 'select' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Dropdown Options
                  </Typography>
                  {selectOptions.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', mb: 2, gap: 2 }}>
                      <TextField
                        label="Option Label"
                        value={option.label}
                        onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Option Value"
                        value={option.value}
                        onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                        fullWidth
                      />
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveOption(index)}
                        disabled={selectOptions.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />} 
                    onClick={handleAddOption}
                    sx={{ mt: 1 }}
                  >
                    Add Option
                  </Button>
                </Grid>
              )}
              
              {(formData.fieldType === 'number' || formData.fieldType === 'price') && (
                <Grid item xs={12} container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="validationRules.min"
                      label="Minimum Value"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={formData.validationRules?.min || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          validationRules: {
                            ...formData.validationRules,
                            min: e.target.value
                          }
                        });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="validationRules.max"
                      label="Maximum Value"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={formData.validationRules?.max || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          validationRules: {
                            ...formData.validationRules,
                            max: e.target.value
                          }
                        });
                      }}
                    />
                  </Grid>
                </Grid>
              )}
              
              {formData.fieldType === 'text' && (
                <Grid item xs={12}>
                  <TextField
                    name="validationRules.pattern"
                    label="Validation Pattern (RegEx)"
                    variant="outlined"
                    fullWidth
                    value={formData.validationRules?.pattern || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        validationRules: {
                          ...formData.validationRules,
                          pattern: e.target.value
                        }
                      });
                    }}
                    helperText="Optional regular expression pattern for validation"
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSaveField} 
              variant="contained" 
              sx={buttonStyles}
              disabled={!formData.name || !formData.label}
            >
              {editingField ? 'Update Field' : 'Create Field'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Add Category Dialog */}
        <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              variant="outlined"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddCategory} 
              variant="contained" 
              sx={buttonStyles}
              disabled={!newCategoryName.trim()}
            >
              Add Category
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove Category Dialog */}
        <Dialog open={openRemoveCategoryDialog} onClose={() => setOpenRemoveCategoryDialog(false)}>
          <DialogTitle>Remove Category</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Are you sure you want to remove the category "{categoryToRemove}"?
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              Warning: This will also delete all fields assigned to this category.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRemoveCategoryDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleRemoveCategory} 
              variant="contained" 
              sx={styles.deleteButton}
            >
              Remove Category
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}