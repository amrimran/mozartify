import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Divider,
  Paper,
  Grid,
  Card,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  CircularProgress,
} from "@mui/material";
import { Menu as MenuIcon, Edit, Delete } from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import { useParams, useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar2 from "./CustomerSidebar2";

const DRAWER_WIDTH = 225;

// Theme setup
const customTheme = createTheme({
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
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
  px: 3,
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#FFB6C1",
  border: "1px solid #FFB6C1",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#FFA0B3",
    borderColor: "#FFA0B3",
    boxShadow: "none",
  },
};

const buttonStyles2 = {
  px: 3,
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFB6C1",
  backgroundColor: "#FFFFFF",
  border: "1px solid #FFB6C1",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#FFF0F2",
    color: "#FFA0B3",
    borderColor: "#FFA0B3",
    boxShadow: "none",
  },
};

const deleteButtonStyles = {
  px: 3,
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  borderColor: "#DB2226",
  backgroundColor: "#DB2226",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
    backgroundColor: "#B71C1C",
    borderColor: "#B71C1C",
  },
};

const dialogStyles = {
  dialog: {
    PaperProps: {
      sx: {
        borderRadius: "16px",
        padding: "16px",
        width: { xs: "90%", sm: "auto" },
        maxWidth: { xs: "90%", sm: 500 },
      },
    },
    aria: {
      labelledby: "alert-dialog-title",
      describedby: "alert-dialog-description",
    },
  },
  title: {
    sx: {
      fontFamily: "Montserrat",
      fontWeight: "bold",
      fontSize: { xs: "1.125rem", sm: "1.25rem" },
      textAlign: "center",
      color: "black",
      paddingBottom: 1,
    },
  },
  content: {
    sx: {
      textAlign: "center",
      paddingX: { xs: 2, sm: 3 },
      paddingTop: "0 !important", // Override default padding
    },
  },
  contentText: {
    sx: {
      fontFamily: "Montserrat",
      fontSize: { xs: "0.875rem", sm: "1rem" },
      color: "#555",
      lineHeight: 1.6,
    },
  },
  actions: {
    sx: {
      justifyContent: "center",
      padding: { xs: "8px 16px", sm: "16px 24px" },
      gap: { xs: 1, sm: 2 },
    },
  },
  button: {
    common: {
      fontFamily: "Montserrat",
      fontWeight: "bold",
      textTransform: "uppercase",
      borderRadius: "8px",
      paddingX: { xs: 3, sm: 4 },
      boxShadow: "none",
    },
    close: {
      backgroundColor: "#FFB6C1",
      color: "white",
      "&:hover": {
        backgroundColor: "#FFA0B3",
        boxShadow: "none",
      },
    },
    cancel: {
      backgroundColor: "#FFFFFF",
      color: "#FFB6C1",
      border: "1px solid #FFB6C1",
      "&:hover": {
        backgroundColor: "#FFF0F2",
        boxShadow: "none",
      },
    },
  },
};

