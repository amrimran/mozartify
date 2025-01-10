import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Container,
  IconButton,
  TextField,
  Button,
  Grid,
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
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import UploadIcon from "@mui/icons-material/Upload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

axios.defaults.withCredentials = true;

export default function ClerkProfile() {
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  // Separate states for password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Add showPassword state

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const navigate = useNavigate();

  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    content: "",
    confirmAction: () => {},
    confirmText: "",
    cancelText: "CANCEL",
  });

  const dialogStyles = {
    dialogPaper: {
      borderRadius: "16px",
      padding: "16px",
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

  const deleteButtonStyles = {
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#DB2226",
    border: "1px solid #DB2226",
    width: "250px",
    height: "40px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#B71C1C",
      borderColor: "#B71C1C",
    },
  };

  const theme = createTheme({
    typography: {
      fontFamily: "Montserrat, Arial, sans-serif",
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& label": {
              fontFamily: "Montserrat",
            },
            "& input": {
              fontFamily: "Montserrat",
            },
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
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setCurrentUser(response.data);
        setUsername(response.data.username);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const handleUpdateUsername = async () => {
    try {
      // Add loading state if needed
      const response = await axios.put(
        "http://localhost:3000/user/update-username",
        {
          username,
        }
      );

      // Update the current user state after successful update
      setCurrentUser((prev) => ({ ...prev, username }));

      showDialog({
        title: "Success",
        content: "Username updated successfully!",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    } catch (error) {
      console.error("Error updating username:", error);
      showDialog({
        title: "Error",
        content: error.response?.data?.message || "Failed to update username",
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
          await axios.delete("http://localhost:3000/user/delete");
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

  const showDialog = (config) => {
    setDialogConfig(config);
    setDialogOpen(true);
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
      await axios.put("http://localhost:3000/user/change-password", {
        currentPassword,
        newPassword,
      });

      // Clear password fields after successful update
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
      console.error("Error updating password:", error);
      showDialog({
        title: "Error",
        content: error.response?.data?.message || "Failed to update password",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    }
  };

  // Add new function for removing profile picture
  const handleRemoveProfilePicture = async () => {
    try {
      await axios.put("http://localhost:3000/user/update-profile-picture", {
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

  const handleUpdateProfilePicture = async () => {
    if (!profilePictureFile) return;

    try {
      const storageRef = ref(
        storage,
        `profile_pictures/${Date.now()}_${profilePictureFile.name}`
      );
      await uploadBytes(storageRef, profilePictureFile);
      const profile_picture_url = await getDownloadURL(storageRef);

      await axios.put("http://localhost:3000/user/update-profile-picture", {
        profile_picture_url,
      });

      setCurrentUser((prev) => ({
        ...prev,
        profile_picture: profile_picture_url,
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
        content: "Failed to update profile picture. Please try again.",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    }
  };

  const GlobalStyle = createGlobalStyle`
    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', sans-serif;
      background-color: #FFFFFF;
    }
  `;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Box
        sx={{ display: "flex", height: "100vh", backgroundColor: "#FFFFFF" }}
      >
        {" "}
        <ClerkSidebar />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
            marginLeft: "225px",
            minHeight: "100vh",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* Updated Header Section with Bold User Profile */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              mt: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
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
                User Profile
              </Typography>{" "}
              {/* Bold the header */}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar
                alt={username}
                src={
                  currentUser && currentUser?.profile_picture
                    ? currentUser?.profile_picture
                    : null
                }
              >
                {(!currentUser || !currentUser?.profile_picture) &&
                  username.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />

          <Container maxWidth="sm">
            <Box sx={{ mt: 4 }}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{ mb: 4, position: "relative" }}
              >
                {/* Skeleton loader while data is loading */}
                {!currentUser ? (
                  <>
                    {/* Skeleton for Avatar */}
                    <Skeleton
                      variant="circular"
                      width={150}
                      height={150}
                      sx={{ mb: 2 }}
                    />

                    {/* Skeleton for Edit IconButton */}
                    <Skeleton
                      variant="circular"
                      width={40}
                      height={40}
                      sx={{
                        position: "absolute",
                        top: "70%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />

                    {/* Skeleton for Remove Picture Button */}
                    <Skeleton
                      variant="text"
                      width={120}
                      height={30}
                      sx={{ mt: 1 }}
                    />
                  </>
                ) : (
                  <>
                    <Avatar
                      alt={username}
                      src={currentUser.profile_picture || null}
                      sx={{
                        width: 150,
                        height: 150,
                        border: "4px solid #3B3183",
                        mb: 2,
                        position: "relative",
                        backgroundColor: currentUser.profile_picture
                          ? "transparent"
                          : "#F2F2F5",
                        color: "#3B3183",
                        fontSize: currentUser.profile_picture ? "inherit" : 60,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {!currentUser.profile_picture && (
                        <Typography
                          sx={{
                            fontFamily: "Montserrat",
                            fontWeight: "bold",
                            fontSize: 60, // Same as the avatar font size
                            lineHeight: 1,
                          }}
                        >
                          {username?.charAt(0).toUpperCase()}
                        </Typography>
                      )}
                    </Avatar>

                    {/* Edit IconButton */}
                    <IconButton
                      onClick={() => setEditDialogOpen(true)}
                      sx={{
                        position: "absolute",
                        top: "70%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "#3B3183",
                        color: "white",
                        boxShadow: 2,
                        "&:hover": {
                          bgcolor: "#2A2462",
                        },
                      }}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>

                    {/* Remove Picture Button - Always Visible */}
                    <Button
                      variant="text"
                      color="error"
                      onClick={handleRemoveProfilePicture}
                      disabled={!currentUser.profile_picture} // Disable when no profile picture
                      sx={{
                        mt: 1,
                        textTransform: "none",
                        opacity: currentUser.profile_picture ? 1 : 0.5, // Reduce opacity when disabled
                      }}
                    >
                      Remove Picture
                    </Button>
                  </>
                )}
              </Box>

              {/* Dialog for Updating Profile Picture */}
              <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                PaperProps={{ sx: dialogStyles.dialogPaper }}
              >
                <DialogTitle sx={dialogStyles.title}>
                  Update Profile Picture
                </DialogTitle>
                <DialogContent sx={dialogStyles.content}>
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
                        fontFamily: "Montserrat, sans-serif",
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
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    />
                  </Box>
                </DialogContent>
                <DialogActions sx={dialogStyles.actions}>
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
                    sx={dialogStyles.button}
                  >
                    SAVE
                  </Button>
                </DialogActions>
              </Dialog>

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
                      "& .MuiOutlinedInput-root": {
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Hover outline color
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Focus outline color
                        },
                      },
                    }}
                  />
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleUpdateUsername}
                      disabled={username === currentUser?.username}
                      sx={{
                        ...buttonStyles, // Merge existing buttonStyle
                      }}
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
                  {/* Current Password */}
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
                          <IconButton onClick={togglePasswordVisibility}>
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Hover outline color
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Focus outline color
                        },
                      },
                    }}
                  />

                  {/* New Password */}
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
                          <IconButton onClick={togglePasswordVisibility}>
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Hover outline color
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Focus outline color
                        },
                      },
                    }}
                  />

                  {/* Confirm New Password */}
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
                          <IconButton onClick={togglePasswordVisibility}>
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Hover outline color
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Focus outline color
                        },
                      },
                    }}
                  />

                  {/* Update Password Button */}
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleUpdatePassword}
                      disabled={
                        !currentPassword || !newPassword || !confirmNewPassword
                      }
                      sx={{
                        ...buttonStyles,
                      }}
                    >
                      UPDATE PASSWORD
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Box
                sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 3 }}
              >
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{
                    ...deleteButtonStyles,
                    width: "100%", // Ensures full width of its container
                    maxWidth: "310px", // Optional: sets a maximum width
                    padding: "12px 24px", // Adds extra padding for a larger button
                    fontSize: "1rem", // Optional: Adjust font size for better readability
                  }}
                  onClick={handleDeleteAccount}
                >
                  DELETE ACCOUNT
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{ sx: dialogStyles.dialogPaper }}
      >
        <DialogTitle sx={dialogStyles.title}>{dialogConfig.title}</DialogTitle>
        <DialogContent sx={dialogStyles.content}>
          <DialogContentText sx={dialogStyles.contentText}>
            {dialogConfig.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={dialogStyles.actions}>
          {dialogConfig.cancelText && (
            <Button
              onClick={() => setDialogOpen(false)}
              sx={dialogStyles.button}
            >
              {dialogConfig.cancelText}
            </Button>
          )}
          <Button
            onClick={dialogConfig.confirmAction}
            sx={{
              ...dialogStyles.deletebutton,
              ...(dialogConfig.confirmText === "DELETE"
                ? dialogStyles.deletebutton
                : dialogStyles.button),
            }}
          >
            {dialogConfig.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
