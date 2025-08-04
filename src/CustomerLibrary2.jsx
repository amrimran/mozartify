import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  List,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  ListItemButton,
  IconButton,
  InputBase,
  Paper,
  Button,
  Drawer,
  FormControl,
  InputLabel,
  TextField,
  Select,
  Snackbar,
  MenuItem,
  Alert,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material";
import { Favorite, FilterAlt, Menu as MenuIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar2 from "./CustomerSidebar2";

axios.defaults.withCredentials = true;
import { API_BASE_URL} from './config/api.js';

export default function CustomerLibrary2() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [user, setUser] = useState(null);

  const [currentArtworks, setCurrentArtworks] = useState([]);
  const [unfilteredArtworks, setUnfilteredArtworks] = useState([]);
  const [searchedArtworks, setSearchedArtworks] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  //for dynamic filter options
  const [dynamicFilters, setDynamicFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isFiltered, setIsFiltered] = useState(false);


  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile || isTablet]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/current-user`);
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
    const fetchDynamicFilterOptions = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/artwork-refine-search`
        );
        setDynamicFilters(response.data);
      } catch (error) {
        console.error("Error fetching refine search lists:", error);
      }
    };

    fetchDynamicFilterOptions();
  }, []);

  useEffect(() => {
    const fetchOwnedArtworks = async () => {
      try {
        const purchaseResponse = await axios.get(
          `${API_BASE_URL}/user-artwork-purchases`
        );

        const purchasedScoreIds = purchaseResponse.data.map(
          (purchase) => purchase.artwork_id
        );

        if (purchasedScoreIds.length > 0) {
          const response = await axios.get(`${API_BASE_URL}/artworks`, {
            params: { artworkIds: purchasedScoreIds },
          });

          setUnfilteredArtworks(response.data);
          setCurrentArtworks(response.data);
        } else {
          setUnfilteredArtworks([]);
        }
      } catch (error) {
        console.error("Error fetching owned artworks:", error);
      }
    };

    fetchOwnedArtworks();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const loweredQuery = searchQuery.toLowerCase();
  
      const searchResult = unfilteredArtworks.filter((artwork) => {
        return Object.entries(artwork).some(([key, value]) => {
          // Skip unwanted fields
          const exclude = [
            "_id",
            "__v",
            "downloads",
            "deleted",
            "imageUrl",
            "price",
            "dateUploaded",
            "createdAt",
            "updatedAt"
          ];
  
          // Only check string fields not in the excluded list
          return (
            !exclude.includes(key) &&
            typeof value === "string" &&
            value.toLowerCase().includes(loweredQuery)
          );
        });
      });
  
      setSearchedArtworks(searchResult);
      setCurrentArtworks(searchResult);
    } else {
      setCurrentArtworks(unfilteredArtworks);
    }
  }, [searchQuery, unfilteredArtworks]);
  

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const clearFilters = () => {
    setSelectedFilters({});
    setIsFiltered(false);
    setSearchedArtworks(unfilteredSearchedArtworks);
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

  const handleFilterRequest = async () => {
    const isAnyFilterSelected = Object.values(selectedFilters).some(
      (arr) => arr.length > 0
    );

    if (!isAnyFilterSelected) {
      setIsFiltered(false);
      setSearchedArtworks(currentArtworks);
      return;
    }

    setIsFiltered(true);

    try {
      // Filter client-side
      const filtered = currentArtworks.filter((item) =>
        Object.entries(selectedFilters).every(([field, values]) => {
          if (!values.length) return true;
          return values.includes(item[field]);
        })
      );
      setCurrentArtworks(filtered);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
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
        `${API_BASE_URL}/set-favorites-artwork`,
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

  const GlobalStyle = createGlobalStyle`
   @keyframes skeleton-wave {
    0% {
      opacity: 1;
    }
    25% {
      opacity: 0.25;
    }
    50% {
      opacity: 0.5;
    }
    75% {
      opacity: 0.75;
    }
    100% {
      opacity: 1;
    }
  }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', sans-serif;
      overflow-x: hidden;
    }

    @keyframes skeleton-wave {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `;

  const buttonStyles = {
    px: 10,
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#FFB6A5",
    border: "1px solid #FFB6A5",
    borderColor: "#FFB6A5",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#FF9F8F",
      color: "#FFFFFF",
      borderColor: "#FF9F8F",
      boxShadow: "none",
    },
    "&:disabled": {
      backgroundColor: "#E0E0E0",
      borderColor: "#E0E0E0",
      color: "#9E9E9E",
    },
  };

  const buttonStyles2 = {
    px: 10,
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFB6A5",
    backgroundColor: "#FFFFFF",
    boxShadow: "none", // Correct spelling
    border: "1px solid #FFB6A5",
    "&:hover": {
      boxShadow: "none", // Correct spelling
      backgroundColor: "#E6F8FB",
      color: "#7AB9C4",
      borderColor: "#7AB9C4",
    },
  };

  const deleteButtonStyles = {
    px: 10,

    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    borderColor: "#DB2226",
    backgroundColor: "#DB2226",

    boxShadow: "none", // Ensures no shadow on hover
    "&:hover": {
      backgroundColor: "#B71C1C", // Slightly darker red
      color: "#FFFFFF", // Keeps the text color consistent
      borderColor: "#B71C1C", // Matches the background color for cohesion
      boxShadow: "none", // Ensures no shadow on hover
    },
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh", position: "relative" }}>
        {/* Sidebar */}
        {!(isMobile || isTablet) ? (
          <Box
            sx={{
              width: 225,
              flexShrink: 0,
              overflowY: "auto",
            }}
          >
            <CustomerSidebar2 active="library" />
          </Box>
        ) : (
          // Drawer for smaller screens
          <Drawer
            variant="temporary"
            anchor="left"
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            sx={{
              "& .MuiDrawer-paper": {
                width: 225,
                boxSizing: "border-box",
              },
            }}
          >
            <CustomerSidebar2 active="library" />
          </Drawer>
        )}

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 2, md: 3 },
            pl: { xs: 1, sm: 2, md: 5 },
            mb: 4,
            width: "100%",
            overflow: "auto",
          }}
        >
          {(isMobile || isTablet) && (
            <Box
              sx={{
                position: "relative",
                top: 10,
                left: 0,
                right: 0,
                zIndex: 100,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
              }}
            >
              <IconButton onClick={handleToggleSidebar}>
                <MenuIcon />
              </IconButton>

              {(isMobile || isTablet) && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {loading ? (
                    <>
                      <Skeleton
                        variant="text"
                        width={100}
                        height={24}
                        sx={{
                          mr: 2,
                          fontFamily: "Montserrat",
                          animation: "wave",
                        }}
                      />
                      <Skeleton variant="circular" width={40} height={40} />
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="body1"
                        sx={{ mr: 2, fontFamily: "Montserrat" }}
                      >
                        {user?.username}
                      </Typography>
                      <Avatar
                        alt={user?.username}
                        src={
                          user && user?.profile_picture
                            ? user?.profile_picture
                            : null
                        }
                      >
                        {(!user || !user?.profile_picture) &&
                          user?.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Search and Filter Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: isMobile
                ? "center"
                : isTablet
                  ? "center"
                  : "none",
              alignItems: "center",
              width: "100%",
              mb: 3,
              mt: isMobile ? 2 : isTablet ? 2 : 0,
              gap: 2, // Add consistent spacing between elements
            }}
          >
            {/* Left spacing */}
            {/* <Box sx={{ flex: "1 1 0" }} /> */}

            {/* Search Bar Container */}
            <Box
              sx={{
                flex: "2 1 auto",
                display: "flex",
                justifyContent: isMobile
                  ? "center"
                  : isTablet
                    ? "center"
                    : "none",
                alignItems: "center",
                maxWidth: { xs: "100%", sm: "100%", md: "100%" },
                width: { xs: "100%", sm: "100%", md: "100%" },
                mt: isMobile ? 2 : isTablet ? 2 : 0,
              }}
            >
              <Paper
                component="form"
                sx={{
                  p: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between", // Align content inside Paper horizontally
                  width: { xs: 350, sm: 600, md: 600 },
                  border: "1px solid #FFB6A5",
                  borderRadius: "50px",
                }}
              >
                <InputBase
                  sx={{
                    ml: 1,
                    flex: 1,
                    fontFamily: "Montserrat",
                    textAlign: "center", // Ensure input text is centered
                  }}
                  placeholder={
                    isMobile ? "Search..." : "Look for all  artworks here..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>
              <IconButton
                sx={{
                  p: "10px",
                  ml: 1,
                }}
                onClick={() => setIsDrawerOpen(true)}
              >
                <FilterAlt />
              </IconButton>

              <Drawer
                anchor="right"
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
              >
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                    width: 300,
                    fontFamily: "Montserrat",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      textAlign: "center", // Centers the text horizontally
                    }}
                  >
                    Filter Options
                  </Typography>

                  {Object.entries(dynamicFilters).map(
                    ([filterName, values]) => (
                      <FormControl key={filterName} fullWidth sx={{ mb: 2 }}>
                        <InputLabel
                          sx={{
                            fontFamily: "Montserrat",
                            textTransform: "capitalize",
                          }}
                        >
                          {filterName}
                        </InputLabel>
                        <Select
                          multiple
                          value={selectedFilters[filterName] || []}
                          onChange={(e) =>
                            setSelectedFilters((prev) => ({
                              ...prev,
                              [filterName]: e.target.value,
                            }))
                          }
                          renderValue={(selected) => selected.join(", ")}
                          sx={{
                            fontFamily: "Montserrat",
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#FFB6A5",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#FFB6A5",
                            },
                          }}
                        >
                          {values.map((value) => (
                            <MenuItem
                              key={value}
                              value={value}
                              sx={{ fontFamily: "Montserrat" }}
                            >
                              {value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )
                  )}

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 2,
                      ...buttonStyles,
                    }}
                    onClick={handleFilterRequest}
                  >
                    APPLY FILTERS
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 2,
                      ...deleteButtonStyles,
                    }}
                    onClick={clearFilters}
                  >
                    CLEAR FILTERS
                  </Button>

                  <Box sx={{ mt: "auto" }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        mb: 2,
                        ...buttonStyles2,
                      }}
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      CLOSE FILTERS
                    </Button>
                  </Box>
                </Box>
              </Drawer>
            </Box>

            {/* User Info */}
            {!isMobile && !isTablet && (
              <Box
                sx={{
                  flex: "1 1 0",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <>
                    <Skeleton
                      variant="text"
                      width={100}
                      height={24}
                      sx={{
                        mr: 2,
                        fontFamily: "Montserrat",
                        animation: "wave",
                      }}
                    />
                    <Skeleton variant="circular" width={40} height={40} />
                  </>
                ) : (
                  <>
                    <Typography
                      variant="body1"
                      sx={{ mr: 2, fontFamily: "Montserrat" }}
                    >
                      {user?.username}
                    </Typography>
                    <Avatar
                      alt={user?.username}
                      src={
                        user && user?.profile_picture
                          ? user?.profile_picture
                          : null
                      }
                    >
                      {(!user || !user?.profile_picture) &&
                        user?.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </>
                )}
              </Box>
            )}
          </Box>

          {/* Library Title and Count */}
          <Box sx={{ px: { xs: 2, sm: 1 } }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                textAlign: isMobile || isTablet ? "center" : "left", // Center text for mobile or tablet
                width: "100%", // Ensure it spans full width for proper centering
              }}
            >
              Library
            </Typography>

            {loading ? (
              <>
                <Skeleton
                  variant="text"
                  width={200}
                  height={24}
                  sx={{
                    mr: 2,
                    fontFamily: "Montserrat",
                    animation: "wave",
                  }}
                />
              </>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Montserrat",
                  fontWeight: "medium",
                  textAlign: isTablet || isMobile ? "center" : "left", // Center-align when on tablet or mobile
                }}
              >
                You have{" "}
                <Box
                  component="span"
                  sx={{ fontWeight: "bold", color: "#FFB6A5" }}
                >
                  {currentArtworks.length > 99 ? "99+" : currentArtworks.length}
                </Box>{" "}
                owned artworks.
                {currentArtworks.length > 0 && " Please do enjoy them 😁"}
              </Typography>
            )}
          </Box>

          {/* Artworks List */}
          <Box sx={{ flexGrow: 1, overflow: "auto", p: { xs: 1, sm: 2 } }}>
            <List>
              {currentArtworks.map((item) => (
                <ListItemButton
                  key={item._id}
                  onClick={() =>
                    navigate(
                      `/customer-library/customer-artwork-view/${item._id}`
                    )
                  }
                  sx={{
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    padding: { xs: 2, sm: 1 },
                  }}
                >
                  <ListItemText
                    primary={
                      loading ? (
                        <Skeleton
                          variant="text"
                          width={150}
                          height={24}
                          sx={{
                            mr: 2,
                            fontFamily: "Montserrat",
                            animation: "wave",
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: "Montserrat",
                            fontWeight: "bold",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          }}
                        >
                          {item.title}
                        </Typography>
                      )
                    }
                    secondary={
                      loading ? (
                        <Skeleton
                          variant="text"
                          width={400}
                          height={24}
                          sx={{
                            mr: 2,
                            fontFamily: "Montserrat",
                            animation: "wave",
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "Montserrat",
                            color: "black",
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            mt: { xs: 1, sm: 0 },
                          }}
                        >
                          Collection: {item.collection} | Artist: {item.artist}
                        </Typography>
                      )
                    }
                  />

                  <ListItemIcon
                    sx={{
                      minWidth: { xs: "100%", sm: 40 },
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    {loading ? null : (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item._id);
                        }}
                        sx={{ ml: { xs: -1, sm: 0 } }}
                      >
                        <Favorite
                          color={
                            favorites.includes(item._id) ? "error" : "disabled"
                          }
                        />
                      </IconButton>
                    )}
                  </ListItemIcon>
                </ListItemButton>
              ))}
            </List>
          </Box>
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
    </>
  );
}
