import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Avatar } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./ClerkSidebar";
import ABCJS from "abcjs";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

export default function MusicEntryClerkPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName, username } = location.state || {};
  const [abcContent, setAbcContent] = useState('');

  useEffect(() => {
    if (fileName) {
      const fetchABCFileContent = async () => {
        try {
          const response = await fetch(`http://localhost:3001/abc-file/${fileName}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          console.log("Fetched ABC Content:", data.content); // Log the fetched ABC content
          setAbcContent(data.content);
        } catch (error) {
          console.error('Error fetching ABC file content:', error);
        }
      };

      fetchABCFileContent();
    }
  }, [fileName]);

  useEffect(() => {
    if (abcContent) {
      console.log("Rendering ABC Content:", abcContent); // Log the abcContent before rendering
      ABCJS.renderAbc("abc-render", abcContent);
    }
  }, [abcContent]);

  const handleEdit = () => {
    navigate("/clerk-edit", { state: { fileName } });
  };

  const handleProceed = () => {
    alert("Digitization completed. Please fill the metadata on next page.");
    navigate("/clerk-catalog", { state: { fileName } });
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <ClerkSidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontFamily: "Montserrat" }}>
              Music Score Preview
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username || 'User'}
              </Typography>
              <Avatar>{username ? username[0] : 'U'}</Avatar>
            </Box>
          </Box>
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
                fontFamily: "Montserrat",
                fontWeight: "bold",
                color: "#3B3183",
                borderColor: "#3B3183",
                "&:hover": {
                  backgroundColor: "#3B3183",
                  color: "#FFFFFF",
                  borderColor: "#3B3183",
                },
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
                fontFamily: "Montserrat",
                fontWeight: "bold",
                color: "#3B3183",
                borderColor: "#3B3183",
                "&:hover": {
                  backgroundColor: "#3B3183",
                  color: "#FFFFFF",
                  borderColor: "#3B3183",
                },
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
