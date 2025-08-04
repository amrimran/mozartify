import React, { useState, useEffect } from "react";
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
  DialogContentText,
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
  CircularProgress,
  useMediaQuery,
  AppBar,
  Toolbar,
  Avatar,
  Drawer,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createGlobalStyle } from "styled-components";
import { useNavigate } from "react-router-dom";
import ClerkSidebar from "./ArtsClerkSidebar";
import DynamicField from "./DynamicField";
import { API_BASE_URL, API_BASE_URL_1} from './config/api.js';

const DRAWER_WIDTH = 225;

// Theme setup
const theme = createTheme({
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

// Field type options
const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "textarea", label: "Text Area" },
  { value: "price", label: "Price" },
  { value: "image", label: "Image" },
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

// Button styles
const buttonStyles = {
  px: { xs: 2, sm: 4 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#FFB6C1",
  border: "1px solid #FFB6C1",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#FFA0B3",
    borderColor: "#FFA0B3",
    boxShadow: "none",
  },
};

const secondaryButtonStyles = {
  px: { xs: 2, sm: 4 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFB6C1",
  backgroundColor: "#FFFFFF",
  border: "1px solid #FFB6C1",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#FFF5F6",
    color: "#FFA0B3",
    borderColor: "#FFA0B3",
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

export default function DynamicFieldManager() {
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [fields, setFields] = useState([]);
  const [fieldsByTab, setFieldsByTab] = useState({});
  const [tabs, setTabs] = useState([]);
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
        const response = await axios.get(`${API_BASE_URL}/current-user`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch all dynamic fields and tabs
  const fetchFields = async () => {
    setLoading(true);
    try {
      // Fetch tabs first
      const tabResponse = await axios.get(`${API_BASE_URL_1}/arts-tabs`);
      const fetchedTabs = tabResponse.data;
      setTabs(fetchedTabs);

      // Then fetch fields
      const response = await axios.get(`${API_BASE_URL_1}/dynamic-fields`);
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

    // Check if tabs exist, if not, initialize default tabs
    const initializeTabs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL_1}/arts-tabs`);
        if (response.data.length === 0) {
          await axios.post(`${API_BASE_URL_1}/arts-tabs/initialize`);
          showSnackbar("Default tabs initialized", "success");
          fetchFields(); // Refresh after initialization
        }
      } catch (error) {
        console.error("Error checking/initializing tabs:", error);
      }
    };

    initializeTabs();
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
          `${API_BASE_URL_1}/dynamic-fields/${editingField._id}`,
          fieldToSave
        );
        showSnackbar("Field updated successfully");
      } else {
        // Create new field
        response = await axios.post(
          `${API_BASE_URL_1}/dynamic-fields`,
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

      // Create a new tab via API
      const response = await axios.post(`${API_BASE_URL_1}/arts-tabs`, {
        name: newTabName,
      });

      showSnackbar("Tab added successfully");
      setTabDialogOpen(false);
      setNewTabName("");

      // Refresh tabs and fields
      fetchFields();

      // Optionally switch to the new tab
      setCurrentTab(response.data.tabId);
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

      await axios.put(`${API_BASE_URL_1}/arts-tabs/${editingTab.tabId}`, {
        name: newTabName,
      });

      showSnackbar("Tab updated successfully");
      setTabDialogOpen(false);

      // Refresh tabs
      fetchFields();
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

      await axios.delete(
        `${API_BASE_URL_1}/arts-tabs/${tabToDelete.tabId}`
      );

      // Refresh tabs and fields
      fetchFields();

      // If the current tab is being deleted, switch to the first available tab
      if (currentTab === tabToDelete.tabId && tabs.length > 0) {
        setCurrentTab(tabs[0].tabId);
      }

      showSnackbar("Tab deleted successfully");
    } catch (error) {
      console.error("Error deleting tab:", error);

      if (error.response && error.response.status === 400) {
        showSnackbar(
          "Cannot delete tab with fields. Please move or delete fields first.",
          "error"
        );
      } else {
        showSnackbar("Failed to delete tab", "error");
      }
    } finally {
      setLoading(false);
      setTabDeleteDialogOpen(false);
      setTabToDelete(null);
    }
  };

  // Functions to reorder tabs
  const handleReorderTab = async (tabId, direction) => {
    const tabIndex = tabs.findIndex((tab) => tab.tabId === tabId);
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

    try {
      setLoading(true);

      // Update the display orders via API
      await axios.put(`${API_BASE_URL_1}/arts-tabs/reorder`, {
        tabs: newTabs.map((tab, index) => ({
          tabId: tab.tabId,
          displayOrder: index,
        })),
      });

      setTabs(newTabs);
      showSnackbar("Tab order updated");
    } catch (error) {
      console.error("Error reordering tabs:", error);
      showSnackbar("Failed to update tab order", "error");
    } finally {
      setLoading(false);
    }
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
        axios.put(`${API_BASE_URL_1}/dynamic-fields/${field._id}`, {
          ...field,
          displayOrder: targetIndex,
        }),
        axios.put(
          `${API_BASE_URL_1}/dynamic-fields/${newOrder[currentIndex]._id}`,
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
      await axios.put(`${API_BASE_URL_1}/dynamic-fields/${field._id}`, {
        ...field,
        isActive: !field.isActive,
      });

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
              Create and manage custom fields for arts catalog entries. Fields
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
                    backgroundColor: "#FFB6C1",
                  },
                  ".MuiTab-root": {
                    fontFamily: "Montserrat",
                    color: "#666",
                    "&.Mui-selected": {
                      color: "#FFB6C1",
                      fontWeight: "bold",
                    },
                  },
                }}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.tabId}
                    value={tab.tabId}
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
                  <CircularProgress sx={{ color: "#FFB6C1" }} />
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
                                          color: "#FFB6C1",
                                        },
                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                          {
                                            backgroundColor: "#FFB6C1",
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
                                      sx={{ color: "#FFB6C1" }}
                                    >
                                      <ArrowUpIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Move Down">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleReorderField(field, "down")
                                      }
                                      sx={{ color: "#FFB6C1" }}
                                    >
                                      <ArrowDownIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit Field">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenEditor(field)}
                                      sx={{ color: "#FFA0B3" }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {/* <Tooltip title="Delete Field">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            `Are you sure you want to delete the field "${field.label}"?`
                                          )
                                        ) {
                                          handleToggleActive(field); // Using soft delete
                                        }
                                      }}
                                      sx={{ color: "#DB2226" }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip> */}
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
                    <InputLabel id="tab-id-label">Tab</InputLabel>
                    <Select
                      labelId="tab-id-label"
                      name="tabId"
                      value={editingField?.tabId || newField.tabId}
                      onChange={handleFieldChange}
                      label="Tab"
                    >
                      {tabs.map((tab) => (
                        <MenuItem key={tab.tabId} value={tab.tabId}>
                          {tab.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="required"
                        checked={editingField?.required || newField.required}
                        onChange={handleFieldChange}
                        sx={{
                          "&.Mui-checked": {
                            color: "#FFB6C1",
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
                      <Switch
                        name="isActive"
                        checked={
                          editingField?.isActive !== undefined
                            ? editingField.isActive
                            : newField.isActive
                        }
                        onChange={handleFieldChange}
                        sx={{
                          "&.Mui-checked": {
                            color: "#FFB6C1",
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

                {/* Validation rules for number type */}
                {(editingField?.fieldType === "number" ||
                  newField.fieldType === "number" ||
                  editingField?.fieldType === "price" ||
                  newField.fieldType === "price") && (
                  <Grid item xs={12} container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Min Value"
                        type="number"
                        fullWidth
                        value={
                          editingField?.validationRules?.min ||
                          newField.validationRules?.min ||
                          ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (editingField) {
                            setEditingField((prev) => ({
                              ...prev,
                              validationRules: {
                                ...prev.validationRules,
                                min: value,
                              },
                            }));
                          } else {
                            setNewField((prev) => ({
                              ...prev,
                              validationRules: {
                                ...prev.validationRules,
                                min: value,
                              },
                            }));
                          }
                        }}
                        helperText="Minimum allowed value"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Max Value"
                        type="number"
                        fullWidth
                        value={
                          editingField?.validationRules?.max ||
                          newField.validationRules?.max ||
                          ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (editingField) {
                            setEditingField((prev) => ({
                              ...prev,
                              validationRules: {
                                ...prev.validationRules,
                                max: value,
                              },
                            }));
                          } else {
                            setNewField((prev) => ({
                              ...prev,
                              validationRules: {
                                ...prev.validationRules,
                                max: value,
                              },
                            }));
                          }
                        }}
                        helperText="Maximum allowed value"
                      />
                    </Grid>
                  </Grid>
                )}
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
                disabled={loading || !newField.name || !newField.label}
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
                      startIcon={<ArrowUpIcon fontSize="small" />}
                      onClick={() => handleReorderTab(editingTab.tabId, "up")}
                      disabled={
                        tabs.findIndex((t) => t.tabId === editingTab.tabId) ===
                        0
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
                      startIcon={<ArrowDownIcon fontSize="small" />}
                      onClick={() => handleReorderTab(editingTab.tabId, "down")}
                      disabled={
                        tabs.findIndex((t) => t.tabId === editingTab.tabId) ===
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
