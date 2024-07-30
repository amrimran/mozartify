import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar } from "@mui/material";
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
  const [abcContent, setAbcContent] = useState('');
  const abcFileUrl = "http://localhost:3002/uploads/1721966224740-IMG_20240723_0005/1721966224740-IMG_20240723_0005.abc"; // Replace this with the actual URL
  const username = "Nifail Amsyar";

  useEffect(() => {
    fetch(abcFileUrl)
      .then(response => response.text())
      .then(data => {
        setAbcContent(data);
      })
      .catch(error => console.error('Error fetching ABC file:', error));
  }, [abcFileUrl]);

  useEffect(() => {
    if (abcContent) {
      ABCJS.renderAbc("abc-render-test", abcContent);
    }
  }, [abcContent]);

  const handleInputChange = (event) => {
    setAbcContent(event.target.value);
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
            <Typography variant="h6">Music Entry Clerk</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
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
              <div id="abc-render-test"></div>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MusicEntryClerkEdit;
