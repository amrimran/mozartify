import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Grid,
  Card,
  CircularProgress,
  Backdrop,
  Skeleton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import DynamicField from "./DynamicField";
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import { Menu as MenuIcon } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { API_BASE_URL, API_BASE_URL_1} from './config/api.js';

const DRAWER_WIDTH = 225;

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

const GlobalStyle = createGlobalStyle`
    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', sans-serif;
      overflow-x: hidden; // Prevent horizontal scrolling
    }
  `;

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
  },
  appBar: {
    display: { xs: "block", lg: "none" }, // Show on small/medium, hide on large
    backgroundColor: "#FFFFFF",
    boxShadow: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: DRAWER_WIDTH,
      boxSizing: "border-box",
    },
  },
  mainContent: {
    flexGrow: 1,
    p: { xs: 2, sm: 3 },
    mt: 8,
    width: "100%",
    maxWidth: "100vw",
    overflowX: "hidden",
  },
};

const formStyles = (theme) => ({
  mb: 2,
  fontFamily: "Montserrat",
  "& .MuiInputBase-root": {
    fontFamily: "Montserrat",
  },
  "& .MuiFormLabel-root": {
    fontFamily: "Montserrat",
    "&.Mui-focused": {
      color: "#6FBCCF", // Label color on focus
    },
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "& fieldset": {
      borderColor: "#8BD3E6", // Default border color
    },
    "&:hover fieldset": {
      borderColor: "#6FBCCF", // Border color on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#6FBCCF", // Border color on focus
    },
  },
  width: "90%",
  [theme.breakpoints.down("sm")]: {
    width: "90%", // Shorter width for mobile devices
  },
});

const buttonStyles = {
  px: 5,
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
  "&:disabled": {
    backgroundColor: "#E0E0E0",
    borderColor: "#E0E0E0",
    color: "#9E9E9E",
  },
};

const dialogStyles = {
  dialog: {
    PaperProps: {
      sx: {
        borderRadius: "16px",
        padding: "16px",
        width: { xs: "90%", sm: "auto" },
        maxWidth: { xs: "90%", sm: 500 },
      },
    },
    aria: {
      labelledby: "alert-dialog-title",
      describedby: "alert-dialog-description",
    },
  },
  title: {
    sx: {
      fontFamily: "Montserrat",
      fontWeight: "bold",
      fontSize: { xs: "1.125rem", sm: "1.25rem" },
      textAlign: "center",
      color: "black",
      paddingBottom: 1,
    },
  },
  content: {
    sx: {
      textAlign: "center",
      paddingX: { xs: 2, sm: 3 },
      paddingTop: "0 !important", // Override default padding
    },
  },
  contentText: {
    sx: {
      fontFamily: "Montserrat",
      fontSize: { xs: "0.875rem", sm: "1rem" },
      color: "#555",
      lineHeight: 1.6,
    },
  },
  actions: {
    sx: {
      justifyContent: "center",
      padding: { xs: "8px 16px", sm: "16px 24px" },
      gap: { xs: 1, sm: 2 },
    },
  },
  button: {
    common: {
      fontFamily: "Montserrat",
      fontWeight: "bold",
      textTransform: "uppercase",
      borderRadius: "8px",
      paddingX: { xs: 3, sm: 4 },
      boxShadow: "none",
    },
    close: {
      backgroundColor: "#8BD3E6",
      color: "white",
      "&:hover": {
        backgroundColor: "#6FBCCF",
        boxShadow: "none",
      },
    },
  },
};

