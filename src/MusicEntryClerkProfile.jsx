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

axios.defaults.withCredentials = true;

export default function ClerkProfile() {
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  
  // Separate states for password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const navigate = useNavigate();

  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    content: "",
    confirmAction: () => {},
    confirmText: "",
    cancelText: "Cancel"
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
      color: "#3B3183",
      border: "1px solid #3B3183",
      borderRadius: "8px",
      padding: "8px 24px",
      "&:hover": {
        bgcolor: "#ECEFF1",
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
    borderColor: "#8BD3E6",
    "&:hover": {
      backgroundColor: "#3B3183",
      color: "#FFFFFF",
      border: "1px solid #3B3183",
      borderColor: "#3B3183",
    },
    "&:disabled": {
      backgroundColor: "#E0E0E0",
      borderColor: "#E0E0E0",
      color: "#9E9E9E",
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
      const response = await axios.put("http://localhost:3000/user/update-username", {
        username
      });
      
      // Update the current user state after successful update
      setCurrentUser(prev => ({...prev, username}));
      
      showDialog({
        title: "Success",
        content: "Username updated successfully!",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false)
      });
    } catch (error) {
      console.error("Error updating username:", error);
      showDialog({
        title: "Error",
        content: error.response?.data?.message || "Failed to update username",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false)
      });
    }
  };

  const handleDeleteAccount = () => {
    showDialog({
      title: "Delete Account",
      content: "Are you sure you want to delete your account? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
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
        confirmAction: () => setDialogOpen(false)
      });
      return;
    }
  
    try {
      await axios.put("http://localhost:3000/user/change-password", {
        currentPassword,
        newPassword
      });
      
      // Clear password fields after successful update
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      
      showDialog({
        title: "Success",
        content: "Password updated successfully!",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false)
      });
    } catch (error) {
      console.error("Error updating password:", error);
      showDialog({
        title: "Error",
        content: error.response?.data?.message || "Failed to update password",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false)
      });
    }
  };

  // Add new function for removing profile picture
const handleRemoveProfilePicture = async () => {
  try {
    await axios.put("http://localhost:3000/user/update-profile-picture", {
      profile_picture_url: null
    });
    
    setCurrentUser(prev => ({...prev, profile_picture: null}));
    showDialog({
      title: "Success",
      content: "Profile picture removed successfully!",
      confirmText: "OK",
      confirmAction: () => setDialogOpen(false)
    });
  } catch (error) {
    showDialog({
      title: "Error",
      content: "Failed to remove profile picture",
      confirmText: "OK",
      confirmAction: () => setDialogOpen(false)
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
        profile_picture_url
      });
      
      setCurrentUser(prev => ({...prev, profile_picture: profile_picture_url}));
      setEditDialogOpen(false);
      showDialog({
        title: "Success",
        content: "Profile picture updated successfully!",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false)
      });
    } catch (error) {
      showDialog({
        title: "Error",
        content: "Failed to update profile picture. Please try again.",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false)
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
      <Avatar
        alt={username}
        src={currentUser?.profile_picture}
        sx={{
          width: 150,
          height: 150,
          border: "4px solid #3B3183",
          mb: 2,
          position: "relative",
        }}
      />
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
      {currentUser?.profile_picture && (
        <Button
          variant="text"
          color="error"
          onClick={handleRemoveProfilePicture}
          sx={{ mt: 1 }}
        >
          Remove Picture
        </Button>
      )}
    </Box>


<Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
  <DialogTitle>Update Profile Picture</DialogTitle>
  <DialogContent>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setProfilePictureFile(e.target.files[0])}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
    <Button onClick={handleUpdateProfilePicture}>Save</Button>
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
                  />
                  <Button
                    variant="contained"
                    onClick={handleUpdateUsername}
                    disabled={username === currentUser?.username}
                    sx={buttonStyles}
                  >
                    Update Username
                  </Button>
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
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <Button
                    variant="contained"
                    onClick={handleUpdatePassword}
                    disabled={!currentPassword || !newPassword || !confirmNewPassword}
                    sx={buttonStyles}
                  >
                    Update Password
                  </Button>
                </AccordionDetails>
              </Accordion>

              {/* Delete Account Section */}
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{ mt: 3 }}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{ sx: dialogStyles.dialogPaper }}
      >
        <DialogTitle sx={dialogStyles.title}>
          {dialogConfig.title}
        </DialogTitle>
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
              ...dialogStyles.button,
              ...(dialogConfig.confirmText === "Delete" && {
                color: "#D32F2F",
                border: "1px solid #D32F2F",
              }),
            }}
          >
            {dialogConfig.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}