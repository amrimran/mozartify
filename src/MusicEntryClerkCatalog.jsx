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
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
    overflow-x: hidden; // Prevent horizontal scrolling
    

  }
`;

const formStyles = {
  mb: 2,
  fontFamily: "Montserrat",
  "& .MuiInputBase-root": {
    fontFamily: "Montserrat",
  },
  "& .MuiFormLabel-root": {
    fontFamily: "Montserrat",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "& fieldset": {
      borderColor: "rgba(0,0,0,0.23)",
    },
    "&:hover fieldset": {
      borderColor: "#8BD3E6",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#8BD3E6",
    },
  },
  width: "90%",
};

const buttonStyles = {
  px: 10,
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
  },
  "&:disabled": {
    backgroundColor: "#E0E0E0",
    borderColor: "#E0E0E0",
    color: "#9E9E9E",
  },
};

const dialogStyles = {
  dialogPaper: {
    borderRadius: "16px",
    padding: "20px",
    fontFamily: "Montserrat",
  },
  title: {
    fontFamily: "Montserrat",
    fontWeight: "bold",
    fontSize: "20px",
    textAlign: "center",
  },
  content: {
    fontFamily: "Montserrat",
    textAlign: "center",
  },
  contentText: {
    fontFamily: "Montserrat",
    fontSize: "16px",
    color: "#555",
  },
  actions: {
    justifyContent: "center",
    gap: "12px",
    marginTop: "8px",
  },
  button: {
    textTransform: "none",
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#8BD3E6",
    border: "1px solid #8BD3E6",
    borderRadius: "8px",
    padding: "8px 24px",
    "&:hover": {
      backgroundColor: "#6FBCCF",
      borderColor: "#6FBCCF",
    },
  },
  deletebutton: {
    textTransform: "none",
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#DB2226",
    border: "1px solid #DB2226",
    borderRadius: "8px",
    padding: "8px 24px",
    "&:hover": {
      backgroundColor: "#B71C1C",
      borderColor: "#B71C1C",
    },
  },
};

export default function MusicEntryClerkCatalog() {
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
  const [catalogData, setCatalogData] = useState({
    filename: "",
    albums: "",
    alternativeTitle: "",
    artist: "",
    backgroundResources: "",
    callNumber: "",
    collection: "",
    composer: "",
    composerTimePeriod: "",
    contributor: "",
    copyright: "",
    cosmeticsAndProp: "",
    country: "",
    coverImageUrl: "",
    creator: "",
    dateAccessioned: "",
    dateAvailable: "",
    dateIssued: "",
    dateOfBirth: "",
    dateOfComposition: "",
    dateOfCreation: "",
    dateOfRecording: "",
    dateUploaded: "",
    description: "",
    digitalCollection: "",
    edition: "",
    editor: "",
    element: "",
    ethnicGroup: "",
    firstPublication: "",
    format: "",
    gamutScale: "",
    genre: "",
    historicalContext: "",
    identifier: "",
    instrumentation: "",
    intonation: "",
    key: "",
    language: "",
    lastModified: "",
    length: "",
    librettist: "",
    lyrics: "",
    melodicClassification: "",
    melodyDescriptions: "",
    methodOfImplementation: "",
    miscNotes: "",
    movementsSections: "",
    mp3FileUrl: "",
    mp3FileName: "",
    notation: "",
    numberInPublication: "",
    objectCollections: "",
    occasionOfPerforming: "",
    performingSkills: "",
    permalink: "",
    pieceStyle: "",
    placeOfBirth: "",
    placeOfOrigin: "",
    placeOfProsper: "",
    placeOfResidence: "",
    position: "",
    prevalence: "",
    price: "",
    publisher: "",
    purposeOfCreation: "",
    recordingPerson: "",
    region: "",
    relatedArtists: "",
    relatedWork: "",
    rights: "",
    sheetMusic: "",
    sponsor: "",
    stagePerformance: "",
    subject: "",
    targetAudience: "",
    temperament: "",
    timeOfOrigin: "",
    timeOfProsper: "",
    title: "",
    trackFunction: "",
    tracks: "",
    type: "",
    uri: "",
    vocalStyle: "",
    westernParallel: "",
    workTitle: "",
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Define loading state

  // Fetch current user data
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

  // Fetch catalog data if fileName exists
  useEffect(() => {
    if (fileName) {
      const fetchCatalogData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3001/catalog/${fileName}`
          );
          if (response.data) {
            console.log("Fetched data:", response.data); // Log the fetched data
            setCatalogData(response.data); // Populate the form with existing data
            setOriginalData(response.data); // Store original data
            setCoverImageUrl(response.data.coverImageUrl); // Set cover image URL from database
          }
        } catch (error) {
          console.error("Error fetching catalog data:", error);
        }
      };

      fetchCatalogData();
    }
  }, [fileName]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Add function to check for changes
  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(catalogData) !== JSON.stringify(originalData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCatalogData((prevData) => ({
      ...prevData,
      [name]: value, // Ensure empty fields are sent as empty strings
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
    if (tabIndex <= 9) {
      setTabIndex((prevIndex) => prevIndex + 1);
    }
  };

  useEffect(() => {}, [openDialog, dialogTitle, dialogMessage]);

  // Modify handleCoverImageChange
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
        emotion: "", // Clear previous emotion
        genre: "", // Clear previous genre
        //instrumentation: "", // Clear previous instrument predictions
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
        emotion: emotionResponse.data.predicted_mood, // Update emotion field
      }));

      // Call gender prediction API
      const genderResponse = await axios.post(
        "http://127.0.0.1:9000/predict-gender",
        { file_url: fileUrl }
      );

      // Update catalogData with the predicted gender
      setCatalogData((prevData) => ({
        ...prevData,
        gender: genderResponse.data.gender, // Assuming the prediction is an array, e.g., ['male', 'female', ...]
      }));

      // Call genre prediction API
      const genreResponse = await axios.post(
        "http://127.0.0.1:8001/predict-genre",
        { fileUrl }
      );

      // Update catalogData with the new genre
      setCatalogData((prevData) => ({
        ...prevData,
        genre: genreResponse.data.genre, // Update genre field
      }));

      // // Call instrument prediction API
      // const instrumentResponse = await axios.post(
      //   "http://127.0.0.1:8000/predict-instrument",
      //   {
      //     fileUrl: fileUrl, // The URL of the MP3 file from Firebase
      //   }
      // );

      // // Update catalogData with the predicted instrumentation
      // setCatalogData((prevData) => ({
      //   ...prevData,
      //   instrumentation: instrumentResponse.data.top_instruments, // Update instrumentation field
      // }));

      setDialogTitle("Prediction Complete");
      setDialogMessage("File uploaded and predictions completed successfully!");
      setIsSuccess(true);
      setOpenDialog(true);
    } catch (error) {
      console.error(
        "Error uploading MP3 or predicting emotion/gender/genre/instrument:",
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

  // Add this validation function before the handleSubmit function
  const validateRequiredFields = (data) => {
    const requiredFields = {
      title: "Title",
      artist: "Artist",
      composer: "Composer",
      price: "Price",
      collection: "Collection",
      dateUploaded: "Date Uploaded",
      emotion: "Emotion",
      genre: "Genre",
    };

    const missingFields = [];

    // Check each required field
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!data[field] || data[field].trim() === "") {
        missingFields.push(label);
      }
    });

    // Price validation
    if (data.price && (isNaN(data.price) || parseFloat(data.price) <= 0)) {
      missingFields.push("Valid Price (must be greater than 0)");
    }

    return missingFields;
  };

  // Update the handleSubmit function
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
      const response = await fetch("http://localhost:3001/catalog", {
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

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex" }}>
        <Box
          sx={{
            width: "225px",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            backgroundColor: "#8BD3E6",
            overflowY: "auto",
          }}
        >
          <ClerkSidebar active="catalogMetadata" />
        </Box>
        <Box sx={{ flexGrow: 1, ml: "225px", p: 3 }}>
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
              gutterBottom
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                mt: 4,
                ml: 1,
              }}
            >
              Catalog Metadata
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body1"
                sx={{ mr: 2, fontFamily: "Montserrat" }}
              >
                {user ? user?.username : "User"}
              </Typography>
              <Avatar
                alt={user?.username}
                src={
                  user && user?.profile_picture ? user?.profile_picture : null
                }
              >
                {(!user || !user?.profile_picture) &&
                  user?.username.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="catalog tabs"
            sx={{
              mb: 3,
              fontFamily: "Montserrat",
              overflowX: "auto",
              "& .MuiTab-root": {
                fontFamily: "Montserrat",
                textTransform: "none", // Prevents all caps
                color: "#666", // Default color for tabs
                "&:hover": {
                  color: "#8BD3E6", // Hover color
                },
              },
              "& .Mui-selected": {
                color: "#8BD3E6 !important", // Force the active color to override defaults
                fontWeight: "normal", // Ensures the active tab is not bold
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#8BD3E6", // Active tab indicator color
              },
            }}
            variant="scrollable" // Enables scrolling for tabs
            scrollButtons="auto" // Shows scroll buttons when needed
          >
            <Tab label="Identification" />
            <Tab label="Creators" />
            <Tab label="Dates" />
            <Tab label="Content" />
            <Tab label="Format" />
            <Tab label="Rights" />
            <Tab label="Geography" />
            <Tab label="Performance" />
            <Tab label="Related Work" />
            <Tab label="Cover Image" />
            <Tab label="MP3 File" />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, pl: 4 }}>
            <Grid container spacing={1}>
              {tabIndex === 0 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="title"
                      label="Title"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      name="artist"
                      label="Artist"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.artist}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      name="composer"
                      label="Composer"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.composer}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      name="price"
                      label="Price"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.price}
                      onChange={handleInputChange}
                
                      InputProps={{
                        startAdornment: (
                          <InputAdornment
                            position="start"
                            sx={{ fontFamily: "Montserrat" }}
                          >
                            RM
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="albums"
                      label="Album"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.albums}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="instrumentation"
                      label="Instrumentation"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.instrumentation || ""}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      variant="outlined"
                      fullWidth
                      sx={{
                        ...formStyles,
                        "& .MuiInputBase-root": {
                          fontFamily: "Montserrat", // Apply Montserrat font
                        },
                        "& .MuiInputLabel-root": {
                          fontFamily: "Montserrat", // Apply Montserrat font to the label
                        },
                      }}
                      required
                    >
                      <InputLabel id="collection-label">Collection</InputLabel>
                      <Select
                        labelId="collection-label"
                        name="collection"
                        value={catalogData.collection}
                        onChange={handleInputChange}
                        label="Collection"
                        required
                      >
                        <MenuItem
                          value="Student"
                          sx={{ fontFamily: "Montserrat" }}
                        >
                          Student
                        </MenuItem>
                        <MenuItem
                          value="Lecturers"
                          sx={{ fontFamily: "Montserrat" }}
                        >
                          Lecturers
                        </MenuItem>
                        <MenuItem
                          value="Freelancers"
                          sx={{ fontFamily: "Montserrat" }}
                        >
                          Freelancers
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date Uploaded"
                        value={
                          catalogData.dateUploaded
                            ? new Date(catalogData.dateUploaded)
                            : null
                        }
                        onChange={(newValue) => {
                          handleInputChange({
                            target: {
                              name: "dateUploaded",
                              value: newValue ? newValue.toISOString() : "",
                            },
                          });
                        }}
                        format="dd/MM/yyyy" // Ensures the date is displayed in dd/MM/yyyy format
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            required: true, // Makes the field required
                            sx: formStyles,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </>
              )}
              {tabIndex === 1 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="identifier"
                      label="Identifier"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.identifier}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="composerTimePeriod"
                      label="Composer Time Period"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.composerTimePeriod}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="contributor"
                      label="Contributor"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.contributor}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="creator"
                      label="Creator"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.creator}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="editor"
                      label="Editor"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.editor}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="librettist"
                      label="Librettist"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.librettist}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="recordingPerson"
                      label="Recording Person"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.recordingPerson}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="element"
                      label="Element"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.element}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 2 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date Accessioned"
                        value={
                          catalogData.dateAccessioned
                            ? new Date(catalogData.dateAccessioned)
                            : null
                        }
                        onChange={(newValue) => {
                          handleInputChange({
                            target: {
                              name: "dateAccessioned",
                              value: newValue.toISOString(),
                            },
                          });
                        }}
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            sx: formStyles,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date Available"
                        value={
                          catalogData.dateAvailable
                            ? new Date(catalogData.dateAvailable)
                            : null
                        }
                        onChange={(newValue) => {
                          handleInputChange({
                            target: {
                              name: "dateAvailable",
                              value: newValue.toISOString(),
                            },
                          });
                        }}
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            sx: formStyles,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date Issued"
                        value={
                          catalogData.dateIssued
                            ? new Date(catalogData.dateIssued)
                            : null
                        }
                        onChange={(newValue) => {
                          handleInputChange({
                            target: {
                              name: "dateIssued",
                              value: newValue.toISOString(),
                            },
                          });
                        }}
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            sx: formStyles,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date of Birth"
                        value={
                          catalogData.dateOfBirth
                            ? new Date(catalogData.dateOfBirth)
                            : null
                        }
                        onChange={(newValue) => {
                          handleInputChange({
                            target: {
                              name: "dateOfBirth",
                              value: newValue.toISOString(),
                            },
                          });
                        }}
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            sx: formStyles,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date of Composition"
                        value={
                          catalogData.dateOfComposition
                            ? new Date(catalogData.dateOfComposition)
                            : null
                        }
                        onChange={(newValue) => {
                          handleInputChange({
                            target: {
                              name: "dateOfComposition",
                              value: newValue.toISOString(),
                            },
                          });
                        }}
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            sx: formStyles,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date of Creation"
                        value={
                          catalogData.dateOfCreation
                            ? new Date(catalogData.dateOfCreation)
                            : null
                        }
                        onChange={(newValue) => {
                          handleInputChange({
                            target: {
                              name: "dateOfCreation",
                              value: newValue.toISOString(),
                            },
                          });
                        }}
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            sx: formStyles,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date of Recording"
                        value={
                          catalogData.dateOfRecording
                            ? new Date(catalogData.dateOfRecording)
                            : null
                        }
                        onChange={(newValue) => {
                          handleInputChange({
                            target: {
                              name: "dateOfRecording",
                              value: newValue.toISOString(),
                            },
                          });
                        }}
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            sx: formStyles,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Last Modified"
                        value={
                          catalogData.lastModified
                            ? new Date(catalogData.lastModified)
                            : null
                        }
                        onChange={(newValue) => {
                          handleInputChange({
                            target: {
                              name: "lastModified",
                              value: newValue.toISOString(),
                            },
                          });
                        }}
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            sx: formStyles,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </>
              )}
              {tabIndex === 3 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="description"
                      label="Description"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.description}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="lyrics"
                      label="Lyrics"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.lyrics}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="subject"
                      label="Subject"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.subject}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="historicalContext"
                      label="Historical Context"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.historicalContext}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="backgroundResources"
                      label="Background Resources"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.backgroundResources}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="methodOfImplementation"
                      label="Method of Implementation"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.methodOfImplementation}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="miscNotes"
                      label="Misc Notes"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.miscNotes}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="melodicClassification"
                      label="Melodic Classification"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.melodicClassification}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="melodyDescriptions"
                      label="Melody Descriptions"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.melodyDescriptions}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="movementsSections"
                      label="Movements"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.movementsSections}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 4 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="format"
                      label="Format"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.format}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="edition"
                      label="Edition"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.edition}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="length"
                      label="Length"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.length}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="gamutScale"
                      label="Gamut Scale"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.gamutScale}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="digitalCollection"
                      label="Digital Collection"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.digitalCollection}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="notation"
                      label="Notation"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.notation}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="cosmeticsAndProp"
                      label="Cosmetics and Prop"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.cosmeticsAndProp}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="language"
                      label="Language"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.language}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 5 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="alternativeTitle"
                      label="Alternative Title"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.alternativeTitle}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="copyright"
                      label="Copyright"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.copyright}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="rights"
                      label="Rights"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.rights}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="sponsor"
                      label="Sponsor"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.sponsor}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="publisher"
                      label="Publisher"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.publisher}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="firstPublication"
                      label="First Publication"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.firstPublication}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="callNumber"
                      label="Call Number"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.callNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="numberInPublication"
                      label="Number in Publication"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.numberInPublication}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 6 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="placeOfBirth"
                      label="Place of Birth"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.placeOfBirth}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="placeOfOrigin"
                      label="Place of Origin"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.placeOfOrigin}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="placeOfResidence"
                      label="Place of Residence"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.placeOfResidence}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="placeOfProsper"
                      label="Place of Prosper"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.placeOfProsper}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="region"
                      label="Region"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.region}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="country"
                      label="Country"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.country}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="ethnicGroup"
                      label="Ethnic Group"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.ethnicGroup}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="targetAudience"
                      label="Target Audience"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.targetAudience}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 7 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="performingSkills"
                      label="Performing Skills"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.performingSkills}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="pieceStyle"
                      label="Piece Style"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.pieceStyle}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="occasionOfPerforming"
                      label="Occasion of Performing"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.occasionOfPerforming}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="stagePerformance"
                      label="Stage Performance"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.stagePerformance}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="vocalStyle"
                      label="Vocal Style"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.vocalStyle}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="trackFunction"
                      label="Track Function"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.trackFunction}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="tracks"
                      label="Tracks"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.tracks}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="objectCollections"
                      label="Object Collections"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.objectCollections}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="key"
                      label="Key"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.key}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="intonation"
                      label="Intonation"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.intonation}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="sheetMusic"
                      label="Sheet Music"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.sheetMusic}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="uri"
                      label="URI"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.uri}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 8 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="relatedArtists"
                      label="Related Artists"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.relatedArtists}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="relatedWork"
                      label="Related Work"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.relatedWork}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="workTitle"
                      label="Work Title"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.workTitle}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="temperament"
                      label="Temperament"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.temperament}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="westernParallel"
                      label="Western Parallel"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.westernParallel}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="prevalence"
                      label="Prevalence"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.prevalence}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="purposeOfCreation"
                      label="Purpose of Creation"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.purposeOfCreation}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="position"
                      label="Position"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.position}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="timeOfOrigin"
                      label="Time of Origin"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.timeOfOrigin}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="timeOfProsper"
                      label="Time of Prosper"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.timeOfProsper}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="permalink"
                      label="Permalink"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.permalink}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            {tabIndex === 9 && (
              <>
                <Grid item xs={12} sm={8}>
                  <Card
                    variant="outlined"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 3,
                      borderRadius: 2,
                      borderColor: "#8BD3E6",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
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
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Slight shadow for image
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
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Slight shadow for placeholder
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
                      sx={{
                        ...buttonStyles,
                        boxShadow: "none",
                      }}
                    >
                      {coverImageUrl ? "Change Image" : "Upload Image"}
                      <input
                        type="file"
                        accept=".jpg, .jpeg, .png" // Only allow JPG, JPEG, and PNG file types
                        hidden
                        onChange={handleCoverImageChange}
                      />
                    </Button>
                  </Card>
                </Grid>
              </>
            )}
            {tabIndex === 10 && (
              <Grid container spacing={4} justifyContent="center">
                {/* MP3 Upload Card on the Left */}
                <Grid item xs={12} sm={5} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 3,
                      borderRadius: 3,
                      borderColor: "#8BD3E6",
                      boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
                      textAlign: "center",
                      position: "relative", // Important for overlay positioning
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
                      sx={{
                        ...buttonStyles,
                        boxShadow: "none",
                      }}
                    >
                      {catalogData.mp3FileUrl ? "Change MP3" : "Upload MP3"}
                      <input
                        type="file"
                        hidden
                        accept="audio/mp3"
                        onChange={handleMp3FileChange}
                      />
                    </Button>

                    {/* Backdrop for loading spinner */}
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
                        bgcolor: "rgba(0, 0, 0, 0.6)", // Darker backdrop with opacity
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

                <Grid item xs={12} sm={7} md={4}>
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
            )}
            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              PaperProps={{ sx: dialogStyles.dialogPaper }}
            >
              <DialogTitle sx={dialogStyles.title}>{dialogTitle}</DialogTitle>
              <DialogContent sx={dialogStyles.content}>
                <DialogContentText sx={dialogStyles.contentText}>
                  {dialogMessage}
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={dialogStyles.actions}>
                {dialogTitle === "Prediction Complete" ||
                dialogTitle === "Missing Required Fields" ||
                dialogTitle === "Error" ||
                dialogTitle === "Uploaded" ? (
                  // For prediction success - only show Close button
                  <Button onClick={handleCloseDialog} sx={dialogStyles.button}>
                    CLOSE
                  </Button>
                ) : (
                  // For save success - only show Proceed to Homepage button
                  <Button
                    onClick={() => navigate("/clerk-homepage")}
                    sx={dialogStyles.button}
                  >
                    GO TO HOMEPAGE
                  </Button>
                )}
              </DialogActions>
            </Dialog>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                type="submit"
                sx={{
                  ...buttonStyles,
                }}
              >
                Save Metadata
              </Button>
              {tabIndex < 10 && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleNext}
                  sx={{ ...buttonStyles, ml: 2 }}
                >
                  Next Tab
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