export default function MusicEntryClerkCatalog() {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { fileName } = location.state || {};
  const [originalData, setOriginalData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [instrumentationLoading, setInstrumentationLoading] = useState(false);
  const [catalogData, setCatalogData] = useState({
    filename: "",
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabsData, setTabsData] = useState([]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [fieldsByTab, setFieldsByTab] = useState({});

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/current-user`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // Fetch catalog data if fileName exists
  useEffect(() => {
    if (fileName) {
      const fetchCatalogData = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL_1}/catalog/${fileName}`
          );
          if (response.data) {
            console.log("Fetched data:", response.data);
            setCatalogData(response.data);
            setOriginalData(response.data);
            setCoverImageUrl(response.data.coverImageUrl);
          }
        } catch (error) {
          console.error("Error fetching catalog data:", error);
        }
      };

      fetchCatalogData();
    }
  }, [fileName]);

  // Fetch dynamic tabs and fields
  useEffect(() => {
    const fetchTabsAndFields = async () => {
      try {
        setLoading(true);
        
        // Fetch tabs
        const tabsResponse = await axios.get(`${API_BASE_URL_1}/music-tabs`);
        const fetchedTabs = tabsResponse.data;
        
        // Sort tabs by display order
        fetchedTabs.sort((a, b) => a.displayOrder - b.displayOrder);
        setTabsData(fetchedTabs);
        
        // Fetch fields
        const fieldsResponse = await axios.get(`${API_BASE_URL_1}/music-dynamic-fields`);
        const fetchedFields = fieldsResponse.data;
        setDynamicFields(fetchedFields);

        // Organize fields by tab ID
        const groupedFields = fetchedFields.reduce((acc, field) => {
          const tabId = field.tabId;
          if (!acc[tabId]) {
            acc[tabId] = [];
          }
          
          // Sort fields by display order within each tab group
          acc[tabId].push(field);
          acc[tabId].sort((a, b) => a.displayOrder - b.displayOrder);
          
          return acc;
        }, {});

        setFieldsByTab(groupedFields);
      } catch (error) {
        console.error("Error fetching dynamic data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTabsAndFields();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);

    // Scroll to top if in mobile view
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCatalogData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Helper function to show dialog
  const showDialog = (title, message, success = true) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setIsSuccess(success);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDateChange = (name, newValue) => {
    setCatalogData((prevData) => ({
      ...prevData,
      [name]: newValue ? newValue.toISOString() : "",
    }));
  };

  const handleNext = () => {
    // Get the number of tabs available (dynamic tabs + 3 hardcoded tabs)
    const totalTabs = tabsData.length + 3;
    if (tabIndex < totalTabs - 1) {
      setTabIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Handle cover image upload
  const handleCoverImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const storageRef = ref(storage, `cover_images/${file.name}`);
      uploadBytes(storageRef, file)
        .then((snapshot) => {
          return getDownloadURL(snapshot.ref);
        })
        .then((url) => {
          setCoverImageUrl(url);
          setCatalogData((prevData) => ({
            ...prevData,
            coverImageUrl: url,
          }));
          showDialog("Uploaded", "Cover image uploaded successfully!");
        })
        .catch((error) => {
          console.error("Error uploading cover image:", error);
          showDialog("Error", "Failed to upload cover image", false);
        });
    }
  };

  // MP3 file upload and prediction
  const handleMp3FileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setDialogTitle("Error");
      setDialogMessage("Please select an MP3 file.");
      setIsSuccess(false);
      setOpenDialog(true);
      return;
    }

    try {
      // Set loading state to true (show loading spinner)
      setLoading(true);

      // Clear previous values when mp3 changed
      setCatalogData((prevData) => ({
        ...prevData,
        emotion: "",
        genre: "",
        gender: "",
      }));

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `mp3_file/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // Update catalogData with Firebase URL and filename
      setCatalogData((prevData) => ({
        ...prevData,
        mp3FileUrl: fileUrl,
        mp3FileName: file.name,
      }));

      // Call emotion prediction API
      const emotionResponse = await axios.post(
        "http://127.0.0.1:5173/predict-emotion",
        { fileUrl }
      );

      // Update catalogData with the new emotion
      setCatalogData((prevData) => ({
        ...prevData,
        emotion: emotionResponse.data.predicted_mood,
      }));

      // Call gender prediction API
      const genderResponse = await axios.post(
        "http://127.0.0.1:9000/predict-gender",
        { file_url: fileUrl }
      );

      // Update catalogData with the predicted gender
      setCatalogData((prevData) => ({
        ...prevData,
        gender: genderResponse.data.gender,
      }));

      // Call genre prediction API
      const genreResponse = await axios.post(
        "http://127.0.0.1:8001/predict-genre",
        { fileUrl }
      );

      // Update catalogData with the new genre
      setCatalogData((prevData) => ({
        ...prevData,
        genre: genreResponse.data.genre,
      }));

      setDialogTitle("Prediction Complete");
      setDialogMessage("File uploaded and predictions completed successfully!");
      setIsSuccess(true);
      setOpenDialog(true);
    } catch (error) {
      console.error(
        "Error uploading MP3 or predicting emotion/gender/genre:",
        error
      );

      // Handle different types of errors with dialog
      let errorMessage = "An unexpected error occurred.";

      if (error.response) {
        errorMessage = `Backend error: ${error.response.data.detail || error.response.statusText}`;
      } else if (error.request) {
        errorMessage =
          "Error communicating with the backend. Please try again later.";
      } else {
        errorMessage = `An error occurred: ${error.message}`;
      }

      setDialogTitle("Error");
      setDialogMessage(errorMessage);
      setIsSuccess(false);
      setOpenDialog(true);
    } finally {
      setLoading(false);
    }
  };

  // Instrumentation prediction
  const handleInstrumentationPrediction = async () => {
    // Make sure we have an MP3 file URL
    if (!catalogData.mp3FileUrl) {
      setDialogTitle("Error");
      setDialogMessage("Please upload an MP3 file in the MP3 File tab first.");
      setIsSuccess(false);
      setOpenDialog(true);
      return;
    }

    try {
      // Set loading state for instrumentation
      setInstrumentationLoading(true);

      // Call instrument prediction API
      const instrumentResponse = await axios.post(
        "http://127.0.0.1:8000/predict-instrument",
        {
          fileUrl: catalogData.mp3FileUrl,
        }
      );

      // Update catalogData with the predicted instrumentation
      setCatalogData((prevData) => ({
        ...prevData,
        instrumentation: instrumentResponse.data.top_instruments,
      }));

      setDialogTitle("Prediction Complete");
      setDialogMessage("Instrumentation prediction completed successfully!");
      setIsSuccess(true);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error predicting instrumentation:", error);

      let errorMessage =
        "An unexpected error occurred with instrumentation prediction.";

      if (error.response) {
        errorMessage = `Backend error: ${error.response.data.detail || error.response.statusText}`;
      } else if (error.request) {
        errorMessage =
          "Error communicating with the instrumentation prediction service.";
      } else {
        errorMessage = `An error occurred: ${error.message}`;
      }

      setDialogTitle("Error");
      setDialogMessage(errorMessage);
      setIsSuccess(false);
      setOpenDialog(true);
    } finally {
      setInstrumentationLoading(false);
    }
  };

  // Validation function
  const validateRequiredFields = (data) => {
    const missingFields = [];

    // Check for required fields in dynamic fields
    dynamicFields.forEach(field => {
      if (field.required && field.isActive && (!data[field.name] || String(data[field.name]).trim() === "")) {
        missingFields.push(field.label);
      }
    });

    // Also check hardcoded required fields for the special tabs
    const hardcodedRequiredFields = {
      "emotion": "Emotion",
      "genre": "Genre"
    };

    Object.entries(hardcodedRequiredFields).forEach(([field, label]) => {
      if (!data[field] || String(data[field]).trim() === "") {
        missingFields.push(label);
      }
    });

    // Price validation if it exists
    if (data.price && (isNaN(data.price) || parseFloat(data.price) <= 0)) {
      missingFields.push("Valid Price (must be greater than 0)");
    }

    return missingFields;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    const missingFields = validateRequiredFields(catalogData);

    if (missingFields.length > 0) {
      setDialogTitle("Missing Required Fields");
      setDialogMessage(
        `Please fill in the following required fields:\n${missingFields.join(", ")}`
      );
      setIsSuccess(false);
      setOpenDialog(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL_1}/catalog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(catalogData),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      setOriginalData(catalogData);
      setDialogTitle("Success");
      setDialogMessage("Data saved successfully.");
      setIsSuccess(true);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error saving data:", error);
      setDialogTitle("Error");
      setDialogMessage("Failed to save data.");
      setIsSuccess(false);
      setOpenDialog(true);
    }
  };

  // Define shorter labels for mobile view
  const getTabLabel = (fullLabel) => {
    if (isMobile) {
      switch (fullLabel) {
        case "Identification":
          return "ID";
        case "Performance":
          return "Perf.";
        case "Geography":
          return "Geo";
        case "Related Work":
          return "Related";
        case "Cover Image":
          return "Cover";
        case "MP3 File":
          return "MP3";
        case "Instrumentation":
          return "Inst.";
        default:
          // If label is longer than 6 characters, abbreviate it
          return fullLabel.length > 6 ? `${fullLabel.substring(0, 5)}...` : fullLabel;
      }
    }
    return fullLabel;
  };

  // Render the form fields based on tab ID
  const renderDynamicFields = (tabId) => {
    const fields = fieldsByTab[tabId] || [];
    // Filter only active fields
    const activeFields = fields.filter(field => field.isActive);

    return (
      <Grid container spacing={2} direction={isMobile ? "column" : "row"}>
        {activeFields.map((field) => (
          <Grid item xs={12} sm={6} key={field._id}>
            <DynamicField
              field={field}
              value={catalogData[field.name] || ''}
              onChange={handleInputChange}
              formStyles={formStyles(theme)}
              isMobile={isMobile}
            />
          </Grid>
        ))}
        {activeFields.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ textAlign: "center", py: 4, color: "#666" }}>
              No fields have been configured for this tab.
            </Typography>
          </Grid>
        )}
      </Grid>
    );
  };

  // Generate tabs including dynamic tabs and hardcoded tabs
  const getTabs = () => {
    // First include all dynamic tabs
    const allTabs = [...tabsData];

    // Then add the hardcoded tabs (Cover Image, MP3 File, Instrumentation)
    const lastDynamicTabId = allTabs.length > 0 ? Math.max(...allTabs.map(tab => tab.tabId)) : -1;
    
    allTabs.push(
      { tabId: lastDynamicTabId + 1, name: "Cover Image", isHardcoded: true },
      { tabId: lastDynamicTabId + 2, name: "MP3 File", isHardcoded: true },
      { tabId: lastDynamicTabId + 3, name: "Instrumentation", isHardcoded: true }
    );

    return allTabs;
  };

  // Get the current tab content
  const renderTabContent = () => {
    const allTabs = getTabs();
    const currentTab = allTabs.find((tab, index) => index === tabIndex);
    
    if (!currentTab) {
      return <Typography>Tab content not found</Typography>;
    }
    
    // Handle hardcoded tabs
    if (currentTab.isHardcoded) {
      switch (currentTab.name) {
        case "Cover Image":
          return (
            <Grid item xs={12} sm={8}>
              <Card
                variant="outlined"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  mt: 3,
                  borderRadius: 2,
                  borderColor: "#8BD3E6",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                {coverImageUrl ? (
                  <img
                    src={coverImageUrl}
                    alt="Cover"
                    style={{
                      width: "180px",
                      height: "auto",
                      borderRadius: "12px",
                      marginBottom: "15px",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 180,
                      height: 180,
                      bgcolor: "#E0E0E0",
                      borderRadius: "12px",
                      marginBottom: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "Montserrat",
                        color: "#7D7D7D",
                      }}
                    >
                      No Cover Image
                    </Typography>
                  </Box>
                )}
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: "Montserrat",
                    textAlign: "center",
                    mb: 3,
                  }}
                >
                  {coverImageUrl
                    ? "Current Cover Image"
                    : "No cover image available"}
                </Typography>

                <Button
                  variant="contained"
                  component="label"
                  sx={buttonStyles}
                >
                  {coverImageUrl ? "Change Image" : "Upload Image"}
                  <input
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    hidden
                    onChange={handleCoverImageChange}
                  />
                </Button>
              </Card>
            </Grid>
          );
          
        case "MP3 File":
          return (
            <Grid container spacing={4} justifyContent="center">
              {/* MP3 Upload Card */}
              <Grid item xs={12} sm={5} md={4}>
                <Card
                  variant="outlined"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 3,
                    mt: 3,
                    borderRadius: 3,
                    borderColor: "#8BD3E6",
                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  {catalogData.mp3FileUrl ? (
                    <>
                      <Typography
                        variant="body1"
                        sx={{ fontFamily: "Montserrat", mb: 2 }}
                      >
                        <strong>Uploaded MP3:</strong>
                        <br />
                        {catalogData.mp3FileName}
                      </Typography>
                      <audio
                        controls
                        src={catalogData.mp3FileUrl}
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          marginBottom: "15px",
                        }}
                      />
                    </>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: 120,
                        bgcolor: "#F3F3F3",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: 3,
                        mb: 2,
                        boxShadow: "inset 0px 4px 10px rgba(0, 0, 0, 0.1)",
                        fontFamily: "Montserrat",
                        color: "#7D7D7D",
                        textAlign: "center",
                      }}
                    >
                      {loading ? (
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={120}
                        />
                      ) : (
                        "No MP3 File Uploaded"
                      )}
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    component="label"
                    sx={buttonStyles}
                  >
                    {catalogData.mp3FileUrl ? "Change MP3" : "Upload MP3"}
                    <input
                      type="file"
                      hidden
                      accept="audio/mp3"
                      onChange={handleMp3FileChange}
                    />
                  </Button>

                  {/* Loading backdrop */}
                  <Backdrop
                    open={loading}
                    sx={{
                      color: "#fff",
                      zIndex: (theme) => theme.zIndex.drawer + 1,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      bgcolor: "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <CircularProgress
                      size={60}
                      color="inherit"
                      sx={{ mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#fff",
                        fontFamily: "Montserrat",
                        fontWeight: "bold",
                      }}
                    >
                      Getting the prediction...
                    </Typography>
                  </Backdrop>
                </Card>
              </Grid>

              {/* Prediction Results */}
              <Grid item xs={12} sm={7} md={4} sx={{ mt: 4 }}>
                <Grid container direction="column" spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      name="emotion"
                      label="Emotion"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.emotion || ""}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="gender"
                      label="Gender"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.gender || ""}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      required
                      name="genre"
                      label="Genre"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.genre || ""}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          );
          
          case "Instrumentation":
            return (
              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={8} md={6}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      mt: 3,
                      borderRadius: 3,
                      borderColor: "#8BD3E6",
                      boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Montserrat",
                        fontWeight: "bold",
                        mb: 3,
                        textAlign: "center",
                      }}
                    >
                      Instrumentation Details
                    </Typography>
  
                    <TextField
                      required
                      name="instrumentation"
                      label="Instrumentation"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={4}
                      sx={formStyles}
                      value={catalogData.instrumentation || ""}
                      onChange={handleInputChange}
                      placeholder="Get instrumentation prediction or enter manually"
                    />
  
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                    >
                      <Button
                        variant="contained"
                        onClick={handleInstrumentationPrediction}
                        disabled={
                          !catalogData.mp3FileUrl || instrumentationLoading
                        }
                        sx={buttonStyles}
                      >
                        {instrumentationLoading
                          ? "Predicting..."
                          : "Get Instrumentation Prediction"}
                      </Button>
                    </Box>
  
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "Montserrat",
                        mt: 2,
                        color: "#666",
                        textAlign: "center",
                      }}
                    >
                      Note: Instrumentation prediction may take longer to
                      process.
                      {!catalogData.mp3FileUrl &&
                        " Please upload an MP3 in the MP3 File tab first."}
                    </Typography>
  
                    {/* Backdrop for loading spinner */}
                    <Backdrop
                      open={instrumentationLoading}
                      sx={{
                        color: "#fff",
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        bgcolor: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        borderRadius: 2,
                      }}
                    >
                      <CircularProgress
                        size={60}
                        color="inherit"
                        sx={{ mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#fff",
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                        }}
                      >
                        Analyzing instrumentation...
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#fff",
                          fontFamily: "Montserrat",
                          mt: 1,
                          maxWidth: "80%",
                          textAlign: "center",
                        }}
                      >
                        This may take a moment as we analyze the audio in detail
                      </Typography>
                    </Backdrop>
                  </Card>
                </Grid>
              </Grid>
            );
            
          default:
            return <Typography>Tab content not found</Typography>;
        }
      } else {
        // This is a dynamic tab, render dynamic fields
        return renderDynamicFields(currentTab.tabId);
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
  
              {/* Title */}
              <Typography
                variant="h6"
                sx={{
                  color: "#3B3183",
                  fontWeight: "bold",
                  flexGrow: 1,
                }}
              >
                Catalog Metadata
              </Typography>
  
              {/* Avatar in App Bar */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {!isMobile && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#3B3183",
                      display: { xs: "none", sm: "block" },
                    }}
                  >
                    {user?.username}
                  </Typography>
                )}
                <Avatar
                  alt={user?.username}
                  src={user?.profile_picture || null}
                  sx={{
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            </Toolbar>
          </AppBar>
  
          {/* Permanent Drawer for Large Screens */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", lg: "block" },
              "& .MuiDrawer-paper": {
                width: DRAWER_WIDTH,
                boxSizing: "border-box",
              },
            }}
          >
            <ClerkSidebar active="catalogMetadata" />
          </Drawer>
  
          {/* Temporary Drawer for Mobile */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", lg: "none" },
              "& .MuiDrawer-paper": {
                width: DRAWER_WIDTH,
                boxSizing: "border-box",
              },
            }}
          >
            <ClerkSidebar active="catalogMetadata" />
          </Drawer>
  
          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              mt: { xs: 8, lg: 2 },
              ml: { lg: `${DRAWER_WIDTH}px` },
              maxWidth: "100%",
              overflowX: "hidden"
            }}
          >
            {/* Desktop Header */}
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
                  Catalog Metadata
                </Typography>
  
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      display: { xs: "none", lg: "block" },
                      fontFamily: "Montserrat",
                      color: "black",
                    }}
                  >
                    {user?.username || "User"}
                  </Typography>
                  <Avatar
                    alt={user?.username}
                    src={user?.profile_picture || null}
                    sx={{
                      width: { xs: 32, lg: 40 },
                      height: { xs: 32, lg: 40 },
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              </Box>
            )}
  
            {/* Divider */}
            {isLargeScreen && <Divider sx={{ mb: 3 }} />}
  
            {/* Tab Navigation */}
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              aria-label="catalog tabs"
              sx={{
                mb: 3,
                fontFamily: "Montserrat",
                overflowX: "auto",
                width: "100%",
                maxWidth: "100vw",
                minHeight: { xs: "36px", sm: "48px" },
                "& .MuiTab-root": {
                  textTransform: "none",
                  color: "#666",
                  padding: { xs: "6px 12px", sm: "12px 16px" },
                  minHeight: { xs: "36px", sm: "48px" },
                  minWidth: { xs: "50px", sm: "auto" },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    color: "#8BD3E6",
                  },
                },
                "& .Mui-selected": {
                  color: "#8BD3E6 !important",
                  fontWeight: "normal",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#8BD3E6",
                },
                "& .MuiTabs-scrollableX": {
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none",
                },
                "& .MuiTabs-flexContainer": {
                  justifyContent: { xs: "center", sm: "flex-start" },
                  padding: { xs: "0 12px", sm: "0" },
                },
              }}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              {loading ? (
                // Show skeleton tabs while loading
                Array(5).fill(0).map((_, i) => (
                  <Tab 
                    key={i}
                    label={
                      <Skeleton 
                        variant="text" 
                        width={60} 
                        height={24} 
                        sx={{ bgcolor: "#f0f0f0" }} 
                      />
                    } 
                  />
                ))
              ) : (
                // Show actual tabs when loaded
                getTabs().map((tab) => (
                  <Tab key={tab.tabId} label={getTabLabel(tab.name)} />
                ))
              )}
            </Tabs>
  
            {/* Form and Tab Content */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, pl: { xs: 0, sm: 4 }, maxWidth: "100%" }}>
              {/* Show skeleton while loading, actual content when loaded */}
              {loading ? (
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {Array(4).fill(0).map((_, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Skeleton 
                          variant="rectangular" 
                          height={56} 
                          sx={{ borderRadius: 1, mb: 2 }} 
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                renderTabContent()
              )}
  
              {/* Dialog for messages */}
              <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                PaperProps={dialogStyles.dialog.PaperProps}
                aria-labelledby={dialogStyles.dialog.aria.labelledby}
                aria-describedby={dialogStyles.dialog.aria.describedby}
              >
                <DialogTitle id="alert-dialog-title" sx={dialogStyles.title.sx}>
                  {dialogTitle}
                </DialogTitle>
  
                <DialogContent sx={dialogStyles.content.sx}>
                  <DialogContentText
                    id="alert-dialog-description"
                    sx={dialogStyles.contentText.sx}
                  >
                    {dialogMessage}
                  </DialogContentText>
                </DialogContent>
  
                <DialogActions sx={dialogStyles.actions.sx}>
                  {[
                    "Prediction Complete",
                    "Missing Required Fields",
                    "Error",
                    "Uploaded",
                  ].includes(dialogTitle) ? (
                    <Button
                      onClick={handleCloseDialog}
                      variant="contained"
                      sx={{
                        ...dialogStyles.button.common,
                        ...dialogStyles.button.close,
                      }}
                    >
                      Close
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate("/clerk-homepage")}
                      variant="contained"
                      sx={{
                        ...dialogStyles.button.common,
                        ...dialogStyles.button.close,
                      }}
                    >
                      Go to Homepage
                    </Button>
                  )}
                </DialogActions>
              </Dialog>
  
              {/* Form Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  mt: 3,
                  mb: 2,
                  gap: { xs: 2, sm: 3 }
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  type="submit"
                  sx={{
                    ...buttonStyles,
                    width: { xs: "95%", sm: "auto" },
                  }}
                >
                  Save Metadata
                </Button>
                {!loading && tabIndex < getTabs().length - 1 && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleNext}
                    sx={{
                      ...buttonStyles,
                      width: { xs: "95%", sm: "auto" },
                    }}
                  >
                    Next Tab
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }