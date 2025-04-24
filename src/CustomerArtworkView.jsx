import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Typography,
  Button,
  Avatar,
  Divider,
  Paper,
  Grid,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Snackbar,
} from "@mui/material";
import { Menu as MenuIcon, Edit, Delete } from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useParams, useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar2 from "./CustomerSidebar2";
import Rating from "@mui/material/Rating";

const DRAWER_WIDTH = 225;

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

  * {
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

const favoritesButtonStyles = {
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
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [purchaseExists, setPurchaseExists] = useState(false);

  const [isRated, setIsRated] = useState(false);
  const [ratingGiven, setRatingGiven] = useState(null);
  const [ratingHover, setRatingHover] = useState(-1); // Store the hover value

  const [addedToCartScores, setAddedToCartScores] = useState([]);

  const [showRatingInput, setShowRatingInput] = useState(false); // Toggle visibility of rating input

  const ratingLabels = {
    0.5: "Poor",
    1: "Fair",
    1.5: "Okay",
    2: "Average",
    2.5: "Good",
    3: "Very Good",
    3.5: "Excellent",
    4: "Amazing",
    4.5: "Outstanding",
    5: "Perfect",
  };

  const excludeFields = [
    "_id",
    "__v",
    "downloads",
    "deleted",
    "imageUrl",
    "dateUploaded",
    "createdAt",
    "updatedAt",
    "title",
  ];

  // Helper function to format field names nicely
  const formatLabel = (key) =>
    key
      .replace(/([A-Z])/g, " $1") // insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // capitalize first letter
      .replace(/([a-z])([A-Z])/g, "$1 $2"); // handle camelCase to words

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "", // Add this to handle snackbar type (e.g., "cart", "favorite", etc.)
  });

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
        setFavorites(response.data.favorites_art);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [favorites]);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/fetchArts/${artworkId}`
        );
        if (response.data) {
          const processedArtwork = {
            ...response.data,
          };
          setArtwork(processedArtwork);
        } else {
          setError("Artwork not found");
        }
      } catch (error) {
        console.error("Error fetching artwork:", error);
        setError("Error loading artwork");
      }
    };

    if (artworkId) {
      fetchArtwork();
    }
  }, [artworkId]);

  useEffect(() => {
    const checkPurchase = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/check-artwork-purchase",
          {
            artwork_id: artworkId,
            user_id: user?._id,
          }
        );
        const data = response.data;
        setPurchaseExists(data.exists);

        if (data.exists && data.data?.length > 0) {
          const rating = data.data[0]?.ratingGiven ?? null;
          setRatingGiven(rating); // Set the ratingGiven value in state
          setIsRated(rating > 0); // Check if ratingGiven > 0 and set isRated
        } else {
          setRatingGiven(null); // If no purchase data, reset ratingGiven
          setIsRated(false); // If no purchase data, set isRated to false
        }
      } catch (error) {
        if (error.response) {
          console.error(
            "Server Error:",
            error.response.data.message || error.response.statusText
          );
        } else if (error.request) {
          console.error("No response received from the server:", error.request);
        } else {
          console.error("Error checking purchase:", error.message);
        }
      }
    };

    if (artworkId && user?._id) {
      checkPurchase();
    }
  }, [artworkId, user?._id]);

  useEffect(() => {
    const fetchAddedToCartScores = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/user-artwork-cart"
        );

        if (response.data.length === 0) {
          setAddedToCartScores([]);
          return;
        }

        const AddedScoreIds = response.data.map((added) => added.score_id);

        setAddedToCartScores(AddedScoreIds);
      } catch (error) {
        console.error("Error fetching user's cart:", error);
        navigate("/login");
      }
    };

    fetchAddedToCartScores();
  }, [navigate]);

  // Helper function (modified for your actual structure)

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

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return; // Prevent snackbar from closing on clickaway (optional)
    }

    setSnackbar({
      open: false,
      message: "",
      type: "",
    });
  };

  const toggleFavorite = async (artworkId) => {
    try {
      const isFavorite = user?.favorites_art?.includes(artworkId);

      // Optimistically update the favorites locally for instant feedback
      setFavorites((prevFavorites) => {
        if (isFavorite) {
          // Remove from favorites
          return prevFavorites.filter((favId) => favId !== artworkId);
        } else {
          // Add to favorites
          return [...prevFavorites, artworkId];
        }
      });

      // Send the request to the server
      const response = await axios.post(
        "http://localhost:3000/set-favorites-artwork",
        {
          artworkId,
          action: isFavorite ? "remove" : "add", // Explicitly specify the action
        }
      );

      // Update the favorites with the server response (ensures consistency)
      setFavorites(response.data.favorites_art);

      // Show appropriate snackbar message
      setSnackbar({
        open: true,
        message: isFavorite
          ? "Removed from favorites successfully!"
          : "Added to favorites successfully!",
        type: isFavorite ? "unfavorite" : "favorite",
        reload: true, // Add a flag to determine whether to reload after snackbar
      });
    } catch (error) {
      console.error("Error updating favorites:", error);

      // Revert the optimistic update in case of an error
      setFavorites((prevFavorites) => {
        if (favorites) {
          // Add back the removed favorite
          return [...prevFavorites, artworkId];
        } else {
          // Remove the added favorite
          return prevFavorites.filter((favId) => favId !== artworkId);
        }
      });

      // Optionally show an error snackbar
      setSnackbar({
        open: true,
        message: "Failed to update favorites. Please try again.",
        type: "error",
        reload: false, // No reload on error
      });
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

  const handleDownload = (url, filename = "download.jpg") => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename); // This hints the browser to download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  const handleSubmitRating = async () => {
    console.log("rating: " + ratingGiven);
    if (ratingGiven > 0) {
      try {
   
        await axios.post("http://localhost:3000/submit-artwork-rating", {
          rating: ratingGiven,
          artworkId: artworkId,
          userId: user?._id,
        });

        // Show a success snackbar
        setSnackbar({
          open: true,
          message: `Thank you for your rating! You rated: ${ratingGiven} stars.`,
          type: "success",
        });

        // Close the floating rating input
        setShowRatingInput(false);

        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Adjust delay as needed
      } catch (error) {
        console.error("Error submitting rating:", error);

        // Show an error snackbar
        setSnackbar({
          open: true,
          message: "Failed to submit your rating. Please try again later.",
          type: "error",
        });
      }
    } else {
      // Show an error snackbar if no rating is selected
      setSnackbar({
        open: true,
        message: "Please select a rating before submitting.",
        type: "error",
      });
    }
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

          {error && (
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
                onClick={() => navigate("/customer-homepage-2")}
              >
                Return to Gallery
              </Button>
            </Box>
          )}

          {/* Artwork Details */}
          {!error && artwork && (
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
                          filter: purchaseExists ? "none" : "blur(8px)",
                          transition: "filter 0.3s ease",
                        }}
                      />
                      {!purchaseExists && (
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
                      {/* {purchaseExists && (
                        <Button
                          variant="outlined"
                          onClick={() =>
                            handleDownload(
                              artwork.imageUrl,
                              `${artwork.title || artwork._id}.jpg`
                            )
                          }
                          sx={{
                            fontFamily: "Montserrat",
                            fontSize: "0.9rem",
                            color: "#333",
                            borderColor: "#FFB6A5",
                            "&:hover": {
                              backgroundColor: "#FFB6A5",
                              color: "#fff",
                              borderColor: "#FFB6A5",
                            },
                          }}
                        >
                          Download Image
                        </Button>
                      )} */}
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
                    {Object.entries(artwork)
                      .filter(([key]) => !excludeFields.includes(key))
                      .map(([key, value]) => (
                        <Box key={key} sx={styles.detailRow}>
                          <Typography variant="body1" sx={styles.detailLabel}>
                            {formatLabel(key)}:
                          </Typography>
                          <Typography variant="body1" sx={styles.detailValue}>
                            {value !== undefined && value !== ""
                              ? String(value)
                              : "Not specified"}
                          </Typography>
                        </Box>
                      ))}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<FavoriteIcon />}
                      onClick={(e) => {
                        toggleFavorite(artworkId);
                      }}
                      sx={{
                        ...favoritesButtonStyles,
                      }}
                    >
                      {user?.favorites_art?.includes(artworkId)
                        ? "Added to Favorites"
                        : "Favorites"}
                    </Button>

                    {purchaseExists === false ? (
                      addedToCartScores.includes(artworkId) ? (
                        // "Added to Cart" Button
                        <Button
                          variant="contained"
                          startIcon={<ShoppingCartIcon />}
                          sx={{
                            px: 5,
                            fontFamily: "Montserrat",
                            fontWeight: "bold",
                            color: "#FFFFFF",
                            backgroundColor: "#4CAF50", // Green background for added items
                            "&:hover": {
                              backgroundColor: "#388E3C", // Darker green for hover
                            },
                          }}
                          disabled // Prevent further interaction with this button
                        >
                          Added to Cart
                        </Button>
                      ) : (
                        // "Add to Cart" Button
                        <Button
                          variant="contained"
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => addToCart(artworkId)}
                          sx={{
                            ...buttonStyles,
                            px: 5, // Preserve original styles
                          }}
                        >
                          Add to Cart
                        </Button>
                      )
                    ) : isRated === false ? (
                      <Box sx={{ position: "relative" }}>
                        {/* Rating Button */}
                        <Button
                          variant="contained"
                          startIcon={<StarIcon />}
                          onClick={() => {
                            setShowRatingInput((prev) => !prev); // Toggle the visibility of the rating input
                          }}
                          sx={{
                            fontFamily: "Montserrat",
                            fontWeight: "bold",
                            border: "1px solid #FFD700",
                            backgroundColor: "#FFD700", // Yellow background
                            color: "#FFFFFF", // White text
                            boxShadow: "none",
                            px: 10,
                            position: "relative",
                            zIndex: 1, // Ensure button stays above floating input
                            "&:hover": {
                              boxShadow: "none",
                              backgroundColor: "#FFFFFF", // White background on hover
                              color: "#FFD700", // Yellow text on hover
                            },
                          }}
                        >
                          Rate
                        </Button>

                        {/* Floating Rating Input */}
                        {showRatingInput && (
                          <Box
                            sx={{
                              position: "absolute", // Floating positioning
                              top: "110%", // Position below the button
                              left: "50%",
                              transform: "translateX(-50%)", // Center horizontally
                              zIndex: 999, // Ensure it's above everything else
                              backgroundColor: "#FFFFFF", // White background
                              border: "1px solid #DDD", // Light border
                              borderRadius: "8px",
                              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow
                              padding: "16px", // Add padding for the floating box
                              width: "300px", // Fixed width
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ fontFamily: "Montserrat" }}
                            >
                              Select your rating:
                            </Typography>

                            {/* Rating Component */}
                            <Rating
                              name="hover-feedback"
                              value={ratingGiven} // Persist the selected rating
                              precision={0.5} // Allows half-star ratings
                              onChange={(event, newValue) => {
                                setRatingGiven(newValue); // Update rating value on selection
                              }}
                              onChangeActive={(event, newHover) => {
                                setRatingHover(newHover); // Update hover state
                              }}
                              emptyIcon={
                                <StarIcon
                                  style={{ opacity: 0.55 }}
                                  fontSize="inherit"
                                />
                              }
                            />
                            {ratingGiven !== null && (
                              <Box
                                sx={{
                                  mt: 1,
                                  fontFamily: "Montserrat",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {
                                  ratingLabels[
                                    ratingHover !== -1
                                      ? ratingHover
                                      : ratingGiven
                                  ]
                                }{" "}
                                {/* Display guide text */}
                              </Box>
                            )}

                            <Button
                              variant="contained"
                              onClick={handleSubmitRating}
                              sx={{
                                mt: 2,
                                ...buttonStyles,
                              }}
                            >
                              Submit
                            </Button>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<StarIcon sx={{ color: "#FFD700" }} />}
                        sx={{
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          border: "1px solid #000000", // Black border
                          backgroundColor: "#000000", // Black background
                          color: "#FFD700", // Yellow text
                          boxShadow: "none",
                          px: 10,
                          cursor: "default", // Non-interactive for the "Rated" state
                          "&:hover": {
                            boxShadow: "none", // No hover animation
                            backgroundColor: "#000000", // Keep black background
                            color: "#FFD700", // Keep yellow text
                          },
                        }}
                      >
                        {ratingGiven}/5
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000} // Set the duration before the snackbar disappears
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return; // Prevent snackbar from closing on clickaway if desired
          }
          handleSnackbarClose(); // Close the snackbar
          if (snackbar.reload) {
            // window.location.reload(); // Reload the page after snackbar closes
          }
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.type === "error" ? "error" : "success"}
          sx={{
            width: "100%",
            bgcolor: snackbar.type === "unfavorite" ? "#F44336" : "#4CAF50",
            color: "white",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