export default function CustomerArtworkView() {
  const { artworkId } = useParams();
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery(customTheme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(customTheme.breakpoints.between("sm", "lg"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [user, setUser] = useState(null);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Styles object for responsive layout
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
      mt: isLargeScreen ? 2 : 8,
      width: "100%",
    },
    imageContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      maxWidth: { xs: "100%", md: 500 },
      mx: "auto",
      mb: { xs: 3, md: 0 },
    },
    artworkImage: {
      width: "100%",
      maxHeight: { xs: 300, sm: 400, md: 500 },
      objectFit: "contain",
      borderRadius: 2,
      border: "2px solid #000",
      padding: 2,
    },
    detailsCard: {
      p: 3,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      borderRadius: 2,
      height: "fit-content",
    },
    detailRow: {
      display: "flex",
      borderBottom: "1px solid #eee",
      py: 1.5,
      "&:last-child": {
        borderBottom: "none",
      },
    },
    detailLabel: {
      fontWeight: "bold",
      width: "40%",
      color: "#555",
    },
    detailValue: {
      width: "60%",
    },
    actionButtons: {
      display: "flex",
      justifyContent: "space-between",
      mt: 3,
      gap: 2,
      flexDirection: { xs: "column", sm: "row" },
    },
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

  useEffect(() => {
    // console.log("Artwork ID:", artworkId); // Debugging line

    const fetchArtwork = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/fetchArts/${artworkId}`
        );
        // console.log("Fetched Data:", response.data); // Debugging line

        if (response.data) {
          setArtwork(response.data);
        } else {
          setError("Artwork not found");
        }
      } catch (error) {
        console.error("Error fetching artwork:", error);
        setError("Error loading artwork");
      } finally {
        setLoading(false);
      }
    };

    if (artworkId) {
      fetchArtwork();
    }
  }, [artworkId]);

  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(true);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!artworkId || !user?._id) return;

      try {
        setPurchaseLoading(true);
        const response = await axios.get(
          `http://localhost:3000/check-purchase/${artworkId}`
        );
        setHasPurchased(response.data.hasPurchased);
        console.log(hasPurchased);
      } catch (error) {
        console.error("Error checking purchase status:", error);
        setHasPurchased(false);
      } finally {
        setPurchaseLoading(false);
      }
    };

    checkPurchaseStatus();
  }, [artworkId, user?._id]); // Re-run when artworkId or user changes

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const addToCart = async (artworkId) => {
    try {
      await axios.post("http://localhost:3000/add-to-cart-artwork", {
        artworkId: artworkId,
      });
      navigate("/customer-mycart-2");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ThemeProvider theme={customTheme}>
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
              Artwork Details
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
          <CustomerSidebar2 active="manageArtwork" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <CustomerSidebar2 active="dashboard" />
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
                  Artwork Details
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body1">{user?.username}</Typography>
                  <Avatar
                    alt={user?.username}
                    src={user?.profile_picture}
                    sx={{ width: 40, height: 40 }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              </Box>
              <Divider sx={{ mb: 4 }} />
            </>
          )}

          {/* Loading State */}
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "calc(100vh - 300px)",
              }}
            >
              <CircularProgress sx={{ color: "#FFB6C1" }} />
            </Box>
          )}

          {/* Error State */}
          {error && !loading && (
            <Box
              sx={{
                textAlign: "center",
                p: 3,
                minHeight: "calc(100vh - 300px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ color: "#DB2226", mb: 2 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                sx={buttonStyles}
                onClick={() => navigate("/arts-clerk-homepage")}
              >
                Return to Gallery
              </Button>
            </Box>
          )}

          {/* Artwork Details */}
          {!loading && !error && artwork && (
            <Grid container spacing={4}>
              {/* Artwork Image */}
              <Grid item xs={12} md={6}>
                <Box sx={styles.imageContainer}>
                  {artwork.imageUrl ? (
                    <Box sx={{ position: "relative" }}>
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        style={{
                          width: "100%",
                          maxHeight: isMobile ? 300 : isTablet ? 400 : 500,
                          objectFit: "contain",
                          borderRadius: 8,
                          border: "2px solid #000",
                          padding: 16,
                          filter: hasPurchased ? "none" : "blur(8px)",
                          opacity: purchaseLoading ? 0.5 : 1,
                          transition: "filter 0.3s ease",
                        }}
                      />
                      {!hasPurchased && !purchaseLoading && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(0,0,0,0)",
                          }}
                        >
                          <Button
                            variant="contained"
                            sx={buttonStyles}
                            onClick={() => addToCart(artwork._id)}
                          >
                            Purchase to View Full Artwork
                          </Button>
                        </Box>
                      )}
                      {purchaseLoading && (
                        <CircularProgress
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            color: "#FFB6C1",
                          }}
                        />
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: isMobile ? 300 : isTablet ? 400 : 500,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #000",
                        borderRadius: 2,
                        p: 2,
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ color: "#555", textAlign: "center" }}
                      >
                        No image available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Artwork Details */}
              <Grid item xs={12} md={6}>
                <Paper sx={styles.detailsCard}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      mb: 3,
                      borderBottom: "2px solid #FFB6C1",
                      pb: 1,
                    }}
                  >
                    {artwork.title || "Untitled"}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={styles.detailRow}>
                      <Typography variant="body1" sx={styles.detailLabel}>
                        Artist:
                      </Typography>
                      <Typography variant="body1" sx={styles.detailValue}>
                        {artwork.artist || "Unknown Artist"}
                      </Typography>
                    </Box>

                    <Box sx={styles.detailRow}>
                      <Typography variant="body1" sx={styles.detailLabel}>
                        Collection:
                      </Typography>
                      <Typography variant="body1" sx={styles.detailValue}>
                        {artwork.collection || "Not specified"}
                      </Typography>
                    </Box>

                    <Box sx={styles.detailRow}>
                      <Typography variant="body1" sx={styles.detailLabel}>
                        Price:
                      </Typography>
                      <Typography variant="body1" sx={styles.detailValue}>
                        {artwork.price
                          ? `RM ${artwork.price}`
                          : "Not specified"}
                      </Typography>
                    </Box>

                    <Box sx={styles.detailRow}>
                      <Typography variant="body1" sx={styles.detailLabel}>
                        Date Uploaded:
                      </Typography>
                      <Typography variant="body1" sx={styles.detailValue}>
                        {formatDate(artwork.dateUploaded)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={styles.actionButtons}>
                    <Button
                      variant="contained"
                      startIcon={<StarIcon />}
                      sx={buttonStyles}
                      
                    >
                      Rate
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
