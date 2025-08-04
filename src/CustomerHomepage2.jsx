import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Alert,
  Snackbar,
  Pagination,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Avatar,
  Typography,
  IconButton,
  InputBase,
  Paper,
  Button,
  Drawer,
  FormControl,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Skeleton,
  Divider,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { keyframes } from "@mui/system";
import Favorite from "@mui/icons-material/Favorite";
import { PlayArrow, FilterAlt } from "@mui/icons-material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar2 from "./CustomerSidebar2";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuIcon from "@mui/icons-material/Menu";

axios.defaults.withCredentials = true;
import { API_BASE_URL} from './config/api.js';

export default function CustomerHomepage2() {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg")); // PC & Large laptops
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md")); // Small laptops & tablets
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Mobile phones
  const [user, setUser] = useState(null);
  const [unfilteredSearchedArtworks, setUnfilteredSearchedArtworks] = useState(
    []
  );
  const [purchasedArtworks, setPurchasedArtworks] = useState([]);
  const [addedToCartArtworks, setAddedToCartArtworks] = useState([]);
  const [searchedArtworks, setSearchedArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [popularArtworks, setPopularArtworks] = useState([]);
  const [recommendedArtworks, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerOpen2, setIsDrawerOpen2] = useState(false);

  const [collection, setCollection] = useState("");
  const [artist, setArtist] = useState("");

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });

  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const scrollContainerRef2 = useRef(null);
  const popularScrollRef = useRef(null);
  const recommendedScrollRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Calculate pagination
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArtworks = searchedArtworks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(searchedArtworks.length / itemsPerPage);

  //for dynamic filter options
  const [dynamicFilters, setDynamicFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    let scrollInterval;
    let userScrollTimeout;

    const startAutoScroll = (ref) => {
      if (ref.current) {
        scrollInterval = setInterval(() => {
          ref.current.scrollBy({
            top: 1, // Adjust the speed by increasing or decreasing this value
            behavior: "smooth",
          });

          // If at the bottom, scroll back to the top
          if (
            ref.current.scrollTop + ref.current.clientHeight >=
            ref.current.scrollHeight
          ) {
            ref.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 30); // Adjust interval speed
      }
    };

    const stopAutoScroll = () => {
      clearInterval(scrollInterval);
    };

    const handleUserScroll = () => {
      setIsUserScrolling(true);
      stopAutoScroll();
      clearTimeout(userScrollTimeout);
      userScrollTimeout = setTimeout(() => {
        setIsUserScrolling(false);
        startAutoScroll(popularScrollRef);
        startAutoScroll(recommendedScrollRef);
      }, 3000); // 3 seconds delay
    };

    // Start auto-scroll
    startAutoScroll(popularScrollRef);
    startAutoScroll(recommendedScrollRef);

    // Add event listeners for user interaction
    popularScrollRef.current?.addEventListener("scroll", handleUserScroll);
    recommendedScrollRef.current?.addEventListener("scroll", handleUserScroll);

    return () => {
      stopAutoScroll();
      popularScrollRef.current?.removeEventListener("scroll", handleUserScroll);
      recommendedScrollRef.current?.removeEventListener(
        "scroll",
        handleUserScroll
      );
    };
  }, []);

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
    const fetchPurchasedArtworks = async () => {
      try {
        const response = await axios.get(
        `${API_BASE_URL}/user-artwork-purchases`
        );

        const purchasedArtworkIds = response.data.map(
          (purchase) => purchase.artwork_id
        );

        setPurchasedArtworks(purchasedArtworkIds);
      } catch (error) {
        console.error("Error fetching user's purchased artworks:", error);
        navigate("/login");
      }
    };
    fetchPurchasedArtworks();
  }, []);

  useEffect(() => {
    const fetchAddedToCartArtworks = async () => {
      try {
        const response = await axios.get(
        `${API_BASE_URL}/user-artwork-cart`
        );

        if (response.data.length === 0) {
          setAddedToCartArtworks([]);
          return;
        }

        const AddedArtworkIds = response.data.map((added) => added.artwork_id);

        setAddedToCartArtworks(AddedArtworkIds);
      } catch (error) {
        console.error("Error fetching user's cart:", error);
        navigate("/login");
      }
    };

    fetchAddedToCartArtworks();
  }, [navigate, addedToCartArtworks]);

  useEffect(() => {
    if (searchQuery) {
      const fetchSearchedArtworks = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/search-artworks`,
            {
              params: { query: searchQuery },
            }
          );
          setUnfilteredSearchedArtworks(response.data);
          setSearchedArtworks(response.data);
        } catch (error) {
          console.error("Error fetching searched artworks:", error);
        }
      };

      fetchSearchedArtworks();
    } else {
      setUnfilteredSearchedArtworks([]);
      setSearchedArtworks([]);
    }
  }, [searchQuery]);

  const clearFilters = () => {
    setSelectedFilters({});
    setIsFiltered(false);
    setSearchedArtworks(unfilteredSearchedArtworks);
  };

  const handleFilterRequest = async () => {
    const isAnyFilterSelected = Object.values(selectedFilters).some(
      (arr) => arr.length > 0
    );

    if (!isAnyFilterSelected) {
      setIsFiltered(false);
      setSearchedArtworks(unfilteredSearchedArtworks);
      return;
    }

    setIsFiltered(true);

    try {
      if (!searchQuery) {
        // Fetch from backend
        const response = await axios.get(
         `${API_BASE_URL}/filter-artworks`,
          {
            params: selectedFilters,
          }
        );
        setFilteredArtworks(response.data);
      } else {
        // Filter client-side
        const filtered = searchedArtworks.filter((item) =>
          Object.entries(selectedFilters).every(([field, values]) => {
            if (!values.length) return true;
            return values.includes(item[field]);
          })
        );
        setSearchedArtworks(filtered);
      }
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const scrollAnimation = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
`;

  useEffect(() => {
    try {
      axios
        .get(`${API_BASE_URL}/popular-artworks`)
        .then((response) => {
          setPopularArtworks(response.data);
        })
        .catch((error) => {
          console.error("Error fetching popular artworks: ", error);
        });
    } catch (error) {
      console.error("Error fetching popular artworks:", error);
    }
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/artwork-recommendations`)
      .then((response) => {
        // Randomizing the order of the recommendations
        const shuffledRecommendations = response.data.sort(
          () => Math.random() - 0.5
        );

        // Setting the randomized recommendations
        setRecommendations(shuffledRecommendations);
      })
      .catch((error) => {
        console.error("Error fetching recommended artworks: ", error);
      });
  }, []);

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

  const addToCart = async (artworkId) => {
    try {
      await axios.post(`${API_BASE_URL}/add-to-cart-artwork`, {
        artworkId: artworkId,
      });
      setAddedToCartArtworks([...addedToCartArtworks, artworkId]);
      setSnackbar({
        open: true,
        message: "Added to cart successfully!",
        type: "cart",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
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
    overflow-y: ${(props) => (props.isLargeScreen ? "hidden" : "auto")};
    overflow-x: "hidden;
    
  }

  * {
    font-family: 'Montserrat', sans-serif;
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
    boxShadow: "none", // Correct spelling
    "&:hover": {
      backgroundColor: "#FF9F8F", // Slightly darker blue for hover
      color: "#FFFFFF", // Keeps the text color consistent
      borderColor: "#FF9F8F",
      boxShadow: "none", // Ensures no shadow on hover
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

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <GlobalStyle isLargeScreen={isLargeScreen} />
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100vw", // Ensure full viewport width
          overflowX: "hidden", // Prevent horizontal scrolling at container level
          overflowY: "hidden", // Prevent horizontal scrolling at container level
        }}
      >
        {isLargeScreen ? (
          <Box
            sx={{
              width: 225,
              flexShrink: 0,
              overflowY: "auto",
            }}
          >
            <CustomerSidebar2 active="home" />
          </Box>
        ) : (
          // Drawer for smaller screens
          <Drawer
            variant="temporary"
            anchor="left"
            open={isDrawerOpen2}
            onClose={() => setIsDrawerOpen2(false)}
            sx={{
              "& .MuiDrawer-paper": {
                width: 225,
                boxSizing: "border-box",
              },
            }}
          >
            <CustomerSidebar2 active="home" />
          </Drawer>
        )}

        <Box
          sx={{
            flexGrow: 1,
            p: isSmallScreen ? 1 : 3,
            pl: isSmallScreen ? 2 : 5,
            overflowX: "hidden", // Prevent horizontal scrolling
            width: "100%", // Take full width of parent
            maxWidth: "100%", // Ensure content doesn't overflow
          }}
        >
          {!isLargeScreen && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                mb: 2,
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setIsDrawerOpen2(true)}
              >
                <MenuIcon />
              </IconButton>

              {/* User info section */}
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
                      sx={{
                        width: isLargeScreen ? 90 : isMediumScreen ? 40 : 30, // Adjust width
                        height: isLargeScreen ? 90 : isMediumScreen ? 40 : 30, // Adjust height
                      }}
                    >
                      {(!user || !user?.profile_picture) &&
                        user?.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </>
                )}
              </Box>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 3,
              gap: 2,
              flexDirection: isSmallScreen ? "column" : "row",
              width: "100%", // Take full width
              maxWidth: "100%", // Prevent overflow
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: isSmallScreen ? "100%" : "auto",
                maxWidth: "100%", // Prevent overflow
              }}
            >
              <Paper
                component="form"
                sx={{
                  p: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  width: isSmallScreen
                    ? "calc(100% - 60px)"
                    : isMediumScreen
                      ? 400
                      : 1000, // Account for filter icon
                  border: "1px solid #FFB6A5",
                  borderRadius: "50px",
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1, fontFamily: "Montserrat" }}
                  placeholder="Look for all artworks here..."
                  inputProps={{ "aria-label": "search artworks" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>
              <IconButton
                sx={{ p: "10px", ml: 2 }}
                aria-label="filter"
                onClick={() => setIsDrawerOpen(true)}
              >
                <FilterAlt sx={{ color: "#00000" }} />
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
                    width: isSmallScreen ? "50vw" : 300,
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
                    Art Filter Options
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

            {/* Original user info box - only show on large screens */}
            {isLargeScreen && (
              <Box
                sx={{
                  position: "absolute",
                  top: 28,
                  right: 40,
                  display: "flex",
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

          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontFamily: "Montserrat",
              fontWeight: "bold",
              mt: 4,
              mb: 1,
              textAlign: { xs: "center", lg: "left" }, // Will be center until lg breakpoint
            }}
          >
            {searchQuery || isFiltered ? "Search Result" : "Dashboard"}
          </Typography>
          {/* Only show results count when searching or filtering */}
          {(searchQuery || isFiltered) && (
            <Typography variant="body1" sx={{ fontFamily: "Montserrat" }}>
              Found{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", color: "#FFB6A5" }}
              >
                {searchQuery
                  ? searchedArtworks.length > 99
                    ? "99+"
                    : searchedArtworks.length
                  : filteredArtworks.length > 99
                    ? "99+"
                    : filteredArtworks.length}
              </Box>{" "}
              results
            </Typography>
          )}

          {searchQuery ? (
            <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
              {searchedArtworks.length > 0 ? (
                <>
                  <List>
                    {currentArtworks.map((artwork) => (
                      <ListItemButton
                        key={artwork._id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          fontFamily: "Montserrat",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                        onClick={() =>
                          navigate(`/customer-artwork-view/${artwork._id}`)
                        }
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{
                                fontFamily: "Montserrat",
                                fontWeight: "bold",
                              }}
                            >
                              {artwork.title}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "Montserrat",
                                color: "black",
                              }}
                            >
                              Collection: {artwork.collection} | Artist:{" "}
                              {artwork.artist}{" "}
                            </Typography>
                          }
                        />
                        <ListItemIcon>
                          {!purchasedArtworks.includes(artwork._id) &&
                            !addedToCartArtworks.includes(artwork._id) && (
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(artwork._id);
                                }}
                              >
                                <ShoppingCartIcon />
                              </IconButton>
                            )}
                        </ListItemIcon>
                        <ListItemIcon>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(artwork._id);
                            }}
                          >
                            <Favorite
                              color={
                                favorites.includes(artwork._id)
                                  ? "error"
                                  : "disabled"
                              }
                            />
                          </IconButton>
                        </ListItemIcon>
                      </ListItemButton>
                    ))}
                  </List>
                  {totalPages > 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "20px",
                        "& .MuiPagination-ul": {
                          "& .MuiPaginationItem-root": {
                            fontFamily: "Montserrat",
                            "&.Mui-selected": {
                              backgroundColor: "#FFB6A5",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "#FF9F8F",
                              },
                            },
                          },
                        },
                      }}
                    >
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        sx={{
                          "& .MuiPaginationItem-root": {
                            borderRadius: 2,
                            fontFamily: "Montserrat",
                            backgroundColor: "primary",
                            color: "#000",
                            "&.Mui-selected": {
                              backgroundColor: "#FFB6A5", // Blue for selected
                              color: "#fff",
                              "&:hover": {
                                backgroundColor: "#FFB6A5", // Keep blue when hovered if selected
                              },
                            },
                            "&:hover": {
                              backgroundColor: "#D3D3D3", // Neutral gray for unselected hover
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body2" sx={{ fontFamily: "Montserrat" }}>
                  No results found
                </Typography>
              )}
            </Box>
          ) : isFiltered ? (
            <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
              {filteredArtworks.length > 0 ? (
                <List>
                  {filteredArtworks.map((artwork) => (
                    <ListItemButton
                      key={artwork._id}
                      sx={{ display: "flex", alignItems: "center" }}
                      onClick={() =>
                        navigate(
                          `/customer-library/customer-artwork-view/${artwork._id}`
                        )
                      }
                    >
                      <ListItemText
                        primary={artwork.title}
                        secondary={`Collection: ${artwork.collection} | Artist: ${artwork.artist}`}
                      />

                      <ListItemIcon>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(artwork._id);
                          }}
                        >
                          <Favorite
                            color={
                              favorites.includes(artwork._id)
                                ? "error"
                                : "disabled"
                            }
                          />
                        </IconButton>
                      </ListItemIcon>
                      <ListItemIcon>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <PlayArrow />
                        </IconButton>
                      </ListItemIcon>
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">No results found</Typography>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                height: "calc(70vh)",
                display: "flex",
                flexDirection: "column",

                width: "100%", // Ensure full width
              }}
            >
              <Grid
                container
                spacing={isSmallScreen ? 2 : 4}
                sx={{
                  mx: 0, // Remove default margin
                  width: "100%", // Take full width
                }}
              >
                {/* Left Box - Popular Artworks */}
                <Grid
                  item
                  xs={12}
                  md={5.5}
                  sx={{
                    paddingLeft: "0 !important",
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      top: 0,
                      backgroundColor: "#fff",
                      zIndex: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontFamily: "Montserrat",
                      mb: 2,
                      mr: { xs: 0, lg: 0 }, // Only add margin-right on large screens
                      width: "100%", // Take full width to allow center alignment
                      textAlign: "center", // Ensure text is centered
                    }}
                  >
                    Popular
                  </Typography>

                  <Box
                    sx={{
                      height: "calc(80vh - 60px)", // Restrict the height to ensure the vertical scrolling works only here
                      overflowY: "auto", // Enable vertical scrolling ONLY for this section
                    }}
                  >
                    <Box
                      ref={scrollContainerRef}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: isSmallScreen
                          ? "repeat(1, 1fr)"
                          : isMediumScreen
                            ? "repeat(2, 1fr)"
                            : "repeat(2, 1fr)",
                        gap: isSmallScreen ? 2 : 5,
                        scrollbarWidth: "none", // Hide scrollbar for Firefox
                        "&::-webkit-scrollbar": {
                          display: "none", // Hide scrollbar for Chrome, Safari, and Edge
                        },
                        scrollBehavior: "smooth",
                      }}
                    >
                      {popularArtworks.map((artwork, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex", // Enables flexbox,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {loading ? (
                            <Card
                              sx={{
                                width: isSmallScreen ? "100%" : 200,
                                maxWidth: isSmallScreen ? 280 : 200, // Control maximum width on mobile
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                boxShadow: "none",
                                mx: isSmallScreen ? "auto" : 0, // Center the card on mobile
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center", // Centers the skeleton horizontally
                                }}
                              >
                                <Skeleton
                                  variant="rectangular"
                                  height={280}
                                  sx={{
                                    borderRadius: 10,
                                    width: isSmallScreen ? 280 : 200,
                                    animation: "wave",
                                  }}
                                />
                              </Box>
                              <CardContent
                                sx={{
                                  flexGrow: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                }}
                              >
                                <Skeleton
                                  variant="text"
                                  width="80%"
                                  height={32}
                                  sx={{
                                    mx: "auto",
                                    animation: "wave",
                                  }}
                                />
                                <Skeleton
                                  variant="text"
                                  width="60%"
                                  height={24}
                                  sx={{
                                    mx: "auto",
                                    animation: "wave",
                                  }}
                                />
                              </CardContent>
                            </Card>
                          ) : (
                            <Link
                              to={`/customer-artwork-view/${artwork._id}`}
                              style={{ textDecoration: "none" }}
                            >
                              <Card
                                sx={{
                                  width: isSmallScreen ? "100%" : 200,
                                  maxWidth: isSmallScreen ? 280 : 200, // Control maximum width on mobile
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  boxShadow: "none",
                                  mx: isSmallScreen ? "auto" : 0, // Center the card on mobile
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  height={isSmallScreen ? 280 : 280}
                                  image={
                                    artwork.imageUrl || "placeholder-image-url"
                                  }
                                  alt={artwork.title || "No Title Available"}
                                  sx={{
                                    border: "2px solid #000",
                                    borderRadius: 10,
                                    width: isSmallScreen ? "280px" : 200, // Fixed width for mobile
                                    padding: "10px",
                                    boxSizing: "border-box",
                                    display: artwork.imageUrl
                                      ? "block"
                                      : "none",
                                    margin: isSmallScreen
                                      ? "0 auto"
                                      : "initial", // Center on mobile
                                  }}
                                />
                                {!artwork.imageUrl && (
                                  <Box
                                    sx={{
                                      height: 280,
                                      width: isSmallScreen ? "280px" : 200,
                                      border: "2px solid #000",
                                      borderRadius: 10,
                                      padding: "10px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      boxSizing: "border-box",
                                      backgroundColor: "#f5f5f5",
                                      margin: isSmallScreen
                                        ? "0 auto"
                                        : "initial", // Center on mobile
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontFamily: "Montserrat",
                                        color: "#000",
                                        textAlign: "center",
                                      }}
                                    >
                                      No Cover Image Available
                                    </Typography>
                                  </Box>
                                )}
                                <CardContent
                                  sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    width: isSmallScreen ? "280px" : "100%", // Match the width of CardMedia
                                    padding: "10px",
                                    boxSizing: "border-box",
                                    margin: isSmallScreen
                                      ? "0 auto"
                                      : "initial", // Center on mobile
                                  }}
                                >
                                  <Tooltip title={artwork.title} arrow>
                                    <Typography
                                      variant="h6"
                                      noWrap
                                      sx={{
                                        textAlign: "center",
                                        mb: 1,
                                        fontFamily: "Montserrat",
                                      }}
                                    >
                                      {artwork.title}
                                    </Typography>
                                  </Tooltip>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{
                                      textAlign: "center",
                                      fontFamily: "Montserrat",
                                    }}
                                  >
                                    {artwork.artist}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Link>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Vertical Divider */}
                {!isSmallScreen ? (
                  <Grid item sx={{ display: "flex", alignItems: "center" }}>
                    <Divider orientation="vertical" flexItem />
                  </Grid>
                ) : (
                  <Grid
                    item
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 10,
                    }}
                  >
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{
                        borderWidth: 1,
                        borderColor: "gray",
                        height: "90%", // Adjust height of the Divider as needed
                      }}
                    />
                  </Grid>
                )}

                {/* Right Box - Recommended Artworks */}
                <Grid
                  item
                  xs={12}
                  md={5.5}
                  sx={{
                    paddingLeft: "5 !important",
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#fff",
                      zIndex: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontFamily: "Montserrat",
                      mb: 2,
                      mr: { xs: 0, lg: 0 }, // Only add margin-right on large screens
                      width: "100%", // Take full width to allow center alignment
                      textAlign: "center", // Ensure text is centered
                    }}
                  >
                    For You
                  </Typography>

                  <Box
                    sx={{
                      height: "calc(80vh - 60px)", // Restrict the height to ensure the vertical scrolling works only here
                      overflowY: "auto", // Enable vertical scrolling ONLY for this section
                    }}
                  >
                    <Box
                      ref={scrollContainerRef2}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: isSmallScreen
                          ? "repeat(1, 1fr)"
                          : isMediumScreen
                            ? "repeat(2, 1fr)"
                            : "repeat(2, 1fr)",
                        gap: isSmallScreen ? 2 : 5,
                        scrollBehavior: "smooth",
                        scrollbarWidth: "none", // Hide scrollbar for Firefox
                        "&::-webkit-scrollbar": {
                          display: "none", // Hide scrollbar for Chrome, Safari, and Edge
                        },
                      }}
                    >
                      {recommendedArtworks.map((artwork, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex", // Enables flexbox,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {loading ? (
                            <Card sx={{ width: 200, boxShadow: "none" }}>
                              <Skeleton
                                variant="rectangular"
                                height={280}
                                sx={{
                                  borderRadius: 10,
                                  width: 200,
                                  animation: "wave",
                                }}
                              />
                              <CardContent
                                sx={{
                                  flexGrow: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                }}
                              >
                                <Skeleton
                                  variant="text"
                                  width="80%"
                                  height={32}
                                  sx={{
                                    mx: "auto",
                                    animation: "wave",
                                  }}
                                />
                                <Skeleton
                                  variant="text"
                                  width="60%"
                                  height={24}
                                  sx={{
                                    mx: "auto",
                                    animation: "wave",
                                  }}
                                />
                              </CardContent>
                            </Card>
                          ) : (
                            <Link
                              to={`/customer-artwork-view/${artwork._id}`}
                              style={{ textDecoration: "none" }}
                            >
                              <Card
                                sx={{
                                  width: 200,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  boxShadow: "none",
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  height={280}
                                  image={
                                    artwork.imageUrl || "placeholder-image-url"
                                  }
                                  alt={artwork.title || "No Title Available"}
                                  sx={{
                                    border: "2px solid #000",
                                    borderRadius: 10,
                                    width: 200,
                                    padding: "10px",
                                    boxSizing: "border-box",
                                    display: artwork.imageUrl
                                      ? "block"
                                      : "none",
                                  }}
                                />
                                {!artwork.imageUrl && (
                                  <Box
                                    sx={{
                                      height: 280,
                                      width: 200,
                                      border: "2px solid #000",
                                      borderRadius: 10,
                                      padding: "10px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      boxSizing: "border-box",
                                      backgroundColor: "#f5f5f5",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontFamily: "Montserrat",
                                        color: "#000",
                                        textAlign: "center",
                                      }}
                                    >
                                      No Cover Image Available
                                    </Typography>
                                  </Box>
                                )}
                                <CardContent
                                  sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Tooltip title={artwork.title} arrow>
                                    <Box>
                                      {/* Whatever you want to display that shows the tooltip when hovered */}
                                      <Typography>{artwork.title}</Typography>
                                    </Box>
                                  </Tooltip>

                                  <Typography
                                    variant="h6"
                                    noWrap
                                    sx={{
                                      textAlign: "center",
                                      mb: 1,
                                      fontFamily: "Montserrat",
                                    }}
                                  >
                                    {artwork.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{
                                      textAlign: "center",
                                      fontFamily: "Montserrat",
                                    }}
                                  >
                                    {artwork.artist}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Link>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
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
      </Box>
    </>
  );
}
