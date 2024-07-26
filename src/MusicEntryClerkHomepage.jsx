import React from "react";
import {
  Box,
  Avatar,
  Typography,
} from "@mui/material";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./ClerkSidebar"; // Make sure to adjust the path as needed

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

export default function MusicEntryClerkHomepage() {
  const username = "Clerk Name";

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
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
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
