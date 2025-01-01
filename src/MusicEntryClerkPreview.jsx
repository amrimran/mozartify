import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Avatar } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import ABCJS from "abcjs";
import axios from "axios";
import { Divider } from "@mui/material";


const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

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

export default function MusicEntryClerkPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName } = location.state || {};
  const [abcContent, setAbcContent] = useState('');
  const [user, setUser] = useState(null);

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

  // Fetch ABC file content
  useEffect(() => {
    if (fileName) {
      const fetchABCFileContent = async () => {
        try {
          const response = await fetch(`http://localhost:3001/abc-file/${fileName}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          console.log("Fetched ABC Content:", data.content);
          setAbcContent(data.content);
        } catch (error) {
          console.error('Error fetching ABC file content:', error);
        }
      };

      fetchABCFileContent();
    }
  }, [fileName]);

  // Render ABC content
  useEffect(() => {
    if (abcContent) {
      console.log("Rendering ABC Content:", abcContent);
      ABCJS.renderAbc("abc-render", abcContent);
    }
  }, [abcContent]);

  const handleEdit = () => {
    navigate("/clerk-edit", { state: { fileName } });
  };

  const handleProceed = () => {
    navigate("/clerk-catalog", { state: { fileName } });
  };

  return (
    <>
      <GlobalStyle />
<Box sx={{ display: "flex", minHeight: "100vh" }}>
  <Box
    sx={{
      width: 225,
      bgcolor: "#3B3183",
      flexShrink: 0, // Prevent shrinking
      overflowY: "auto", // Add scroll if content overflows
    }}
  >
    <ClerkSidebar active="upload" /> {/* Sidebar with fixed width and scroll */}
  </Box>
  <Box sx={{ flexGrow: 1, p: 3, pl: 5, display: "flex", flexDirection: "column" }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 'bold', mt: 4, ml:1 }}>
        Preview Music Scores
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body1" sx={{ mr: 2, fontFamily: "Montserrat" }}>
          {user ? user.username : 'Loading...'}
        </Typography>
        <Avatar>{user ? user.username[0] : 'U'}</Avatar>
      </Box>
    </Box>
    <Divider sx={{ my: 2 }} />  {/* This is the line for the divider */}
    <Box


            sx={{
              mb: 3,
              textAlign: "center",
              p: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "#f8f8f8",
              borderRadius: 8,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontFamily: "Montserrat", color: "red", fontWeight: "bold" }}>
              ATTENTION!
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: "Montserrat", mb: 3 }}>
              Please <strong>double-check</strong> the music notation on the physical music score sheet against the scanned music score sheet preview.
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, textAlign: "center", p: 3 }}>
            <div id="abc-render"></div>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              variant="outlined"
              size="large"
              sx={{
                flexGrow: 1,
                mx: 1,
                ...buttonStyles, // Apply consistent styles
              }}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
  variant="outlined"
  size="large"
  sx={{
    flexGrow: 1,
    mx: 1,
    ...buttonStyles, // Apply consistent styles
  }}
  onClick={handleProceed}
>
  Proceed
</Button>

          </Box>
          <Box sx={{ flexGrow: 1, p: 3 }}>
          </Box>
        </Box>
      </Box>
    </>
  );
}
