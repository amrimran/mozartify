import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Button } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./ClerkSidebar"; // Ensure this import is correct
import ABCJS from 'abcjs';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

const MusicEntryClerkEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName, username } = location.state || {};
  const [abcContent, setAbcContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (fileName) {
      const fetchABCFileContent = async () => {
        try {
          const response = await fetch(`http://localhost:3001/abc-file/${fileName}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setAbcContent(data.content);
        } catch (error) {
          console.error('Error fetching ABC file:', error);
        }
      };

      fetchABCFileContent();
    }
  }, [fileName]);

  useEffect(() => {
    if (abcContent) {
      ABCJS.renderAbc("abc-render-edit", abcContent);
    }
  }, [abcContent]);

  const handleInputChange = (event) => {
    setAbcContent(event.target.value);
    ABCJS.renderAbc("abc-render-edit", event.target.value); // Update preview as user types
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/abc-file/${fileName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: abcContent })
      });
      if (!response.ok) {
        throw new Error('Failed to save the ABC file content');
      }
      alert('Changes saved successfully');
    } catch (error) {
      console.error('Error saving ABC file content:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProceed = () => {
    alert("Digitization completed. Please fill the metadata on next page.");
    navigate("/clerk-catalog", { state: { fileName } });
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <ClerkSidebar /> {/* Use the ClerkSidebar component */}
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
              Music Entry Clerk Edit
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username || 'User'}
              </Typography>
              <Avatar>{username ? username[0] : 'U'}</Avatar>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <Box sx={{ width: '50%', padding: '10px' }}>
              <textarea
                style={{ width: '100%', height: '90%', fontSize: '16px' }}
                value={abcContent}
                onChange={handleInputChange}
              />
              <div id="audio-controls"></div>
            </Box>
            <Box sx={{ width: '50%', padding: '10px' }}>
              <div id="abc-render-edit"></div>
            </Box>
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
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
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
        </Box>
      </Box>
    </>
  );
};

export default MusicEntryClerkEdit;
