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
  Alert,
  useMediaQuery,
  AppBar,
  Toolbar,
  Drawer,
} from "@mui/material";
import { Menu as MenuIcon, HelpOutline } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicClerkSidebar";
import ABCJS from "abcjs";
import axios from "axios";

const DRAWER_WIDTH = 225;

// Theme setup
const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
  breakpoints: {
    values: {
      xs: 0, // mobile phones
      sm: 600, // tablets
      md: 960, // small laptops
      lg: 1280, // desktops
      xl: 1920, // large screens
    },
  },
});

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }

  textarea {
    font-family: 'Courier New', Courier, monospace;
    border: 2px solid #8BD3E6; /* Default border color */
    padding: 10px;
    border-radius: 5px;
    resize: none;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    outline: none; /* Removes default focus outline */
    transition: border-color 0.3s ease-in-out; /* Smooth transition for border */

    &:hover {
      border-color: #6FBCCF; /* Darker border color on hover */
    }

    &:focus {
      border-color: #6FBCCF; /* Darker border color on focus */
    }
  }
`;

const buttonStyles = {
  px: { xs: 4, sm: 15 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  "&:hover": {
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
  },
};

const MusicEntryClerkEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName } = location.state || {};

  // Media Query Hooks
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  // State Hooks
  const [mobileOpen, setMobileOpen] = useState(false);
  const [abcContent, setAbcContent] = useState("");
  const [splitContent, setSplitContent] = useState([]);
  const [page, setPage] = useState(1);
  const [originalContent, setOriginalContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Refs
  const textAreaRef = useRef(null);

  // Responsive Styles
  const styles = {
    root: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#FFFFFF",
    },
    appBar: {
      display: isLargeScreen ? "none" : "block",
      backgroundColor: "#FFFFFF",
      boxShadow: "none",
      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    },
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
      display: isLargeScreen ? "block" : "none",
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
      },
    },
    mobileDrawer: {
      display: isLargeScreen ? "none" : "block",
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
      },
    },
    mainContent: {
      flexGrow: 1,
      p: { xs: 2, sm: 3 },
      ml: isLargeScreen ? 1 : 0,
      mt: isLargeScreen ? 0 : 8,
      width: isLargeScreen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
    },
    contentWrapper: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    previewContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      mb: 4,
    },
    previewPaper: {
      padding: { xs: 1, sm: 2 },
      borderRadius: 4,
      bgcolor: "#ffffff",
      textAlign: "center",
      maxWidth: { xs: "100%", sm: "800px" },
      margin: "0 auto",
      minHeight: { xs: "200px", sm: "300px" },
      mb: 3,
      mt: 3,
      overflow: "auto",
    },
    textarea: {
      height: { xs: "150px", sm: "200px" },
      fontSize: { xs: "0.875rem", sm: "1rem" },
    },
    controlsContainer: {
      mt: "auto",
      pt: 2,
      pb: 2,
      borderTop: "1px solid rgba(0, 0, 0, 0.12)",
      backgroundColor: "#ffffff",
      position: "sticky",
      bottom: 0,
      zIndex: 1,
    },
  };

  // Drawer Toggle Handler
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
          const response = await fetch(
            `http://localhost:3001/abc-file/${fileName}`
          );
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
      const maxLinesPerPage = isMobile ? 15 : 20;
      const pages = [];
      for (let i = 0; i < lines.length; i += maxLinesPerPage) {
        pages.push(lines.slice(i, i + maxLinesPerPage).join("\n"));
      }
      setSplitContent(pages);
    }
  }, [abcContent, isMobile]);

  // Render the ABC content for the current page
  useEffect(() => {
    if (splitContent.length > 0) {
      const currentPageContent = splitContent[page - 1] || "";

      // Calculate the correct offset by counting characters in previous pages
      const previousPagesContent = splitContent.slice(0, page - 1).join("\n");
      const offset = previousPagesContent ? previousPagesContent.length + 1 : 0;

      // Determine responsive options based on viewport size
      const isMobile = window.innerWidth <= 768; // Example breakpoint for mobile
      const options = {
        responsive: "resize",
        fontSize: isMobile ? 12 : 16,
        scale: isMobile ? 0.8 : 1,
      };

      ABCJS.renderAbc("abc-render-edit", currentPageContent, options, {
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
            const contentUpToSelection = abcContent.substring(
              0,
              absoluteStartChar
            );
            const lineNumber = contentUpToSelection.split("\n").length;

            // Scroll to the selected line
            const lineHeight =
              parseInt(window.getComputedStyle(textarea).lineHeight, 10) || 20;
            const scrollPosition = (lineNumber - 1) * lineHeight;

            textarea.scrollTop = scrollPosition - textarea.clientHeight / 2;
          }
        },
      });
    }
  }, [splitContent, page, abcContent]);

  // Page change handler
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ABC Notation Validation
  const validateABCNotation = (content) => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      setIsValidating(true);
      // Use ABCJS to parse the ABC notation
      const validationResponse = ABCJS.parseOnly(content, {
        warn: (message) => {
          throw new Error(message);
        },
      });

      // Check if there's a header field (required in ABC notation)
      if (
        !content.includes("X:") ||
        !content.includes("T:") ||
        !content.includes("K:")
      ) {
        throw new Error(
          "Missing required ABC header fields (X:, T:, and K: are required)"
        );
      }

      // Check if there's any music content
      if (!validationResponse || validationResponse.length === 0) {
        throw new Error("No valid music content found");
      }

      // Additional checks for common issues
      if (!content.includes("M:")) {
        throw new Error("Warning: Missing meter (M:) field");
      }
      if (!content.includes("L:")) {
        throw new Error("Warning: Missing default note length (L:) field");
      }

      setValidationError(null);
      return true;
    } catch (error) {
      setValidationError(error.message);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Input change handler
  const handleInputChange = (event) => {
    const newContent = event.target.value;
    setAbcContent(newContent);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);

    // Validate before saving
    const isValid = validateABCNotation(abcContent);

    if (!isValid) {
      setIsSaving(false);
      setDialogMessage("Please fix the ABC notation errors before saving");
      setOpenDialog(true);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/abc-file/${fileName}/content`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: abcContent }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to save the ABC file content. Status: ${response.status}`
        );
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

  // Proceed handler
  const handleProceed = () => {
    navigate("music-clerk/catalog", { state: { fileName } });
  };

  // Dialog close handler
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Box sx={styles.root}>
        {/* Mobile AppBar */}
        <AppBar position="fixed" sx={styles.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: "#3B3183" }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ color: "#3B3183", fontWeight: "bold" }}
            >
              Edit Music Scores
            </Typography>

            {/* Mobile user info */}
            {!isLargeScreen && (
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {!isMobile && (
                  <Typography variant="body2" sx={{ color: "#3B3183" }}>
                    {user?.username}
                  </Typography>
                )}
                <Avatar
                  alt={user?.username}
                  src={user?.profile_picture}
                  sx={{ width: 32, height: 32 }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Permanent drawer for large screens */}
        <Drawer variant="permanent" sx={styles.drawer}>
          <ClerkSidebar active="editScore" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <ClerkSidebar active="editScore" />
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={styles.mainContent}>
          {/* Header Section - Desktop */}
          {isLargeScreen && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", mt: 4, ml: 1 }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
                    }}
                  >
                    Edit Music Score
                  </Typography>
                  <IconButton
                    onClick={() => {
                      window.open(
                        "https://web.archive.org/web/20190214175540/http://www.stephenmerrony.co.uk/uploads/ABCquickRefv0_6.pdf",
                        "_blank"
                      );
                    }}
                    sx={{
                      ml: 1,
                      color: "#6FBCCF",
                      "&:hover": {
                        color: "#8BD3E6",
                      },
                    }}
                  >
                    <HelpOutline />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body1">
                    {user ? user.username : "User"}
                  </Typography>
                  <Avatar sx={{ ml: 2, width: 40, height: 40 }}>
                    {user ? user.username[0] : "U"}
                  </Avatar>
                </Box>
              </Box>
              <Divider />
            </>
          )}

          {/* Wrapper for scrollable content */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100%",
              pb: "150px", // Add padding at bottom to account for controls height
            }}
          >
            {/* ABC Notation Editor */}
            <Grid
              container
              spacing={2}
              sx={{
                flexGrow: 1,
                mt: 2,
                flexDirection: "column",
              }}
            >
              <Grid item>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  ABC Notation Editor
                </Typography>
                {validationError && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      fontFamily: "Montserrat",
                      "& .MuiAlert-message": {
                        fontFamily: "Montserrat",
                      },
                    }}
                  >
                    {validationError}
                  </Alert>
                )}
                <textarea
                  ref={textAreaRef}
                  value={abcContent}
                  onChange={handleInputChange}
                  style={{
                    height: isMobile ? "150px" : "200px",
                    overflowY: "auto",
                    fontSize: isMobile ? "0.875rem" : "1rem",
                  }}
                />
              </Grid>

              {/* Music Score Preview */}
              <Grid item sx={{ mt: 1, width: "100%" }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  Music Score Preview
                </Typography>
                <Paper
                  elevation={3}
                  sx={{
                    padding: { xs: 1, sm: 2 },
                    borderRadius: 4,
                    bgcolor: "#ffffff",
                    textAlign: "center",
                    maxWidth: { xs: "100%", sm: "800px" },
                    margin: "0 auto",
                    minHeight: { xs: "200px", sm: "300px" },
                    mb: 3,
                    mt: 3,
                    width: "100%",
                  }}
                >
                  <div id="abc-render-edit"></div>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Fixed bottom controls container */}
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: { xs: 0, lg: DRAWER_WIDTH },
              right: 0,
              backgroundColor: "#ffffff",
              borderTop: "1px solid rgba(0, 0, 0, 0.12)",
              zIndex: 1000,
              boxShadow: "0px -2px 4px rgba(0, 0, 0, 0.05)",
              pt: 2,
            }}
          >
            {/* Pagination */}
            <Box sx={{ mb: 2 }}>
              <Pagination
                count={splitContent.length}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  "& .MuiPaginationItem-root": {
                    borderRadius: 2,
                    fontFamily: "Montserrat",
                    fontSize: { xs: "0.75rem", sm: "1rem" },
                    backgroundColor: "primary",
                    color: "#000",
                    "&.Mui-selected": {
                      backgroundColor: "#8BD3E6",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#8BD3E6",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "#D3D3D3",
                    },
                  },
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: { xs: "center", sm: "space-between" },
                alignItems: { xs: "center", sm: "flex-start" },
                gap: { xs: 2, sm: 0 },
                px: { xs: 2, sm: 3 },
                pb: 2,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                fullWidth={isMobile}
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
              <Button
                variant="outlined"
                size="large"
                fullWidth={isMobile}
                sx={buttonStyles}
                onClick={handleProceed}
              >
                Proceed
              </Button>
            </Box>
          </Box>

          {/* Dialog for Messages */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            PaperProps={{
              sx: {
                borderRadius: "16px",
                padding: "16px",
                width: { xs: "90%", sm: "auto" },
                maxWidth: { xs: "90%", sm: 400 },
              },
            }}
          >
            <DialogTitle
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                fontSize: { xs: "18px", sm: "20px" },
                textAlign: "center",
              }}
            >
              Notification
            </DialogTitle>
            <DialogContent>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Montserrat",
                  fontSize: { xs: "14px", sm: "16px" },
                  color: "#555",
                  textAlign: "center",
                }}
              >
                {dialogMessage}
              </Typography>
            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: "center",
                gap: "12px",
                mt: 1,
                pb: 2,
              }}
            >
              <Button
                onClick={handleCloseDialog}
                sx={{
                  ...buttonStyles,
                  borderRadius: "8px",
                  px: { xs: 3, sm: 4 },
                }}
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MusicEntryClerkEdit;
