import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Avatar,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./ClerkSidebar"; // Make sure to adjust the path as needed

axios.defaults.withCredentials = true; //tambah ni 1

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

export default function MusicEntryClerkHomepage() {

  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <ClerkSidebar />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Welcome to Mozartify</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {currentUser ? (
                <>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    {currentUser.username}
                  </Typography>
                  <Avatar>{currentUser.username.charAt(0)}</Avatar>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Loading...
                  </Typography>
                  <Avatar></Avatar>
                </>
              )}
            </Box>
          </Box>
          <Box>
            <Typography variant="h4">Dashboard</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Welcome to your dashboard. Here you can manage your uploads, profile, and more.
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
