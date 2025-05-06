import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  IconButton,
  Divider,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Switch,
  Paper,
  Avatar,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Drawer,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import DynamicField from "./DynamicField";

const DRAWER_WIDTH = 225;

// Theme setup
const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

// Global styles
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

// Field type options
const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Text Area" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "price", label: "Price (RM)" },
];

// Default structure for a new field
const defaultNewField = {
  name: "",
  label: "",
  fieldType: "text",
  required: false,
  tabId: 0,
  displayOrder: 0,
  options: [],
  validationRules: {},
  isActive: true,
};

// Initial tab structure - will be dynamically updated
const initialTabs = [
  { id: 0, name: "Identification" },
  { id: 1, name: "Creators" },
  { id: 2, name: "Dates" },
  { id: 3, name: "Content" },
  { id: 4, name: "Format" },
  { id: 5, name: "Rights" },
  { id: 6, name: "Geography" },
  { id: 7, name: "Performance" },
  { id: 8, name: "Related Work" },
];

// Button styles
const buttonStyles = {
  px: { xs: 2, sm: 4 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
    boxShadow: "none",
  },
};

const secondaryButtonStyles = {
  px: { xs: 2, sm: 4 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#8BD3E6",
  backgroundColor: "#FFFFFF",
  border: "1px solid #8BD3E6",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#E6F8FB",
    color: "#7AB9C4",
    borderColor: "#7AB9C4",
    boxShadow: "none",
  },
};

const deleteButtonStyles = {
  color: "#FFFFFF",
  backgroundColor: "#DB2226",
  border: "1px solid #DB2226",
  "&:hover": {
    backgroundColor: "#B71C1C",
    borderColor: "#B71C1C",
  },
};

