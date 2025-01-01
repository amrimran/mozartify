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
  Divider
} from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import EditIcon from "@mui/icons-material/Edit";

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
  const navigate = useNavigate();

  // Button styles
  const buttonStyles = {
    px: 10,
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#8BD3E6",
    border: "1px solid #8BD3E6", // Explicitly define the border
    borderColor: "#8BD3E6",
    "&:hover": {
      backgroundColor: "#3B3183",
      color: "#FFFFFF",
      border: "1px solid #3B3183", // Ensure border remains visible on hover
      borderColor: "#3B3183",
    },
  };
  // Create a custom theme
  const theme = createTheme({
    typography: {
      fontFamily: 'Montserrat, Arial, sans-serif',
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& label': {
              fontFamily: 'Montserrat',
            },
            '& input': {
              fontFamily: 'Montserrat',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: 'Montserrat',
            textTransform: 'none',
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

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await axios.put("http://localhost:3000/user/update", {
        username,
        password,
      });
      alert("Profile updated successfully!");
      navigate("/clerk-homepage");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    try {
      await axios.delete("http://localhost:3000/user/delete");
      alert("Account deleted successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account.");
    }
  };

  const GlobalStyle = createGlobalStyle`
    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', sans-serif;
      background-color: #FFFFFF;  /* Set background to white */
    }
  `;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#FFFFFF" }}> {/* Set the root Box background to white */}
        <ClerkSidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column", marginLeft: "225px", minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
          {/* Updated Header Section with Bold User Profile */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              mt: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>User Profile</Typography> {/* Bold the header */}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
            </Box>
          </Box>
          <Divider sx={{ ml: 2 }} />

          <Container maxWidth="sm">
            {/* Removed the card around the profile details */}
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center"
              sx={{ 
                backgroundColor: "#FFFFFF",  /* Set the background of the profile box to white */
                borderRadius: 2, 
                p: 4, 
                boxShadow: 'none'  /* Remove the box shadow */
              }}
            >
              <Box position="relative" sx={{ mb: 3 }}>
                <Avatar
                  alt={username}
                  src="path/to/profile-picture.jpg"
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    border: '4px solid #3B3183',
                    boxShadow: 'none'  /* Removed box shadow */
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "#3B3183",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#2A2462",
                    }
                  }}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              </Box>
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
                  background: "#D32F2F",
                  borderColor: "#D32F2F",
                  color: "#FFFFFF",
                  "&:hover": {
                    backgroundColor: "#FFFFFF",
                    color: "#D32F2F",
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
    </ThemeProvider>
  );
}
