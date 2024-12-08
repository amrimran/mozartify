import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Avatar, Button, Grid, Divider, IconButton } from "@mui/material";
import { HelpOutline } from "@mui/icons-material"; // Import the HelpOutline icon
import { useNavigate, useLocation } from 'react-router-dom';
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./ClerkSidebar";
import ABCJS from 'abcjs';
import axios from 'axios';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
  textarea {
    font-family: 'Courier New', Courier, monospace;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    resize: none;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden; /* Hide the scrollbar */
  }
`;

const MusicEntryClerkEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName } = location.state || {};
  const [abcContent, setAbcContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  const textAreaRef = useRef(null);

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
          adjustTextareaHeight(); // Adjust height initially when content is loaded
        } catch (error) {
          console.error('Error fetching ABC file:', error);
        }
      };

      fetchABCFileContent();
    }
  }, [fileName]);

  useEffect(() => {
    if (abcContent) {
      ABCJS.renderAbc("abc-render-edit", abcContent, {}, {
        clickListener: function (abcElem, tuneNumber, classes, analysis, drag, mouseEvent) {
          // Get the character position of the ABC element in the notation
          const startChar = abcElem.startChar;
          const endChar = abcElem.endChar;

          // Highlight the corresponding text in the textarea
          const textarea = textAreaRef.current;
          textarea.focus();
          textarea.setSelectionRange(startChar, endChar);
        }
      });
    }
  }, [abcContent]);

  const adjustTextareaHeight = () => {
    const textarea = textAreaRef.current;
    textarea.style.height = 'auto'; // Reset height to auto to calculate the correct scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scrollHeight
  };

  const handleInputChange = (event) => {
    const newContent = event.target.value;
    setAbcContent(newContent);
    adjustTextareaHeight(); // Adjust the height based on content
    
    // Debounce the rendering to avoid performance issues
    clearTimeout(window.abcRenderTimeout);
    window.abcRenderTimeout = setTimeout(() => {
      ABCJS.renderAbc("abc-render-edit", newContent, {}, {
        clickListener: function (abcElem, tuneNumber, classes, analysis, drag, mouseEvent) {
          // Get the character position of the ABC element in the notation
          const startChar = abcElem.startChar;
          const endChar = abcElem.endChar;

          // Highlight the corresponding text in the textarea
          const textarea = textAreaRef.current;
          textarea.focus();
          textarea.setSelectionRange(startChar, endChar);
        }
      });
    }, 300);
  };

  const handleSave = async () => {
    setIsSaving(true);
    console.log("Saving file:", fileName);  // Log the filename to check if it's correct
    console.log("Content:", abcContent);
  
    try {
      const response = await fetch(`http://localhost:3001/abc-file/${fileName}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: abcContent }),
      });
  
      console.log("Response status:", response.status);
  
      if (!response.ok) {
        throw new Error(`Failed to save the ABC file content. Status: ${response.status}`);
      }
  
      alert('Changes saved successfully');
    } catch (error) {
      console.error('Error saving ABC file content:', error);
      alert(`Failed to save changes: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleProceed = () => {
    navigate("/clerk-catalog", { state: { fileName } });
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <ClerkSidebar active="upload" />
        {/* <Box sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}> */}
        <Box sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column", marginLeft: "225px", minHeight: "100vh"}}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}

          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 'bold', mt: 4, ml:1 }}>
                Edit Music Scores
              </Typography>
              <IconButton
                href="https://web.archive.org/web/20190214175540/http://www.stephenmerrony.co.uk/uploads/ABCquickRefv0_6.pdf"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 4, ml: 1 }}
              >
                <HelpOutline />
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2, fontFamily: "Montserrat" }}>
                {user ? user.username : 'User'}
              </Typography>
              <Avatar>{user ? user.username[0] : 'U'}</Avatar>
            </Box>
          </Box>
          <Divider />
          <Grid container spacing={2} sx={{ flexGrow: 1, mt: 2, flexDirection: 'column' }}>
            <Grid item>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 'bold' }}>
                ABC Notation Editor
              </Typography>
              <textarea
                ref={textAreaRef}
                value={abcContent}
                onChange={handleInputChange}
                onInput={adjustTextareaHeight} // Adjust the height as content changes
              />
            </Grid>
            <Grid item sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 'bold' }}>
                Music Score Preview
              </Typography>
              <Box
                id="abc-render-edit"
                sx={{
                  padding: 2,
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  backgroundColor: '#f8f8f8',
                  display: 'flex',        // Add flexbox to center content
                  justifyContent: 'center', // Center horizontally
                  alignItems: 'center',    // Center vertically
                  height: 'auto',         // You can adjust this height as needed
                }}
              />
            </Grid>
          </Grid>
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
