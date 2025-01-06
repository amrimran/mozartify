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
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import UploadIcon from "@mui/icons-material/Upload";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicEntryClerkSidebar";

axios.defaults.withCredentials = true;

export default function ClerkProfile() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    content: "",
    confirmAction: () => {},
    confirmText: "",
    cancelText: "Cancel"
  });
  
  const navigate = useNavigate();

  
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

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

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

  useEffect(() => {
    if (currentUser) {
      setIsFormChanged(
        username !== currentUser.username ||
        password !== "" ||
        confirmPassword !== ""
      );
    }
  }, [username, password, confirmPassword, currentUser]);

  const showDialog = (config) => {
    setDialogConfig(config);
    setDialogOpen(true);
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleSaveProfilePicture = () => {
    setEditDialogOpen(false);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showDialog({
        title: "Password Mismatch",
        content: "Passwords do not match. Please try again.",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
      return;
    }


    try {
      let profile_picture_url = null;

      if (profilePictureFile) {
        const storageRef = ref(
          storage,
          `profile_pictures/${Date.now()}_${profilePictureFile.name}`
        );
        await uploadBytes(storageRef, profilePictureFile);
        profile_picture_url = await getDownloadURL(storageRef);
      }

      // Send the updated user data to the backend
      await axios.put("http://localhost:3000/user/update", {
        username,
        password,
        profile_picture_url, // Pass the URL of the uploaded profile picture
      });

      showDialog({
        title: "Success",
        content: "Profile updated successfully!",
        confirmText: "OK",
        confirmAction: () => {
          setDialogOpen(false);
          navigate("/clerk-homepage");
        },
      });
    } catch (error) {
      showDialog({
        title: "Error",
        content: "Failed to update profile. Please try again.",
        confirmText: "OK",
        confirmAction: () => setDialogOpen(false),
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePictureFile(file);
    setProfilePictureUrl(URL.createObjectURL(file));
  };

  const handleDeleteProfilePicture = () => {
    setProfilePictureFile(null);
    setProfilePictureUrl(null);
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
            {/* Removed the card around the profile details */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{
                backgroundColor:
                  "#FFFFFF" /* Set the background of the profile box to white */,
                borderRadius: 2,
                p: 4,
                boxShadow: "none" /* Remove the box shadow */,
              }}
            >
              <Box position="relative" sx={{ mb: 3 }}>
                <Avatar
                  alt={username}
                  src={
                    currentUser && currentUser.profile_picture
                      ? currentUser.profile_picture
                      : null
                  }
                  sx={{
                    width: 150,
                    height: 150,
                    border: "4px solid #3B3183",
                    boxShadow: "none",
                    fontSize: 50, // Adjust font size for the initial
                    backgroundColor: "#3B3183", // Background color for when no image is available
                    color: "#FFFFFF", // Text color for the initial
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                  }}
                >
                  {(!currentUser || !currentUser.profile_picture) &&
                    username.charAt(0).toUpperCase()}
                </Avatar>

                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "#3B3183",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#2A2462",
                    },
                  }}
                  size="small"
                  onClick={handleEditClick}
                >
                  <EditIcon />
                </IconButton>
              </Box>
              <Dialog
                open={editDialogOpen}
                onClose={handleEditDialogClose}
                sx={{
                  "& .MuiDialog-paper": {
                    borderRadius: "12px", // Add border radius for dialog
                    fontFamily: "Montserrat", // Set font to Montserrat
                  },
                }}
              >
                <DialogTitle
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    color: "#3B3183",
                  }}
                >
                  Edit Item
                </DialogTitle>
                <DialogContent
                  sx={{
                    fontFamily: "Montserrat",
                    minWidth: "300px", // Ensure the dialog has a reasonable width
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mr: 2 }}
                    >
                      Attachment (if any)
                    </Typography>
                    <IconButton component="label">
                      <UploadIcon />
                      <input type="file" hidden onChange={handleFileChange} />
                    </IconButton>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleEditDialogClose}
                    variant="outlined"
                    sx={{
                      fontFamily: "Montserrat",
                      color: "#8BD3E6", // Text color
                      borderColor: "#8BD3E6", // Border color
                      "&:hover": {
                        borderColor: "#8BD3E6",
                        bgcolor: "#F0F9FF", // Light background on hover
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteProfilePicture} // Replace with your click handler
                    variant="contained"
                    sx={{
                      fontFamily: "Montserrat",
                      bgcolor: "red", // Set the background color to red
                      color: "white", // Set the text color to white
                      "&:hover": {
                        bgcolor: "#cc0000", // Darker red on hover
                      },
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={handleSaveProfilePicture}
                    variant="contained"
                    sx={{
                      fontFamily: "Montserrat",
                      bgcolor: "#8BD3E6", // Filled pastel blue color
                      color: "white",
                      "&:hover": {
                        bgcolor: "#67ADC1", // Slightly darker blue on hover
                      },
                    }}
                  >
                    Save Changes
                  </Button>
                </DialogActions>
              </Dialog>
              <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 700 }}>
                Profile Details
              </Typography>
              <form onSubmit={handleSaveChanges} style={{ width: "100%" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Username"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {currentUser ? (
                      <TextField
                        label="Email Address"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={currentUser.email}
                        InputProps={{
                          readOnly: false,
                        }}
                        required
                      />
                    ) : (
                      <TextField
                        label="Email Address"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={"Loading ..."}
                        InputProps={{
                          readOnly: true,
                        }}
                        required
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Confirm Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  variant="outlined"
                  fullWidth
                  disabled={!isFormChanged}
                  sx={{
                    ...buttonStyles,
                    mt: 2,
                    py: 1.5,
                  }}
                >
                  SAVE CHANGES
                </Button>
              </form>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontFamily: "Montserrat",
                  fontWeight: "bold",
                  borderColor: "#D32F2F",
                  color: "#D32F2F",
                  "&:hover": {
                    backgroundColor: "#D32F2F",
                    color: "#FFFFFF",
                  },
                }}
                onClick={handleDeleteAccount}
              >
                DELETE ACCOUNT
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