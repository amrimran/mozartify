import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  LinearProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./ArtsClerkSidebar";
import { storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import { Menu as MenuIcon } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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
    display: "block",
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
      color: "#FFA0B3", // Label color on focus
    },
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "& fieldset": {
      borderColor: "#FFB6C1", // Default border color
    },
    "&:hover fieldset": {
      borderColor: "#FFA0B3", // Border color on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#FFA0B3", // Border color on focus
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
  backgroundColor: "#FFB6C1",
  border: "1px solid #FFB6C1",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#FFA0B3",
    borderColor: "#FFA0B3",
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
      backgroundColor: "#FFB6C1",
      color: "white",
      "&:hover": {
        backgroundColor: "#FFA0B3",
        boxShadow: "none",
      },
    },
  },
};

export default function ArtsClerkCatalog() {
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [catalogData, setCatalogData] = useState({
    filename: "",
    title: "",
    artist: "",
    price: "",
    collection: "",
    dateUploaded: "",
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Define loading state
  const { id: artworkId } = useParams(); // Get the ID from the URL and rename it to `artworkId`

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

  useEffect(() => {
    if (artworkId) {
      const fetchCatalogData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3001/catalogArts/${artworkId}`
          );
          if (response.data) {
            setCatalogData(response.data);
            setOriginalData(response.data);

            // If imageUrl is passed from upload page, handle it here
            const { state } = location;
            if (state && state.imageUrl) {
              setCatalogData((prev) => ({
                ...prev,
                imageUrl: state.imageUrl,
                dateUploaded: state.uploadTime || prev.dateUploaded,
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching catalog data:", error);
        }
      };

      fetchCatalogData();
    }
  }, [fileName, location]);

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
    if (tabIndex < tabLabels.length - 1) {
      setTabIndex((prevIndex) => prevIndex + 1);
    }
  };

  useEffect(() => {}, [openDialog, dialogTitle, dialogMessage]);

  // validation function
  const validateRequiredFields = (data) => {
    const requiredFields = {
      title: "Title",
      artist: "Artist",
      price: "Price",
      dateUploaded: "Date Uploaded",
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
      // Include the _id in the data to submit
      const dataToSubmit = {
        ...catalogData,
        _id: artworkId, // Use the ID from the URL
      };

      console.log("Attempting to submit data:", dataToSubmit);

      // Use the existing POST endpoint that's configured to handle updates
      const response = await fetch("http://localhost:3001/catalogArts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Failed to save data: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      console.log("Server response data:", responseData);

      setOriginalData(dataToSubmit);
      setDialogTitle("Success");
      setDialogMessage("Data saved successfully.");
      setIsSuccess(true);
      setOpenDialog(true);
    } catch (error) {
      console.error("Full submission error details:", error);

      setDialogTitle("Error");
      setDialogMessage(`Failed to save data: ${error.message}`);
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
        default:
          return fullLabel;
      }
    }
    return fullLabel;
  };

  // Tab labels array for easier management
  const tabLabels = ["Identification", "Date", "Image"];

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Box
        sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#FFFFFF" }}
      >
        {/* Mobile AppBar */}
        <AppBar
          position="fixed"
          sx={{
            display: { lg: "none" },
            backgroundColor: "#FFFFFF",
            boxShadow: "none",
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <Toolbar>
            {/* Menu Button */}
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
                  color: "#FFB6C1",
                },
              },
              "& .Mui-selected": {
                color: "#FFB6C1 !important",
                fontWeight: "normal",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#FFB6C1",
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
            {tabLabels.map((label, index) => (
              <Tab
                key={index}
                label={getTabLabel(label)}
                sx={{
                  display: isMobile && tabIndex !== index ? "none" : "block",
                  whiteSpace: "nowrap",
                }}
              />
            ))}
          </Tabs>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, pl: 4 }}>
            <Grid
              container
              spacing={2}
              direction={isMobile ? "column" : "row"} // Stacked for mobile
            >
              {" "}
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
                    <FormControl
                      variant="outlined"
                      fullWidth
                      sx={{
                        ...formStyles,
                        mb: 2,
                        width: isMobile ? "90%" : "90%", // Adjust width based on isMobile
                        "& .MuiInputBase-root": {
                          fontFamily: "Montserrat", // Apply Montserrat font
                          "& fieldset": {
                            borderColor: "#FFB6C1", // Default border color
                          },
                          "&:hover fieldset": {
                            borderColor: "#FFA0B3", // Border color on hover
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FFA0B3", // Border color on focus
                          },
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
                        sx={{
                          fontFamily: "Montserrat", // Apply font family to select
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFB6C1", // Default border color
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFA0B3", // Border color on hover
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFA0B3", // Border color on focus
                          },
                          "& .MuiSvgIcon-root": {
                            color: "#FFB6C1", // Dropdown arrow color
                          },
                          "&.Mui-focused .MuiSvgIcon-root": {
                            color: "#FFA0B3", // Arrow color on focus
                          },
                        }}
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
                </>
              )}
              {tabIndex === 1 && (
                <>
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
                        format="dd/MM/yyyy"
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            required: true,
                            sx: formStyles,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </>
              )}
              {tabIndex === 2 && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {/* Display the uploaded image */}
                    {catalogData.imageUrl && (
                      <img
                        src={catalogData.imageUrl}
                        alt="Uploaded Artwork"
                        style={{
                          width: "100%",
                          maxWidth: "300px",
                          height: "auto",
                          borderRadius: "8px",
                          border: "1px solid #FFB6C1",
                        }}
                      />
                    )}
                    {/* Progress indicator */}
                    {loading && (
                      <Box sx={{ width: "100%", maxWidth: "300px", mt: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, textAlign: "center" }}
                        >
                          Uploading... {Math.round(uploadProgress)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={uploadProgress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#FFE5E5",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: "#FFB6C1",
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                    )}

                    {/* Button to change the image */}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setLoading(true); // Show loading state

                          // Upload the file to Firebase Storage
                          const storageRef = ref(
                            storage,
                            `artworks/${Date.now()}_${file.name}`
                          );
                          const uploadTask = uploadBytesResumable(
                            storageRef,
                            file
                          );

                          uploadTask.on(
                            "state_changed",
                            (snapshot) => {
                              // Track upload progress
                              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                              setUploadProgress(progress);
                            },
                            (error) => {
                              // Handle unsuccessful uploads
                              console.error("Error uploading image:", error);
                              setLoading(false);
                              showDialog(
                                "Upload Failed",
                                "Failed to upload the image. Please try again.",
                                false
                              );
                            },
                            async () => {
                              // Handle successful upload
                              try {
                                const downloadURL = await getDownloadURL(
                                  uploadTask.snapshot.ref
                                );

                                // Update the state with the new image URL
                                setCatalogData((prev) => ({
                                  ...prev,
                                  imageUrl: downloadURL,
                                }));

                                setLoading(false);
                                showDialog(
                                  "Image Updated",
                                  "The image has been successfully uploaded. Don't forget to save the metadata to apply all changes.",
                                  true
                                );
                              } catch (error) {
                                console.error(
                                  "Error getting download URL:",
                                  error
                                );
                                setLoading(false);
                                showDialog(
                                  "Upload Failed",
                                  "Failed to process the uploaded image. Please try again.",
                                  false
                                );
                              }
                            }
                          );
                        }
                      }}
                      style={{ display: "none" }}
                      id="change-image-button"
                    />
                    <label htmlFor="change-image-button">
                      <Button
                        variant="contained"
                        component="span"
                        disabled={loading}
                        sx={{
                          ...buttonStyles,
                          width: "200px",
                        }}
                      >
                        {loading ? "Uploading..." : "Change Image"}
                      </Button>
                    </label>
                  </Box>
                </Grid>
              )}
            </Grid>

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
                {["Missing Required Fields", "Error", "Image Updated"].includes(
                  dialogTitle
                ) ? (
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
                    onClick={() => navigate("/arts-clerk-homepage")}
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

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "flex-start",
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                type="submit"
                sx={{
                  ...buttonStyles,
                  mb: { xs: 2, sm: 0 },
                  width: { xs: "95%", sm: "auto" },
                }}
              >
                Save Metadata
              </Button>
              {tabIndex < 2 && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleNext}
                  sx={{
                    ...buttonStyles,
                    ml: { xs: 0, sm: 2 },
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
