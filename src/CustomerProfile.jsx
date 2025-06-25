import React, { useEffect, useState } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import {
  Box,
  Avatar,
  Typography,
  Container,
  IconButton,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  InputAdornment,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";
import Visibility from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import CustomerSidebar from "./CustomerSidebar";
import { createTheme, ThemeProvider } from "@mui/material/styles";

axios.defaults.withCredentials = true;
const API_BASE_URL = import.meta.env.VITE_API_URL;

const DRAWER_WIDTH = 230;

export default function CustomerProfile() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    content: "",
    confirmAction: () => {},
    confirmText: "",
    cancelText: "Cancel",
  });

  const navigate = useNavigate();

  // Theme creation
  const theme = createTheme({
    typography: {
      fontFamily: "Montserrat, Arial, sans-serif",
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& label": { fontFamily: "Montserrat" },
            "& input": { fontFamily: "Montserrat" },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: "Montserrat",
            textTransform: "none",
          },
        },
      },
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

  // Media query hooks
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ... Continued in next message ...

  // Styles
  const styles = {
    root: {
      display: "flex",
      backgroundColor: "#FFFFFF",
      minHeight: "100vh",
    },
    appBar: {
      display: isLargeScreen ? "none" : "block",
      backgroundColor: "#FFFFFF",
      boxShadow: "none",
      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
      // width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
      // ml: { sm: `${DRAWER_WIDTH}px` },
    },
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
      display: isLargeScreen ? "block" : "none",
      "& .MuiDrawer-paper": {
        // width: DRAWER_WIDTH,
        boxSizing: "border-box",
      },
    },
    mobileDrawer: {
      display: isLargeScreen ? "none" : "block",
      "& .MuiDrawer-paper": {
        // width: DRAWER_WIDTH,
        boxSizing: "border-box",
      },
    },
    mainContent: {
      flexGrow: 1,
      p: 3,
      // width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
      // ml: { sm: `${DRAWER_WIDTH}px` },
      mt: isLargeScreen ? 0 : 8,
    },
    menuButton: {
      color: "#3B3183",
      mr: 2,
      display: isLargeScreen ? "none" : "block",
    },
    avatar: {
      width: isMobile ? 120 : 150,
      height: isMobile ? 120 : 150,
      border: "4px solid #3B3183",
      backgroundColor: "#F2F2F5",
      color: "#3B3183",
      fontSize: isMobile ? 48 : 60,
    },
    contentContainer: {
      maxWidth: {
        xs: "100%",
        sm: "540px",
        md: "720px",
        lg: "960px",
      },
      px: isMobile ? 2 : 3,
    },
    button: {
      px: 4,
      py: 1.5,
      fontWeight: "bold",
      color: "#FFFFFF",
      backgroundColor: "#8BD3E6",
      boxShadow: "none",
      "&:hover": {
        boxShadow: "none",
        backgroundColor: "#6FBCCF",
      },
      width: isMobile ? "100%" : "auto",
      minWidth: !isMobile ? "250px" : undefined,
    },
    deleteButton: {
      px: 4,
      py: 1.5,
      fontWeight: "bold",
      color: "#FFFFFF",
      backgroundColor: "#DB2226",
      boxShadow: "none",
      "&:hover": {
        boxShadow: "none",
        backgroundColor: "#B71C1C",
      },
      width: isMobile ? "95%" : "250px",
    },
  };

  // Effect Hooks
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/current-user`);
        setCurrentUser(response.data);
        setUsername(response.data.username);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  // Event Handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // ... Continued in next message ...

  const showDialog = (config) => {
    setDialogConfig(config);
    setDialogOpen(true);
  };

  const handleUpdateUsername = async () => {
    try {
      await axios.put(`${API_BASE_URL}/user/update-username`, {
        username,
      });
      setCurrentUser((prev) => ({ ...prev, username }));
      showDialog({
        title: "Success",
        content: "Username updated successfully!",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    } catch (error) {
      showDialog({
        title: "Error",
        content: error.response?.data?.message || "Failed to update username",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      showDialog({
        title: "Error",
        content: "New passwords do not match.",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/user/change-password`, {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      showDialog({
        title: "Success",
        content: "Password updated successfully!",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    } catch (error) {
      showDialog({
        title: "Error",
        content: error.response?.data?.message || "Failed to update password",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    }
  };

  const handleUpdateProfilePicture = async () => {
    if (!profilePictureFile) return;

    try {
      const storageRef = ref(
        storage,
        `profile_pictures/${Date.now()}_${profilePictureFile.name}`
      );
      await uploadBytes(storageRef, profilePictureFile);
      const profilePictureUrl = await getDownloadURL(storageRef);

      await axios.put(`${API_BASE_URL}/user/update-profile-picture`, {
        profile_picture_url: profilePictureUrl,
      });

      setCurrentUser((prev) => ({
        ...prev,
        profile_picture: profilePictureUrl,
      }));
      setEditDialogOpen(false);
      showDialog({
        title: "Success",
        content: "Profile picture updated successfully!",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    } catch (error) {
      showDialog({
        title: "Error",
        content: "Failed to update profile picture",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      await axios.put(`${API_BASE_URL}/user/update-profile-picture`, {
        profile_picture_url: null,
      });

      setCurrentUser((prev) => ({ ...prev, profile_picture: null }));
      showDialog({
        title: "Success",
        content: "Profile picture removed successfully!",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    } catch (error) {
      showDialog({
        title: "Error",
        content: "Failed to remove profile picture",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    }
  };

  const handleDeleteAccount = () => {
    showDialog({
      title: "Delete Account",
      content:
        "Are you sure you want to delete your account? This action cannot be undone.",
      confirmText: "DELETE",
      cancelText: "CANCEL",
      confirmAction: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/user/delete`);
          showDialog({
            title: "Success",
            content: "Account deleted successfully.",
            confirmText: "OK",
            confirmAction: () => {
              setDialogOpen(false);
              navigate("/login");
            },
          });
        } catch (error) {
          showDialog({
            title: "Error",
            content: "Failed to delete account. Please try again.",
            confirmText: "OK",
            confirmAction: () => setDialogOpen(false),
          });
        }
      },
    });
  };

  // ... Continued in next message ...

  return (
    <ThemeProvider theme={theme}>
      <Box sx={styles.root}>
        {/* App Bar for mobile/tablet */}
        <AppBar position="fixed" sx={styles.appBar}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                edge="start"
                onClick={handleDrawerToggle}
                sx={styles.menuButton}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                sx={{ color: "#3B3183", fontWeight: "bold" }}
              >
                User Profile
              </Typography>
            </Box>

            {/* User info section */}
            {!isLargeScreen && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  sx={{
                    mr: 2,
                    color: "#3B3183",
                    display: { xs: "none", sm: "block" }, // Hide username on very small screens
                  }}
                >
                  {username}
                </Typography>
                <Avatar
                  alt={username}
                  src={currentUser?.profile_picture}
                  sx={{
                    width: 32,
                    height: 32,
                    border: "2px solid #3B3183",
                  }}
                >
                  {username.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Permanent drawer for large screens */}
        <Drawer variant="permanent" sx={styles.drawer} open>
          <CustomerSidebar active="profile" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <CustomerSidebar active="profile" />
        </Drawer>

        {/* Main content */}
        <Box component="main" sx={styles.mainContent}>
          {/* Header with user info */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            {isLargeScreen && (
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                User Profile
              </Typography>
            )}
            {isLargeScreen && (
              <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  {username}
                </Typography>
                <Avatar
                  alt={username}
                  src={currentUser?.profile_picture}
                  sx={{ width: 40, height: 40 }}
                >
                  {username.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Box>

          {isLargeScreen && <Divider sx={{ mb: 4 }} />}

          <Container sx={styles.contentContainer}>
            {/* Profile Picture Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
              }}
            >
              {!currentUser ? (
                <Skeleton
                  variant="circular"
                  width={styles.avatar.width}
                  height={styles.avatar.height}
                />
              ) : (
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    alt={username}
                    src={currentUser.profile_picture}
                    sx={styles.avatar}
                  >
                    {!currentUser.profile_picture &&
                      username.charAt(0).toUpperCase()}
                  </Avatar>
                  <IconButton
                    onClick={() => setEditDialogOpen(true)}
                    sx={{
                      position: "absolute",
                      bottom: "0%",
                      right: "5%",
                      backgroundColor: "#3B3183",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#2A2462",
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
              )}

              {/* Remove Picture Button */}
              <Button
                variant="text"
                color="error"
                onClick={handleRemoveProfilePicture}
                disabled={!currentUser?.profile_picture}
                sx={{
                  mt: 1,
                  opacity: currentUser?.profile_picture ? 1 : 0.5,
                }}
              >
                Remove Picture
              </Button>
            </Box>
            {/* // ... Continued in next message ... */}
            {/* Username Section */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">Update Username</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#6FBCCF", // Label color on focus
                    },
                    "& .MuiOutlinedInput-root": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8BD3E6", // Default border color
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6FBCCF", // Darker border on hover
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6FBCCF", // Darker border on focus
                      },
                    },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleUpdateUsername}
                    disabled={username === currentUser?.username}
                    sx={styles.button}
                  >
                    UPDATE USERNAME
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
            {/* Password Section */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">Change Password</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  label="Current Password"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#6FBCCF", // Label color on focus
                    },
                    "& .MuiOutlinedInput-root": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8BD3E6", // Default border color
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6FBCCF", // Darker border on hover
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6FBCCF", // Darker border on focus
                      },
                    },
                  }}
                />
                <TextField
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#6FBCCF", // Label color on focus
                    },
                    "& .MuiOutlinedInput-root": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8BD3E6", // Default border color
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6FBCCF", // Darker border on hover
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6FBCCF", // Darker border on focus
                      },
                    },
                  }}
                />
                <TextField
                  label="Confirm New Password"
                  type={showPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#6FBCCF", // Label color on focus
                    },
                    "& .MuiOutlinedInput-root": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8BD3E6", // Default border color
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6FBCCF", // Darker border on hover
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6FBCCF", // Darker border on focus
                      },
                    },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleUpdatePassword}
                    disabled={
                      !currentPassword || !newPassword || !confirmNewPassword
                    }
                    sx={styles.button}
                  >
                    UPDATE PASSWORD
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
            {/* // ... Continued in next message ... */}
            {/* Delete Account Button */}
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 3 }}
            >
              <Button
                variant="contained"
                onClick={handleDeleteAccount}
                sx={styles.deleteButton}
              >
                DELETE ACCOUNT
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Profile Picture Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "16px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Montserrat",
            fontWeight: "bold",
            fontSize: "20px",
            textAlign: "center",
          }}
        >
          Update Profile Picture
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Montserrat",
                fontSize: "0.875rem",
                color: "#666",
                textAlign: "center",
              }}
            >
              Choose an image to update your profile picture.
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePictureFile(e.target.files[0])}
              style={{
                border: "1px solid #ccc",
                padding: "8px 12px",
                borderRadius: "8px",
                fontFamily: "Montserrat",
                fontSize: "0.875rem",
                cursor: "pointer",
                outline: "none",
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{
              px: 3,
              borderRadius: "8px",
              fontFamily: "Montserrat",
              fontWeight: "bold",
              color: "#8BD3E6",
              backgroundColor: "#FFFFFF",
              border: "1px solid #8BD3E6",
              "&:hover": {
                backgroundColor: "#E6F8FB",
                color: "#7AB9C4",
                borderColor: "#7AB9C4",
              },
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleUpdateProfilePicture}
            sx={{
              px: 3,
              borderRadius: "8px",
              fontFamily: "Montserrat",
              fontWeight: "bold",
              color: "#FFFFFF",
              backgroundColor: "#8BD3E6",
              border: "1px solid #8BD3E6",
              "&:hover": {
                backgroundColor: "#6FBCCF",
                borderColor: "#6FBCCF",
              },
            }}
          >
            SAVE
          </Button>
        </DialogActions>
      </Dialog>

      {/* General Dialog for messages */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "16px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Montserrat",
            fontWeight: "bold",
            fontSize: "20px",
            textAlign: "center",
          }}
        >
          {dialogConfig.title}
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <DialogContentText
            sx={{
              fontFamily: "Montserrat",
              fontSize: "16px",
              color: "#555",
            }}
          >
            {dialogConfig.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          {dialogConfig.cancelText && (
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{
                px: 3,
                borderRadius: "8px",
                fontFamily: "Montserrat",
                fontWeight: "bold",
                color: "#8BD3E6",
                backgroundColor: "#FFFFFF",
                border: "1px solid #8BD3E6",
                "&:hover": {
                  backgroundColor: "#E6F8FB",
                  color: "#7AB9C4",
                  borderColor: "#7AB9C4",
                },
              }}
            >
              {dialogConfig.cancelText}
            </Button>
          )}
          <Button
            onClick={dialogConfig.confirmAction}
            sx={{
              px: 3,
              borderRadius: "8px",
              fontFamily: "Montserrat",
              fontWeight: "bold",
              color: "#FFFFFF",
              backgroundColor:
                dialogConfig.confirmText === "DELETE" ? "#DB2226" : "#8BD3E6",
              border: `1px solid ${dialogConfig.confirmText === "DELETE" ? "#DB2226" : "#8BD3E6"}`,
              "&:hover": {
                backgroundColor:
                  dialogConfig.confirmText === "DELETE" ? "#B71C1C" : "#6FBCCF",
                borderColor:
                  dialogConfig.confirmText === "DELETE" ? "#B71C1C" : "#6FBCCF",
              },
            }}
          >
            {dialogConfig.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
