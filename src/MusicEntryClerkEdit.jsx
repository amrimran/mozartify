import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Divider,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Paper,
} from "@mui/material";
import { HelpOutline } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import ABCJS from "abcjs";
import axios from "axios";

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
    overflow: hidden; 
  }
`;

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
};

const MusicEntryClerkEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName } = location.state || {};
  const [abcContent, setAbcContent] = useState("");
  const [splitContent, setSplitContent] = useState([]);
  const [page, setPage] = useState(1);
  const [originalContent, setOriginalContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
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
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setAbcContent(data.content);
          setOriginalContent(data.content);
        } catch (error) {
          console.error("Error fetching ABC file:", error);
        }
      };

      fetchABCFileContent();
    }
  }, [fileName]);

  // Split content into pages
  useEffect(() => {
    if (abcContent) {
      const lines = abcContent.split("\n");
      const maxLinesPerPage = 20; // Adjust lines per page as needed
      const pages = [];
      for (let i = 0; i < lines.length; i += maxLinesPerPage) {
        pages.push(lines.slice(i, i + maxLinesPerPage).join("\n"));
      }
      setSplitContent(pages);
    }
  }, [abcContent]);

  // Render the ABC content for the current page
  useEffect(() => {
    if (splitContent.length > 0) {
      const currentPageContent = splitContent[page - 1] || "";
      
      // Calculate the correct offset by counting characters in previous pages
      const previousPagesContent = splitContent.slice(0, page - 1).join("\n");
      const offset = previousPagesContent ? previousPagesContent.length + 1 : 0; // +1 for the newline after each page
      
      ABCJS.renderAbc("abc-render-edit", currentPageContent, {}, {
        clickListener: (abcElem) => {
          if (abcElem && textAreaRef.current) {
            const { startChar, endChar } = abcElem;
            const textarea = textAreaRef.current;
            
            // Calculate absolute positions in the full content
            const absoluteStartChar = startChar + offset;
            const absoluteEndChar = endChar + offset;
            
            // Set selection in textarea
            textarea.focus();
            textarea.setSelectionRange(absoluteStartChar, absoluteEndChar);
            
            // Calculate the line number for scrolling
            const contentUpToSelection = abcContent.substring(0, absoluteStartChar);
            const lineNumber = contentUpToSelection.split('\n').length;
            
            // Scroll to the selected line
            const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10) || 20;
            const scrollPosition = (lineNumber - 1) * lineHeight;
            
            textarea.scrollTop = scrollPosition - textarea.clientHeight / 2;
          }
        },
      });
    }
  }, [splitContent, page, abcContent]);
  

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInputChange = (event) => {
    const newContent = event.target.value;
    setAbcContent(newContent);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/abc-file/${fileName}/content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: abcContent }),
      });
      if (!response.ok) {
        throw new Error(`Failed to save the ABC file content. Status: ${response.status}`);
      }
      setOriginalContent(abcContent);
      setDialogMessage("Changes saved successfully");
      setOpenDialog(true);
    } catch (error) {
      console.error("Error saving ABC file content:", error);
      setDialogMessage(`Failed to save changes: ${error.message}`);
      setOpenDialog(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProceed = () => {
    navigate("/clerk-catalog", { state: { fileName } });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <ClerkSidebar active="editScore" />
        <Box sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column", marginLeft: "225px" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontFamily: "Montserrat", fontWeight: "bold", mt: 4, ml: 1 }}>
              Edit Music Scores
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2, fontFamily: "Montserrat" }}>
                {user ? user.username : "User"}
              </Typography>
              <Avatar>{user ? user.username[0] : "U"}</Avatar>
            </Box>
          </Box>
          <Divider />
          <Grid container spacing={2} sx={{ flexGrow: 1, mt: 2, flexDirection: "column" }}>
            <Grid item>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}>
                ABC Notation Editor
              </Typography>
              <textarea
                ref={textAreaRef}
                value={abcContent}
                onChange={handleInputChange}
                style={{
                  height: "200px",
                  overflowY: "auto",
                }}
              />
            </Grid>
            <Grid item sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}>
                Music Score Preview
              </Typography>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  borderRadius: 4,
                  bgcolor: "#ffffff",
                  textAlign: "center",
                  maxWidth: "800px",
                  margin: "0 auto",
                  minHeight: "300px",
                  mb: 3,
                  mt:3,
                }}
              >
                <div id="abc-render-edit"></div>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>

          <Pagination
            count={splitContent.length}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: 2,
                fontFamily: "Montserrat",
                "&.Mui-selected": {
                  backgroundColor: "#8BD3E6",
                  color: "#fff",
                },
                "&:hover": {
                  backgroundColor: "#FFEE8C",
                },
              },
            }}
          />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              variant="outlined"
              size="large"
              sx={{
                ...buttonStyles,
                "&:disabled": {
                  backgroundColor: "#E0E0E0",
                  borderColor: "#E0E0E0",
                  color: "#9E9E9E",
                },
              }}
              onClick={handleSave}
              disabled={isSaving || abcContent === originalContent}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outlined" size="large" sx={buttonStyles} onClick={handleProceed}>
              Proceed
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MusicEntryClerkEdit;