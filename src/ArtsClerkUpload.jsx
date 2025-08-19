import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Avatar,
  Typography,
  Button,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./ArtsClerkSidebar";
import ImportIcon from "./assets/import-icon.png";
import { storage, ref, uploadBytesResumable, getDownloadURL } from "./firebase";
import { API_BASE_URL} from './config/api.js';

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

const buttonStyles = {
  px: { xs: 4, sm: 10 },
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

const buttonStyles2 = {
  px: { xs: 4, sm: 10 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFB6C1",
  backgroundColor: "#FFFFFF",
  border: "1px solid #FFB6C1",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#FFF0F2",
    color: "#FFA0B3",
    borderColor: "#FFA0B3",
    boxShadow: "none",
  },
};

export default function ArtsClerkUpload() {
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery(customTheme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(customTheme.breakpoints.between("sm", "lg"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

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
      ml: isLargeScreen ? 1 : 0, // Set margin-left to 0 for large screens
      mt: isLargeScreen ? 2 : 8,
      width: "100%", // Ensure full width on large screens
    },
    uploadBox: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "calc(100vh - 200px)",
      width: "100%",
      mt: { xs: 2, sm: 5 },
    },
    uploadContainer: {
      textAlign: "center",
      border: "2px solid #FFB6C1",
      borderRadius: 8,
      padding: { xs: 2, sm: 4 },
      width: { xs: "90%", sm: "60%", md: "40%" },
      maxWidth: "500px",
    },
    importIcon: {
      width: { xs: "60px", sm: "100px" },
      height: { xs: "60px", sm: "100px" },
    },
    previewImage: {
      width: "100%",
      maxWidth: "200px",
      height: "auto",
      margin: "10px auto",
      borderRadius: "8px",
      border: "1px solid #FFB6C1",
    },
  };

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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const acceptedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];

    if (file && acceptedFileTypes.includes(file.type)) {
      setSelectedFile(file);
      setUploadMessage("");

      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setDialogMessage(
        "Please select a valid image file (jpg, jpeg, png, gif, webp)."
      );
      setDialogOpen(true);
      setSelectedFile(null);
      setUploadedImageUrl("");
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setDialogMessage("Please select a file first!");
      setDialogOpen(true);
      return;
    }
  
    setIsUploading(true);
    setUploadProgress(0);
  
    // Firebase upload logic
    const storageRef = ref(storage, `artworks/${Date.now()}_${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);
  
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Track upload progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        // Handle errors
        setIsUploading(false);
        setDialogMessage("Error uploading file. Please try again.");
        setDialogOpen(true);
        console.error("Error uploading file:", error);
      },
      async () => {
        // Upload completed successfully
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
  
        // Save artwork metadata to the backend
        try {
          const response = await axios.post(`${API_BASE_URL}/catalogArts`, {
            imageUrl: downloadURL,
          });
  
          // Navigate to the Catalog Page with the artwork ID
          navigate(`/arts-clerk-catalog/${response.data._id}`, {
            state: {
              imageUrl: downloadURL,
            },
          });
        } catch (error) {
          console.error("Error saving artwork metadata:", error);
          setDialogMessage("Error saving artwork metadata. Please try again.");
          setDialogOpen(true);
        } finally {
          setIsUploading(false);
        }
      }
    );
  };
  
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
              Upload Artwork
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
          <ClerkSidebar active="upload" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <ClerkSidebar active="upload" />
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
                  Upload Artwork
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

          {/* Upload Section */}
          <Box sx={styles.uploadBox}>
            <Box sx={styles.uploadContainer}>
              <img
                src={ImportIcon}
                alt="Import Icon"
                style={{
                  width: isMobile ? "60px" : "100px",
                  height: isMobile ? "60px" : "100px",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                  fontFamily: "Montserrat",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                Upload Artwork Image
              </Typography>

              {uploadedImageUrl && (
                <img
                  src={uploadedImageUrl}
                  alt="Preview"
                  style={styles.previewImage}
                />
              )}

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="upload-button"
              />

              <label htmlFor="upload-button">
                <Button
                  variant="contained"
                  component="span"
                  fullWidth
                  sx={{ mt: 3, ...buttonStyles }}
                >
                  Choose Image
                </Button>
              </label>

              {selectedFile && (
                <>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 2,
                      ...buttonStyles2,
                      "&.Mui-disabled": {
                        backgroundColor: "#D3D3D3",
                        color: "#A9A9A9",
                        border: "1px solid #D3D3D3",
                      },
                    }}
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    Upload to Gallery
                  </Button>
                  {isUploading && (
                    <Box sx={{ width: "100%", mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        sx={{
                          backgroundColor: "#FFE5E5",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: "#FFB6C1",
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, fontSize: "0.8rem" }}
                      >
                        {Math.round(uploadProgress)}% Uploaded
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              {uploadMessage && (
                <Typography
                  variant="body1"
                  sx={{
                    mt: 2,
                    color: "red",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  {uploadMessage}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              padding: "16px",
              width: { xs: "90%", sm: "auto" },
              maxWidth: { xs: "90%", sm: 400 },
            },
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: "Montserrat",
              fontWeight: "bold",
              fontSize: { xs: "18px", sm: "20px" },
              textAlign: "center",
            }}
          >
            Attention
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              sx={{
                fontFamily: "Montserrat",
                fontSize: { xs: "14px", sm: "16px" },
                color: "#555",
                textAlign: "center",
              }}
            >
              {dialogMessage}
            </DialogContentText>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              gap: "12px",
              mt: 1,
              pb: 2,
            }}
          >
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{
                ...buttonStyles,
                borderRadius: "8px",
                px: { xs: 3, sm: 4 },
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
