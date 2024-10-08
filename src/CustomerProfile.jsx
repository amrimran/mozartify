import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Container,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar from "./CustomerSidebar";


axios.defaults.withCredentials = true;

export default function CustomerProfile() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

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
      navigate("/customer-homepage")
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
  }
`;

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
      <CustomerSidebar />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h4">User Profile</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Here you can manage your account information.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
            </Box>
          </Box>
          <Container maxWidth="sm">
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box position="relative">
                <Avatar
                  alt= {username}
                  src="path/to/profile-picture.jpg"
                  sx={{ width: 150, height: 150 }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "background.paper",
                  }}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Profile
              </Typography>
              <form onSubmit={handleSaveChanges} style={{ width: "100%" }}>
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

                {currentUser ? (
                  <TextField
                    label="Email Address"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={currentUser.email}
                    InputProps={{
                      readOnly: true,
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
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Save Changes
                </Button>
              </form>
              <Button
                variant="contained"
                color="error"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
}
