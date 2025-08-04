import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Pagination,
  Paper,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import ABCJS from "abcjs";
import axios from "axios";
import { API_BASE_URL, API_BASE_URL_1} from './config/api.js';

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
`;

const buttonStyles = {
  px: { xs: 4, sm: 10 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
    boxShadow: "none",
  },
  "&:disabled": {
    backgroundColor: "#E0E0E0",
    borderColor: "#E0E0E0",
    color: "#9E9E9E",
  },
};
export default function MusicEntryClerkPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName } = location.state || {};
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [abcContent, setAbcContent] = useState("");
  const [splitContent, setSplitContent] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  // Responsive styles
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
      ml: isLargeScreen ? 2 : 0,
      mt: isLargeScreen ? 2 : 8,
      width: isLargeScreen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
    },
    previewPaper: {
      flex: 1,
      p: { xs: 2, sm: 3 },
      borderRadius: 4,
      bgcolor: "#ffffff",
      textAlign: "center",
      maxWidth: { xs: "100%", sm: "800px" },
      margin: "0 auto",
      minHeight: "300px",
      mb: 3,
      overflow: "auto",
    },
    buttonContainer: {
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      justifyContent: "space-between",
      gap: { xs: 2, sm: 3 },
      mt: 3,
      px: { xs: 1, sm: 0 },
    },
    warningBox: {
      mb: 3,
      textAlign: "center",
      p: { xs: 2, sm: 3 },
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      bgcolor: "#f8f8f8",
      borderRadius: 8,
      mx: { xs: 1, sm: 0 },
    },
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/current-user`);
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
    const fetchABCFileContent = async () => {
      if (!fileName) {
        setError("No file name provided");
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL_1}/abc-file/${encodeURIComponent(fileName)}`
        );
        setAbcContent(response.data.content);
        setError(null);
      } catch (error) {
        console.error("Error fetching ABC file content:", error);
        setError(error.response?.data?.message || "Error loading file content");
      }
    };

    fetchABCFileContent();
  }, [fileName]);

  // Split ABC content into pages
  useEffect(() => {
    if (abcContent) {
      const lines = abcContent.split("\n");
      const maxLinesPerPage = isMobile ? 15 : 20; // Fewer lines for mobile
      const pages = [];
      for (let i = 0; i < lines.length; i += maxLinesPerPage) {
        pages.push(lines.slice(i, i + maxLinesPerPage).join("\n"));
      }
      setSplitContent(pages);
    }
  }, [abcContent, isMobile]);

  // Render ABC content for the current page
  useEffect(() => {
    if (splitContent.length > 0) {
      const currentPageContent = splitContent[page - 1] || "";
      if (currentPageContent.trim() !== "") {
        const options = {
          responsive: "resize",
          fontSize: isMobile ? 12 : 16,
          scale: isMobile ? 0.8 : 1,
        };
        ABCJS.renderAbc("abc-render", currentPageContent, options);
      }
    }
  }, [splitContent, page, isMobile]);

  // Event Handlers
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = () => {
    navigate("/clerk-edit", { state: { fileName } });
  };

  const handleProceed = () => {
    navigate("/clerk-catalog", { state: { fileName } });
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
              Preview Music Scores
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
          <ClerkSidebar active="upload" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <ClerkSidebar active="upload" />
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
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
                  }}
                >
                  Preview Music Scores
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body1">
                    {user ? user.username : "Loading..."}
                  </Typography>
                  <Avatar
                    alt={user?.username}
                    src={user?.profile_picture}
                    sx={{ width: 40, height: 40 }}
                  >
                    {(!user || !user?.profile_picture) &&
                      user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Warning Section */}
          <Box sx={styles.warningBox}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontFamily: "Montserrat",
                color: "red",
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              ATTENTION!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: "Montserrat",
                mb: 3,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Please <strong>double-check</strong> the music notation on the
              physical music score sheet against the scanned music score sheet
              preview.
            </Typography>
          </Box>

          {/* ABC Notation Preview */}
          {splitContent[page - 1] && splitContent[page - 1].trim() !== "" ? (
            <Paper elevation={3} sx={styles.previewPaper}>
              <div id="abc-render"></div>
            </Paper>
          ) : (
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                mt: 3,
                fontFamily: "Montserrat",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {abcContent ? "No content on this page." : "Loading content..."}
            </Typography>
          )}

          {/* Pagination */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={splitContent.length}
              page={page}
              onChange={handlePageChange}
              color="primary"
              sx={{
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
          <Box sx={styles.buttonContainer}>
            <Button
              variant="outlined"
              size="large"
              fullWidth={isMobile}
              sx={{
                ...buttonStyles,
                mx: { xs: 1, sm: 1 },
                mb: { xs: -1, sm: 0 },
              }}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth={isMobile}
              sx={{
                ...buttonStyles,
                mx: { xs: 1, sm: 1 },
              }}
              onClick={handleProceed}
            >
              Proceed
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
