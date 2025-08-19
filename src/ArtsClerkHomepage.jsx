import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Avatar,
  InputBase,
  Paper,
  Button,
  Drawer,
  FormControl,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { FilterAlt, Menu as MenuIcon } from "@mui/icons-material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import ClerkSidebar from "./ArtsClerkSidebar";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createGlobalStyle } from "styled-components";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { storage } from "./firebase";
import { API_BASE_URL} from './config/api.js';

const DRAWER_WIDTH = 225;

// Theme setup
const customTheme = createTheme({
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

// Global styles
const GlobalStyle = createGlobalStyle`
  @keyframes skeleton-wave {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }

  * {
    font-family: 'Montserrat', sans-serif;
  }
`;

// Button styles
const buttonStyles = {
  px: { xs: 4, sm: 10 },
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
  px: { xs: 4, sm: 10 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFB6C1",
  backgroundColor: "#FFFFFF",
  boxShadow: "none",
  border: "1px solid #FFB6C1",
  "&:hover": {
    boxShadow: "none",
    backgroundColor: "#FFF0F2",
    color: "#FFB6C1",
    borderColor: "#FFB6C1",
  },
};

const deleteButtonStyles = {
  px: { xs: 4, sm: 10 },
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

export default function ArtsClerkHomepage() {
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery(customTheme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(customTheme.breakpoints.between("sm", "lg"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("createdAt");
  const [loading, setLoading] = useState(true);
  const [isFiltered, setIsFiltered] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const itemsPerPage = 12;
  const [filterValues, setFilterValues] = useState({});
  const [unfilteredSearchedArtworks, setUnfilteredSearchedArtworks] = useState([]);
  const [searchedArtworks, setSearchedArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);

  // Grid columns based on screen size
  const gridColumns = {
    xs: 1, // 1 column for mobile
    sm: 2, // 2 columns for tablets
    md: 3, // 3 columns for small laptops
    lg: 4, // 4 columns for desktops
  };

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
      width: "100%",
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
      mt: isLargeScreen ? 0 : 8,
      ml: isLargeScreen ? 5 : 0, // Set margin-left to 0 for large screens
      width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
    },
    searchContainer: {
      display: "flex",
      alignItems: "center",
      gap: { xs: 1, sm: 2 },
      flex: 1,
      maxWidth: { xs: "100%", sm: 700 },
      mx: { xs: 1, sm: 4 },
    },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: {
        xs: "repeat(1, 1fr)",
        sm: "repeat(2, 1fr)",
        md: "repeat(3, 1fr)",
        lg: "repeat(4, 1fr)",
      },
      gap: { xs: 2, sm: 3 },
    },
    card: {
      width: { xs: "100%", sm: 210 },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: "none",
      cursor: "pointer",
    },
    cardMedia: {
      height: { xs: 200, sm: 280 },
      width: "100%",
      maxWidth: { xs: "100%", sm: 200 },
      border: "2px solid #000",
      borderRadius: 10,
      padding: "10px",
      boxSizing: "border-box",
    },
  };

  // Component for skeleton loading
  const SkeletonCard = () => (
    <Card sx={styles.card}>
      <Box sx={{ padding: "10px", width: "100%" }}>
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            height: { xs: 200, sm: 280 },
            borderRadius: 10,
            animation: "skeleton-wave 1s ease-in-out infinite",
          }}
        />
      </Box>
      <CardContent
        sx={{
          padding: "16px 8px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Skeleton
          variant="text"
          width="70%"
          height={24}
          sx={{ mb: 1, animation: "skeleton-wave 1s ease-in-out infinite" }}
        />
        <Skeleton
          variant="text"
          width="50%"
          height={20}
          sx={{ animation: "skeleton-wave 1s ease-in-out infinite" }}
        />
      </CardContent>
    </Card>
  );

  // Fetch dynamic fields to know how to display artwork data
  useEffect(() => {
    const fetchDynamicFields = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/dynamic-fields`);
        setDynamicFields(response.data);
      } catch (error) {
        console.error('Error fetching dynamic fields:', error);
      }
    };

    fetchDynamicFields();
  }, []);

  // Get display title for an artwork
  const getArtworkTitle = (artwork) => {
    // Get title directly from artwork properties
    if (artwork.title) return artwork.title;
    if (artwork.artwork_title) return artwork.artwork_title;
    if (artwork.name) return artwork.name;
    
    return "Untitled";
  };

  // Get display artist for an artwork
  const getArtworkArtist = (artwork) => {
    // Get artist directly from artwork properties
    if (artwork.artist) return artwork.artist;
    if (artwork.artist_name) return artwork.artist_name;
    if (artwork.creator) return artwork.creator;
    
    return "Unknown Artist";
  };

  const fetchArtworks = async (order = "desc", field = "createdAt") => {
    setLoading(true);
    try {
      // Add setTimeout to create a delay for smoother UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use your MongoDB API
      const response = await axios.get(`${API_BASE_URL}/catalogArts`);

      if (response.data) {
        const artworkData = response.data;
        
        // Sort data based on direct properties or fallback to default sorting
        const sortedData = [...artworkData].sort((a, b) => {
          if (field === "title") {
            // String sorting by title
            const aValue = getArtworkTitle(a).toLowerCase();
            const bValue = getArtworkTitle(b).toLowerCase();
            return order === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else if (field === "artist") {
            // String sorting by artist
            const aValue = getArtworkArtist(a).toLowerCase();
            const bValue = getArtworkArtist(b).toLowerCase();
            return order === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else {
            // Date sorting (for dateUploaded/createdAt)
            // Try to get date field or fall back to MongoDB's _id which contains a timestamp
            const aValue = new Date(a.createdAt || a._id || 0);
            const bValue = new Date(b.createdAt || b._id || 0);
            return order === "asc" ? aValue - bValue : bValue - aValue;
          }
        });

        setArtworks(sortedData);
      }
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to include sortBy
  useEffect(() => {
    fetchArtworks(sortOrder, sortBy);
  }, [sortOrder, sortBy]);

  // Modify the sort toggle handler
  const handleSortToggle = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
  };

  // Add handler for changing sort field
  const handleSortByChange = (field) => {
    setSortBy(field);
  };

  useEffect(() => {
    // When search query changes, reset filters
    if (searchQuery) {
      const fetchSearchedArtworks = async () => {
        try {
          // Fetch artworks from MongoDB API
          const response = await axios.get(`${API_BASE_URL}/catalogArts`);

          if (!response.data) {
            throw new Error("No data received from API");
          }

          // Filter based on search query
          const filteredResults = response.data.filter((artwork) => {
            const searchLower = searchQuery.toLowerCase();
            
            // Search directly in artwork properties
            const title = getArtworkTitle(artwork).toLowerCase();
            const artist = getArtworkArtist(artwork).toLowerCase();
            
            // Search in all artwork properties
            const hasMatchingProperty = Object.entries(artwork).some(([key, value]) => {
              // Skip non-string values, arrays, and objects
              if (typeof value !== 'string' && typeof value !== 'number') return false;
              
              // Make sure we're only checking fields that we care about (skip system fields)
              if (['_id', 'imageUrl', 'createdAt', 'updatedAt', '__v'].includes(key)) return false;
              
              return String(value).toLowerCase().includes(searchLower);
            });
            
            return (
              title.includes(searchLower) ||
              artist.includes(searchLower) ||
              hasMatchingProperty
            );
          });

          setUnfilteredSearchedArtworks(filteredResults);
          setSearchedArtworks(filteredResults);
          setIsFiltered(false); // Reset filter state when searching

          // Debug logging
          console.log("Search results:", filteredResults.length);
        } catch (error) {
          console.error("Error fetching searched artworks:", error);
        }
      };
      fetchSearchedArtworks();
    } else {
      setUnfilteredSearchedArtworks([]);
      setSearchedArtworks([]);
    }
  }, [searchQuery, dynamicFields]);

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

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Pagination handler
  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDisplayedArtworks = () => {
    if (searchQuery && isFiltered) {
      // If we're searching and filters are applied, show filtered search results
      return searchedArtworks;
    } else if (searchQuery) {
      // If we're only searching without filters, show search results
      return unfilteredSearchedArtworks;
    } else if (isFiltered) {
      // If we're only filtering without search, show filtered artworks
      return filteredArtworks;
    } else {
      // Default case: show all artworks
      return artworks;
    }
  };

  const displayedArtworks = getDisplayedArtworks();
  const paginatedArtworks = displayedArtworks.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const pageCount = Math.ceil(displayedArtworks.length / itemsPerPage);

  // Handle filter value changes
  const handleFilterChange = (fieldName, value) => {
    setFilterValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Apply filters based on dynamic fields
  const applyFilters = () => {
    // Check if any filter is set
    const hasFilter = Object.values(filterValues).some(value => value !== "" && value !== null);

    if (hasFilter) {
      setIsFiltered(true);
      try {
        // Determine which artworks to filter
        const artworksToFilter = searchQuery ? unfilteredSearchedArtworks : artworks;
        
        // Apply filters to the artworks
        const filtered = artworksToFilter.filter(artwork => {
          // For each filter value, check if the artwork matches
          return Object.entries(filterValues).every(([fieldName, filterValue]) => {
            // Skip empty filters
            if (!filterValue || filterValue === "") return true;
            
            // Get field value directly from artwork property
            const fieldValue = artwork[fieldName];
            
            // If no field value found, don't match
            if (fieldValue === undefined || fieldValue === null) return false;
            
            // Check if the field value contains the filter value (case insensitive)
            const fieldValueStr = String(fieldValue).toLowerCase();
            const filterValueStr = String(filterValue).toLowerCase();
            
            return fieldValueStr.includes(filterValueStr);
          });
        });
        
        if (searchQuery) {
          setSearchedArtworks(filtered);
        } else {
          setFilteredArtworks(filtered);
        }
      } catch (error) {
        console.error("Error applying filters:", error);
      }
    } else {
      setIsFiltered(false);
      if (searchQuery) {
        setSearchedArtworks(unfilteredSearchedArtworks);
      }
    }
    
    // Close the filter drawer
    setIsDrawerOpen(false);
  };

  const clearFilters = () => {
    setFilterValues({});
    setIsFiltered(false);
    if (searchQuery) {
      setSearchedArtworks(unfilteredSearchedArtworks);
    }
  };

  const handleCardClick = (artworkId) => {
    console.log("Artwork ID being passed:", artworkId);
    navigate(`/arts-clerk-view/${artworkId}`);
  };

  // Get filter fields based on categories
  const getFilterFields = () => {
    // Group fields by category
    const categorizedFields = {};
    
    dynamicFields.forEach(field => {
      if (!field.category) return;
      
      if (!categorizedFields[field.category]) {
        categorizedFields[field.category] = [];
      }
      
      categorizedFields[field.category].push(field);
    });
    
    return categorizedFields;
  };

  const filterFields = getFilterFields();

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
              Uploaded Artworks
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
          <ClerkSidebar active="dashboard" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <ClerkSidebar active="dashboard" />
        </Drawer>

        {/* Main content */}
        <Box component="main" sx={styles.mainContent}>
          {/* Header section */}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: { xs: 2, sm: 0 },
              mb: 3,
              mt: 2,
            }}
          >
            {/* Sort controls */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  minWidth: { xs: 100, sm: 120 },
                  fontFamily: "Montserrat",

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#FFB6C1",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#FFB6C1",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#FFB6C1",
                  },
                }}
              >
                <MenuItem value="createdAt">Date Added</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="artist">Artist</MenuItem>
              </Select>

              <IconButton
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                {sortOrder === "asc" ? <ArrowUpward /> : <ArrowDownward />}
              </IconButton>
            </Box>

            {/* Search and filter section */}
            <Box sx={styles.searchContainer}>
              <Paper
                component="form"
                sx={{
                  p: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  borderRadius: "50px",
                  border: "1px solid #FFB6C1",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for elevation
                  transition:
                    "border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    borderColor: "#FFA0B3", // Darker border on hover
                    boxShadow: "0px 4px 10px #FFB6C1", // Slightly stronger shadow
                  },
                }}
              >
                <InputBase
                  sx={{ ml: 2, flex: 1 }}
                  placeholder={
                    isMobile
                      ? "Search artworks..."
                      : "Look for all artworks here..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>

              <IconButton onClick={() => setIsDrawerOpen(true)}>
                <FilterAlt />
              </IconButton>
            </Box>

            {/* Desktop user info */}
            {isLargeScreen && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  ml: "auto",
                }}
              >
                <Typography>{user?.username}</Typography>
                <Avatar
                  alt={user?.username}
                  src={user?.profile_picture}
                  sx={{ width: 40, height: 40 }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Box>

          {/* Results Title and Count Section */}
          <Box
            sx={{
              mt: { xs: 2, sm: 3, md: 4 },
              mb: { xs: 2, sm: 3 },
              px: { xs: 1, sm: 0 },
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                fontSize: {
                  xs: "1.25rem",
                  sm: "1.5rem",
                  md: "1.75rem",
                },
                textAlign: { xs: "left", sm: "left" },
              }}
            >
              {searchQuery
                ? "Search Results"
                : isFiltered
                  ? "Filtered Results"
                  : "Uploaded Artworks"}
            </Typography>

            {/* Results count - Simplified for mobile */}
            {(searchQuery || isFiltered) && (
              <Typography
                variant="body1"
                sx={{
                  mb: { xs: 1, sm: 2 },
                  fontFamily: "Montserrat",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  textAlign: { xs: "left", sm: "left" },
                }}
              >
                {isMobile ? (
                  // Mobile view - single line
                  <span>
                    Found{" "}
                    <Box
                      component="span"
                      sx={{ fontWeight: "bold", color: "#FFB6C1" }}
                    >
                      {displayedArtworks.length}
                    </Box>{" "}
                    results
                  </span>
                ) : (
                  // Desktop view - more spaced out
                  <>
                    Found{" "}
                    <Box
                      component="span"
                      sx={{ fontWeight: "bold", color: "#FFB6C1" }}
                    >
                      {displayedArtworks.length}
                    </Box>{" "}
                    results
                  </>
                )}
              </Typography>
            )}
          </Box>

          {/* Artworks grid */}
          <Box sx={styles.cardGrid}>
            {loading ? (
              Array(gridColumns[isMobile ? "xs" : isTablet ? "sm" : "lg"])
                .fill()
                .map((_, index) => <SkeletonCard key={index} />)
            ) : paginatedArtworks.length > 0 ? (
              paginatedArtworks.map((artwork) => (
                <Card
                  key={artwork._id}
                  onClick={() => handleCardClick(artwork._id)}
                  sx={{
                    width: { xs: "100%", sm: 210 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "none",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  {artwork.imageUrl ? (
                    <CardMedia
                      component="img"
                      image={artwork.imageUrl}
                      alt={getArtworkTitle(artwork)}
                      sx={{
                        height: { xs: 200, sm: 280 },
                        width: { xs: "100%", sm: 200 },
                        borderRadius: 10,
                        border: "2px solid #000",
                        padding: "10px",
                        boxSizing: "border-box",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: { xs: 200, sm: 280 },
                        width: { xs: "100%", sm: 200 },
                        border: "2px solid #000",
                        borderRadius: 10,
                        padding: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f5f5f5",
                        boxSizing: "border-box",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Montserrat",
                          color: "#000",
                          textAlign: "center",
                          px: 2,
                        }}
                      >
                        No Image Available
                      </Typography>
                    </Box>
                  )}

                  <CardContent
                    sx={{
                      width: "100%",
                      padding: { xs: "16px 8px", sm: "16px" },
                      "&:last-child": { pb: 2 },
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Montserrat",
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                        fontWeight: "bold",
                        mb: 1,
                        textAlign: "center",
                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getArtworkTitle(artwork)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: "Montserrat",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        textAlign: "center",
                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getArtworkArtist(artwork)}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Montserrat",
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  py: 4,
                }}
              >
                No artworks found
              </Typography>
            )}
          </Box>

          {/* Pagination */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              size={isMobile ? "small" : "medium"}
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 2,
                  fontFamily: "Montserrat",
                  backgroundColor: "primary",
                  color: "#000",
                  "&.Mui-selected": {
                    backgroundColor: "#FFB6C1", // Pink for selected
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#FFB6C1", // Keep pink when hovered if selected
                    },
                  },
                  "&:hover": {
                    backgroundColor: "#D3D3D3", // Neutral gray for unselected hover
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Filter Drawer - Updated for Dynamic Fields */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400, md: 350 },
            height: "100%",
            overflow: "auto",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
            p: { xs: 2, sm: 3 },
          }}
        >
          {/* Header */}
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              mb: 3,
              fontFamily: "Montserrat",
            }}
          >
            Filter Options
          </Typography>

          {/* Dynamic Filter Form Section - Grouped by categories */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {Object.entries(filterFields).map(([category, fields]) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: "bold", 
                    mb: 1, 
                    fontFamily: "Montserrat",
                    borderBottom: "1px solid #FFB6C1",
                    pb: 0.5
                  }}
                >
                  {category}
                </Typography>
                
                {fields.map((field) => (
                  <FormControl key={field._id} fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{field.label}</InputLabel>
                    
                    {field.fieldType === 'select' ? (
                      // Select/dropdown field
                      <Select
                        value={filterValues[field.name] || ''}
                        onChange={(e) => handleFilterChange(field.name, e.target.value)}
                        label={field.label}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFB6C1",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFA0B3",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFA0B3",
                          },
                        }}
                      >
                        <MenuItem value="">Any</MenuItem>
                        {field.options && field.options.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      // Text input field for other field types
                      <TextField
                        label={field.label}
                        value={filterValues[field.name] || ''}
                        onChange={(e) => handleFilterChange(field.name, e.target.value)}
                        fullWidth
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#FFB6C1",
                            },
                            "&:hover fieldset": {
                              borderColor: "#FFA0B3",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#FFA0B3",
                            },
                          },
                        }}
                      />
                    )}
                  </FormControl>
                ))}
              </Box>
            ))}
            
            {Object.keys(filterFields).length === 0 && (
              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  color: "text.secondary",
                  fontFamily: "Montserrat",
                  my: 2
                }}
              >
                No filter fields available. Please configure dynamic fields in the field management section.
              </Typography>
            )}
          </Box>

          {/* Buttons Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: "auto", // This pushes the button section to the bottom
              pt: 4, // Adds padding top for spacing
            }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={applyFilters}
              sx={buttonStyles}
            >
              APPLY FILTERS
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={clearFilters}
              sx={deleteButtonStyles}
            >
              CLEAR FILTERS
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => setIsDrawerOpen(false)}
              sx={buttonStyles2}
            >
              CLOSE FILTERS
            </Button>
          </Box>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
}