export default function MusicDynamicFieldManager() {
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const [fields, setFields] = useState([]);
  const [fieldsByTab, setFieldsByTab] = useState({});
  const [tabs, setTabs] = useState(initialTabs);
  const [currentTab, setCurrentTab] = useState(0);
  const [editingField, setEditingField] = useState(null);
  const [newField, setNewField] = useState({ ...defaultNewField });
  const [openDialog, setOpenDialog] = useState(false);
  const [tabDialogOpen, setTabDialogOpen] = useState(false);
  const [editingTab, setEditingTab] = useState(null);
  const [newTabName, setNewTabName] = useState("");
  const [tabDeleteDialogOpen, setTabDeleteDialogOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [optionsInput, setOptionsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Styles for responsive design
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
      mt: isLargeScreen ? 0 : 8,
      ml: isLargeScreen ? 1 : 0,
      width: isLargeScreen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
    },
    tabContent: {
      mt: 2,
    },
    formCard: {
      mb: 3,
      p: 2,
      borderRadius: 2,
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    },
    fieldListCard: {
      mt: 2,
      mb: 3,
      borderRadius: 2,
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    },
  };

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch all dynamic fields
  const fetchFields = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3001/music-dynamic-fields"
      );
      const fetchedFields = response.data;
      setFields(fetchedFields);

      // Organize fields by tabId
      const groupedFields = fetchedFields.reduce((acc, field) => {
        const tabId = field.tabId || 0;
        if (!acc[tabId]) {
          acc[tabId] = [];
        }
        acc[tabId].push(field);
        return acc;
      }, {});

      setFieldsByTab(groupedFields);
    } catch (error) {
      console.error("Error fetching fields:", error);
      showSnackbar("Failed to load fields", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFields();
  }, []);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Open the field editor dialog
  const handleOpenEditor = (field = null) => {
    if (field) {
      setEditingField(field);
      // Convert field options array to string for the input
      const optionsStr = field.options
        ? field.options.map((opt) => `${opt.value}:${opt.label}`).join("\n")
        : "";
      setOptionsInput(optionsStr);
    } else {
      setEditingField(null);
      setNewField({ ...defaultNewField, tabId: currentTab });
      setOptionsInput("");
    }
    setOpenDialog(true);
  };

  // Close the field editor dialog
  const handleCloseEditor = () => {
    setOpenDialog(false);
    setEditingField(null);
    setNewField({ ...defaultNewField });
    setOptionsInput("");
  };

  // Update field values
  const handleFieldChange = (e) => {
    const { name, value, checked } = e.target;
    const fieldValue =
      name === "required" || name === "isActive" ? checked : value;

    if (editingField) {
      setEditingField((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));
    } else {
      setNewField((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));
    }
  };

  // Parse options from textarea input
  const parseOptions = (optionsText) => {
    if (!optionsText) return [];

    return optionsText
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [value, label] = line.split(":");
        return {
          value: value.trim(),
          label: (label || value).trim(),
        };
      });
  };

  // Save field (create or update)
  const handleSaveField = async () => {
    const fieldToSave = editingField || newField;

    // Validate field data
    if (!fieldToSave.name || !fieldToSave.label) {
      showSnackbar("Name and Label are required", "error");
      return;
    }

    // Parse options if field type is select
    if (fieldToSave.fieldType === "select") {
      fieldToSave.options = parseOptions(optionsInput);
      if (fieldToSave.options.length === 0) {
        showSnackbar("Select field must have at least one option", "error");
        return;
      }
    }

    try {
      setLoading(true);
      let response;

      if (editingField) {
        // Update existing field
        response = await axios.put(
          `http://localhost:3001/music-dynamic-fields/${editingField._id}`,
          fieldToSave
        );
        showSnackbar("Field updated successfully");
      } else {
        // Create new field
        response = await axios.post(
          "http://localhost:3001/music-dynamic-fields",
          fieldToSave
        );
        showSnackbar("Field created successfully");
      }

      fetchFields(); // Refresh the field list
      handleCloseEditor();
    } catch (error) {
      console.error("Error saving field:", error);
      showSnackbar(
        `Failed to ${editingField ? "update" : "create"} field`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Tab management functions
  const handleAddTab = async () => {
    if (!newTabName.trim()) {
      showSnackbar("Tab name cannot be empty", "error");
      return;
    }

    try {
      setLoading(true);

      // Find the next available ID (max + 1)
      const nextId = Math.max(...tabs.map((tab) => tab.id), -1) + 1;

      // In a real application, you would save this to the backend
      // const response = await axios.post("http://localhost:3001/tabs", { name: newTabName });

      // Add new tab to local state
      const newTab = { id: nextId, name: newTabName };
      setTabs([...tabs, newTab]);

      showSnackbar("Tab added successfully");
      setTabDialogOpen(false);
      setNewTabName("");

      // Optionally switch to the new tab
      setCurrentTab(nextId);
    } catch (error) {
      console.error("Error adding tab:", error);
      showSnackbar("Failed to add tab", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTab = async () => {
    if (!editingTab) return;
    if (!newTabName.trim()) {
      showSnackbar("Tab name cannot be empty", "error");
      return;
    }

    try {
      setLoading(true);

      // In a real application, you would save this to the backend
      // await axios.put(`http://localhost:3001/tabs/${editingTab.id}`, { name: newTabName });

      // Update local state
      const updatedTabs = tabs.map((tab) =>
        tab.id === editingTab.id ? { ...tab, name: newTabName } : tab
      );

      setTabs(updatedTabs);
      showSnackbar("Tab updated successfully");
      setTabDialogOpen(false);
    } catch (error) {
      console.error("Error updating tab:", error);
      showSnackbar("Failed to update tab", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTabDelete = (tab) => {
    setTabToDelete(tab);
    setTabDeleteDialogOpen(true);
  };

  const handleConfirmTabDelete = async () => {
    if (!tabToDelete) return;

    try {
      setLoading(true);

      // Check if there are any fields in this tab
      const fieldsInTab = fieldsByTab[tabToDelete.id] || [];
      if (fieldsInTab.length > 0) {
        showSnackbar(
          "Cannot delete tab with fields. Please move or deactivate fields first.",
          "error"
        );
        setTabDeleteDialogOpen(false);
        setTabToDelete(null);
        setLoading(false);
        return;
      }

      // In a real application, you would delete from the backend
      // await axios.delete(`http://localhost:3001/tabs/${tabToDelete.id}`);

      // Remove from local state
      const filteredTabs = tabs.filter((tab) => tab.id !== tabToDelete.id);
      setTabs(filteredTabs);

      // If the current tab is being deleted, switch to the first available tab
      if (currentTab === tabToDelete.id && filteredTabs.length > 0) {
        setCurrentTab(filteredTabs[0].id);
      }

      showSnackbar("Tab deleted successfully");
    } catch (error) {
      console.error("Error deleting tab:", error);
      showSnackbar("Failed to delete tab", "error");
    } finally {
      setLoading(false);
      setTabDeleteDialogOpen(false);
      setTabToDelete(null);
    }
  };

  // Functions to reorder tabs
  const handleReorderTab = (tabId, direction) => {
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    if (
      (direction === "up" && tabIndex === 0) ||
      (direction === "down" && tabIndex === tabs.length - 1)
    ) {
      return; // Can't move further
    }

    const newTabs = [...tabs];
    const targetIndex = direction === "up" ? tabIndex - 1 : tabIndex + 1;

    // Swap positions
    [newTabs[tabIndex], newTabs[targetIndex]] = [
      newTabs[targetIndex],
      newTabs[tabIndex],
    ];

    setTabs(newTabs);
    showSnackbar("Tab order updated");
  };

  // Move field up or down in display order
  const handleReorderField = async (field, direction) => {
    const tabFields = fieldsByTab[field.tabId] || [];
    const currentIndex = tabFields.findIndex((f) => f._id === field._id);

    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === tabFields.length - 1)
    ) {
      return; // Can't move further
    }

    const newOrder = [...tabFields];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Swap positions
    [newOrder[currentIndex], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[currentIndex],
    ];

    // Update display orders
    try {
      setLoading(true);

      // Update the two fields that changed positions
      await Promise.all([
        axios.put(`http://localhost:3001/music-dynamic-fields/${field._id}`, {
          ...field,
          displayOrder: targetIndex,
        }),
        axios.put(
          `http://localhost:3001/music-dynamic-fields/${newOrder[currentIndex]._id}`,
          {
            ...newOrder[currentIndex],
            displayOrder: currentIndex,
          }
        ),
      ]);

      showSnackbar("Field order updated");
      fetchFields(); // Refresh the field list
    } catch (error) {
      console.error("Error reordering fields:", error);
      showSnackbar("Failed to update field order", "error");
    } finally {
      setLoading(false);
    }
  };

  // Toggle field active status
  const handleToggleActive = async (field) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:3001/music-dynamic-fields/${field._id}`,
        {
          ...field,
          isActive: !field.isActive,
        }
      );

      showSnackbar(
        `Field ${!field.isActive ? "activated" : "deactivated"} successfully`
      );
      fetchFields(); // Refresh the field list
    } catch (error) {
      console.error("Error toggling field status:", error);
      showSnackbar("Failed to update field status", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
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
              Field Manager
            </Typography>
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
          <ClerkSidebar active="fieldManager" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <ClerkSidebar active="fieldManager" />
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            ...styles.mainContent,
            maxWidth: "100%",
            overflowX: "hidden",
          }}
        >
          {" "}
          {/* Header Section */}
          {isLargeScreen && (
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
                Field Manager
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
          )}
          {isLargeScreen && <Divider sx={{ mb: 3 }} />}
          {/* Main Content Area */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
              >
                Manage Fields
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenEditor()}
                sx={buttonStyles}
              >
                Add New Field
              </Button>
            </Box>

            <Typography variant="body2" sx={{ mb: 3, color: "#666" }}>
              Create and manage custom fields for music catalog entries. Fields
              are organized by tabs.
            </Typography>

            {/* Tabs Section with Tab Management */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                mb: 2,
                bgcolor: "#fff",
                borderRadius: 1,
                boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
                p: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                  px: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", color: "#666" }}
                >
                  Tab Management
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingTab(null);
                    setNewTabName("");
                    setTabDialogOpen(true);
                  }}
                  sx={{
                    ...secondaryButtonStyles,
                    py: 0.5,
                    px: 1,
                    fontSize: "0.75rem",
                  }}
                >
                  Add Tab
                </Button>
              </Box>

              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  ".MuiTabs-indicator": {
                    backgroundColor: "#8BD3E6",
                  },
                  ".MuiTab-root": {
                    fontFamily: "Montserrat",
                    color: "#666",
                    "&.Mui-selected": {
                      color: "#8BD3E6",
                      fontWeight: "bold",
                    },
                  },
                }}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.id}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {tab.name}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTab(tab);
                            setNewTabName(tab.name);
                            setTabDialogOpen(true);
                          }}
                          sx={{ ml: 1, p: 0.5 }}
                        >
                          <EditIcon
                            fontSize="small"
                            sx={{ fontSize: "0.8rem" }}
                          />
                        </IconButton>
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {/* Field List */}
            <Paper sx={styles.fieldListCard}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress sx={{ color: "#8BD3E6" }} />
                </Box>
              ) : (
                <>
                  {!fieldsByTab[currentTab] ||
                  fieldsByTab[currentTab].length === 0 ? (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography variant="body1" sx={{ color: "#666", mb: 2 }}>
                        No fields configured for this tab.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenEditor()}
                        sx={secondaryButtonStyles}
                      >
                        Add Field
                      </Button>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: "#f9f9f9" }}>
                          <TableRow>
                            <TableCell
                              sx={{ fontWeight: "bold", width: "30%" }}
                            >
                              Field Name
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: "bold", width: "15%" }}
                            >
                              Type
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: "bold", width: "15%" }}
                            >
                              Required
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: "bold", width: "15%" }}
                            >
                              Status
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: "bold", width: "25%" }}
                            >
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {fieldsByTab[currentTab]?.map((field) => (
                            <TableRow key={field._id}>
                              <TableCell>
                                <Tooltip title={field.name}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    {field.label}
                                  </Typography>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                {fieldTypes.find(
                                  (type) => type.value === field.fieldType
                                )?.label || field.fieldType}
                              </TableCell>
                              <TableCell>
                                {field.required ? "Yes" : "No"}
                              </TableCell>
                              <TableCell>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={field.isActive}
                                      onChange={() => handleToggleActive(field)}
                                      size="small"
                                      sx={{
                                        "& .MuiSwitch-switchBase.Mui-checked": {
                                          color: "#8BD3E6",
                                        },
                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                          {
                                            backgroundColor: "#8BD3E6",
                                          },
                                      }}
                                    />
                                  }
                                  label={field.isActive ? "Active" : "Inactive"}
                                  labelPlacement="end"
                                  sx={{ m: 0 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Tooltip title="Move Up">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleReorderField(field, "up")
                                      }
                                      sx={{ color: "#8BD3E6" }}
                                    >
                                      <ArrowUpwardIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Move Down">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleReorderField(field, "down")
                                      }
                                      sx={{ color: "#8BD3E6" }}
                                    >
                                      <ArrowDownwardIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit Field">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenEditor(field)}
                                      sx={{ color: "#6FBCCF" }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {/* Delete button removed as per requirement */}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </Paper>
          </Paper>
          {/* Field Editor Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseEditor}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                padding: 2,
              },
            }}
          >
            <DialogTitle sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}>
              {editingField ? "Edit Field" : "Add New Field"}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label="Field Name"
                    value={editingField?.name || newField.name}
                    onChange={handleFieldChange}
                    fullWidth
                    required
                    helperText="Unique identifier (lowercase, no spaces)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="label"
                    label="Display Label"
                    value={editingField?.label || newField.label}
                    onChange={handleFieldChange}
                    fullWidth
                    required
                    helperText="Label shown to users"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="field-type-label">Field Type</InputLabel>
                    <Select
                      labelId="field-type-label"
                      name="fieldType"
                      value={editingField?.fieldType || newField.fieldType}
                      onChange={handleFieldChange}
                      label="Field Type"
                    >
                      {fieldTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="tab-index-label">Tab</InputLabel>
                    <Select
                      labelId="tab-index-label"
                      name="tabId"
                      value={editingField?.tabId || newField.tabId}
                      onChange={handleFieldChange}
                      label="Tab"
                    >
                      {tabs.map((tab) => (
                        <MenuItem key={tab.id} value={tab.id}>
                          {tab.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="required"
                        checked={editingField?.required || newField.required}
                        onChange={handleFieldChange}
                        sx={{
                          "&.Mui-checked": {
                            color: "#8BD3E6",
                          },
                        }}
                      />
                    }
                    label="Required Field"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isActive"
                        checked={
                          editingField?.isActive !== undefined
                            ? editingField.isActive
                            : newField.isActive
                        }
                        onChange={handleFieldChange}
                        sx={{
                          "&.Mui-checked": {
                            color: "#8BD3E6",
                          },
                        }}
                      />
                    }
                    label="Active"
                  />
                </Grid>

                {/* Options for Select field type */}
                {(editingField?.fieldType === "select" ||
                  newField.fieldType === "select") && (
                  <Grid item xs={12}>
                    <TextField
                      label="Options (one per line, format: value:label)"
                      multiline
                      rows={4}
                      fullWidth
                      value={optionsInput}
                      onChange={(e) => setOptionsInput(e.target.value)}
                      placeholder="example:Example Option"
                      helperText="Enter one option per line in the format 'value:label'. If only value is provided, it will be used as the label too."
                    />
                  </Grid>
                )}

                {/* Show a sample of how the field will appear */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    Field Preview:
                  </Typography>
                  <Box
                    sx={{ p: 2, border: "1px dashed #ccc", borderRadius: 1 }}
                  >
                    <DynamicField
                      field={{
                        name:
                          editingField?.name || newField.name || "field_name",
                        label:
                          editingField?.label ||
                          newField.label ||
                          "Field Label",
                        fieldType:
                          editingField?.fieldType || newField.fieldType,
                        required: editingField?.required || newField.required,
                        options: parseOptions(optionsInput),
                        validationRules:
                          editingField?.validationRules ||
                          newField.validationRules,
                      }}
                      value=""
                      onChange={() => {}}
                      formStyles={{
                        mb: 2,
                        fontFamily: "Montserrat",
                        width: "100%",
                      }}
                      isMobile={isMobile}
                    />
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseEditor} sx={secondaryButtonStyles}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveField}
                variant="contained"
                startIcon={<SaveIcon />}
                sx={buttonStyles}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Field"}
              </Button>
            </DialogActions>
          </Dialog>
          {/* Tab Editor Dialog */}
          <Dialog
            open={tabDialogOpen}
            onClose={() => setTabDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                padding: 2,
              },
            }}
          >
            <DialogTitle sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}>
              {editingTab ? "Edit Tab" : "Add New Tab"}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 1 }}>
                <TextField
                  fullWidth
                  label="Tab Name"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  autoFocus
                />
              </Box>
              {editingTab && (
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 1, sm: 2 },
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      startIcon={<ArrowUpwardIcon fontSize="small" />}
                      onClick={() => handleReorderTab(editingTab.id, "up")}
                      disabled={
                        tabs.findIndex((t) => t.id === editingTab.id) === 0
                      }
                      size="small"
                      sx={{
                        ...secondaryButtonStyles,
                        minWidth: { xs: "100%", sm: "auto" },
                        px: { xs: 1, sm: 2 },
                        py: 0.5,
                        fontSize: "0.75rem",
                        height: { xs: "30px", sm: "32px" },
                      }}
                    >
                      Move Up
                    </Button>
                    <Button
                      startIcon={<ArrowDownwardIcon fontSize="small" />}
                      onClick={() => handleReorderTab(editingTab.id, "down")}
                      disabled={
                        tabs.findIndex((t) => t.id === editingTab.id) ===
                        tabs.length - 1
                      }
                      size="small"
                      sx={{
                        ...secondaryButtonStyles,
                        minWidth: { xs: "100%", sm: "auto" },
                        px: { xs: 1, sm: 2 },
                        py: 0.5,
                        fontSize: "0.75rem",
                        height: { xs: "30px", sm: "32px" },
                      }}
                    >
                      Move Down
                    </Button>
                    <Button
                      startIcon={<DeleteIcon fontSize="small" />}
                      onClick={() => {
                        setTabDialogOpen(false);
                        handleTabDelete(editingTab);
                      }}
                      size="small"
                      sx={{
                        ...deleteButtonStyles,
                        minWidth: { xs: "100%", sm: "auto" },
                        px: { xs: 1, sm: 2 },
                        py: 0.5,
                        fontSize: "0.75rem",
                        height: { xs: "30px", sm: "32px" },
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={() => setTabDialogOpen(false)}
                sx={secondaryButtonStyles}
              >
                Cancel
              </Button>
              <Button
                onClick={editingTab ? handleUpdateTab : handleAddTab}
                variant="contained"
                sx={buttonStyles}
                disabled={loading || !newTabName.trim()}
              >
                {loading ? "Saving..." : "Save Tab"}
              </Button>
            </DialogActions>
          </Dialog>
          {/* Tab Delete Confirmation Dialog */}
          <Dialog
            open={tabDeleteDialogOpen}
            onClose={() => setTabDeleteDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                padding: 2,
              },
            }}
          >
            <DialogTitle sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}>
              Confirm Delete Tab
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the tab "{tabToDelete?.name}"?
                This tab can only be deleted if it contains no fields.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={() => setTabDeleteDialogOpen(false)}
                sx={secondaryButtonStyles}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmTabDelete}
                variant="contained"
                sx={{
                  ...buttonStyles,
                  ...deleteButtonStyles,
                }}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Tab"}
              </Button>
            </DialogActions>
          </Dialog>
          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
