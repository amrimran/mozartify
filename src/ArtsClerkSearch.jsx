import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Avatar,
  Divider,
  Box,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Select,
  Grid,
  Snackbar,
  Alert,
  InputLabel,
  FormControl,
  Pagination,
  AppBar,
  Toolbar,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./ArtsClerkSidebar";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Constants
const DRAWER_WIDTH = 225;

// Theme setup
const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
  breakpoints: {
    values: {
      xs: 0, // mobile phones
      sm: 752, // tablets
      md: 960, // small laptops
      lg: 1280, // desktops
      xl: 1920, // large screens
    },
  },
});

// Button Styles
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
  border: "1px solid #FFB6C1",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#F8E6EB ",
    color: "#FFB6C1",
    borderColor: "#FFB6C1",
    boxShadow: "none",
  },
};

export default function ArtsClerkSearch() {
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [searchCriteria, setSearchCriteria] = useState([
    { logic: "AND", category: "All", text: "" },
  ]);

  const [selectedCollection, setSelectedCollection] = useState("All"); //collection that user chose for a search

  const [selectedComposers, setSelectedComposers] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [selectedEmotions, setSelectedEmotions] = useState([]);

  const [searchResults, setSearchResults] = useState([]); //store list of music scores after a search
  const [hasSearched, setHasSearched] = useState(false); // store the events whether the search has been triggered or not
  const [filteredResults, setFilteredResults] = useState([]);
  const [hasFiltered, setHasFiltered] = useState(false);

  const [favorites, setFavorites] = useState([]); //store list of user's favorite music scores
  const [addedToCartScores, setAddedToCartScores] = useState([]); //store list of user's favorite music scores
  const [purchasedScores, setPurchasedScores] = useState([]); //store list of user's purchased music scores

  const [showSearchResults, setShowSearchResults] = useState(false);

  const [page, setPage] = useState(1); // Track the current page
  const itemsPerPage = 5; // Number of items per page
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "", // Add this to handle snackbar type (e.g., "cart", "favorite", etc.)
  });

  // Replace the hardcoded lists and add these state variables at the top of your CustomerSearch component:
  const [genreList, setGenreList] = useState([]);
  const [composerList, setComposerList] = useState([]);
  const [instrumentationList, setInstrumentationList] = useState([]); // Changed from instrumentList
  const [emotionList, setEmotionList] = useState([]);

  // Add this useEffect hook after your other useEffect hooks:
  useEffect(() => {
    const fetchRefineLists = async () => {
      try {
        const response = await axios.get("http://localhost:3000/refine-search");
        const { composers, genres, emotions, instrumentation } = response.data;

        setComposerList(composers);
        setGenreList(genres);
        setEmotionList(emotions);
        setInstrumentationList(instrumentation); // Changed from instruments
      } catch (error) {
        console.error("Error fetching refine search lists:", error);
      }
    };

    fetchRefineLists();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleGenreChange = (e) => {
    setSelectedGenres(e.target.value);
  };

  const handleComposerChange = (e) => {
    setSelectedComposers(e.target.value);
  };

  const handleInstrumentChange = (e) => {
    setSelectedInstruments(e.target.value);
  };

  const handleEmotionChange = (e) => {
    setSelectedEmotions(e.target.value);
  };

  const handleRefineClick = () => {
    // Check if all four filter categories are empty
    if (
      selectedGenres.length === 0 &&
      selectedComposers.length === 0 &&
      selectedInstruments.length === 0 &&
      selectedEmotions.length === 0
    ) {
      // If all filters are empty, reset the filtered results and set hasFiltered to false
      setFilteredResults([]); // Optional: reset filtered results
      setHasFiltered(false);
      return; // Do nothing if all filters are empty
    }

    // Proceed with filtering if at least one filter is selected
    const results = searchResults.filter((item) => {
      const genreMatch =
        selectedGenres.length === 0 || selectedGenres.includes(item.genre);
      const composerMatch =
        selectedComposers.length === 0 ||
        selectedComposers.includes(item.composer);
      const instrumentMatch =
        selectedInstruments.length === 0 ||
        selectedInstruments.includes(item.instrumentation);
      const emotionMatch =
        selectedEmotions.length === 0 ||
        selectedEmotions.includes(item.emotion);

      // Return true if all conditions match
      return genreMatch && composerMatch && instrumentMatch && emotionMatch;
    });

    // Store the filtered results in the state
    setFilteredResults(results);
    setHasFiltered(true); // Set hasFiltered to true after applying filters
  };

  const handleClearFilters = () => {
    setSelectedGenres([]);
    setSelectedComposers([]);
    setSelectedInstruments([]);
    setSelectedEmotions([]);
    setHasFiltered(false);
  };

  const paginatedResults = (
    hasFiltered ? filteredResults : searchResults
  ).slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data);
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchPurchasedScores = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/user-purchases"
        );

        const purchasedScoreIds = response.data.map(
          (purchase) => purchase.score_id
        );

        setPurchasedScores(purchasedScoreIds);
      } catch (error) {
        console.error("Error fetching user's purchased scores:", error);
        navigate("/login");
      }
    };
    fetchPurchasedScores();
  }, []);

  const fetchMusicScores = async (combinedQueries, selectedCollection) => {
    try {
      const response = await axios.post("http://localhost:3000/search", {
        combinedQueries,
        selectedCollection,
      });
      setSearchResults(response.data); // Set the search results
      setHasSearched(true); // Mark that a search has been performed
      setShowSearchResults(true); // Show the search results
    } catch (error) {
      console.error("Error fetching music scores:", error);
    }
  };

  useEffect(() => {
    const fetchAddedToCartScores = async () => {
      try {
        const response = await axios.get("http://localhost:3000/user-cart");

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

  const handleSearch = () => {
    const combinedQueries = searchCriteria.reduce((acc, criteria, index) => {
      if (index === 0) {
        acc.push({
          category: criteria.category,
          text: criteria.text,
        });
      } else {
        acc.push({
          logic: criteria.logic,
          category: criteria.category,
          text: criteria.text,
        });
      }
      return acc;
    }, []);

    setShowSearchResults(true); // change from basic search to search result on main section

    fetchMusicScores(combinedQueries, selectedCollection); //send the queries and selected collection to function that connects with middleware
  }; //remove the logic attribute of the first items in the array

  const handleAddRow = () => {
    if (searchCriteria.length < 3) {
      setSearchCriteria([
        ...searchCriteria,
        { logic: "AND", category: "All", text: "" },
      ]);
    }
  };

  const getButtonText = (category, selectedItems) => {
    return `${category}: ${
      selectedItems.length > 0 ? selectedItems.join(", ") : "None"
    }`;
  };

  const handleDeleteRow = (index) => {
    if (searchCriteria.length > 1) {
      setSearchCriteria(searchCriteria.filter((_, i) => i !== index));
    }
  }; // delete query row for basic search

  const handleLogicChange = (index, value) => {
    const updatedCriteria = [...searchCriteria];
    updatedCriteria[index].logic = value;
    setSearchCriteria(updatedCriteria);
  }; // change logic for query row

  const handleCategoryChange = (index, value) => {
    const updatedCriteria = [...searchCriteria];
    updatedCriteria[index].category = value;
    setSearchCriteria(updatedCriteria);
  };

  const handleClear = () => {
    setSearchCriteria([{ logic: "AND", category: "All", text: "" }]);
    setSelectedCollection("All");
    setHasSearched(false);
    setShowSearchResults(false); // Hide search results when clearing
  };

  const handleToggleSearchResults = () => {
    setShowSearchResults(!showSearchResults); // Toggle the visibility of the search results
  };

  const handleTextChange = (index, value) => {
    const updatedCriteria = [...searchCriteria];
    updatedCriteria[index].text = value;
    setSearchCriteria(updatedCriteria);
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

  const collectionOptions = ["All", "Lecturers", "Students", "Freelancers"];

  const GlobalStyle = createGlobalStyle`
    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', sans-serif;
          overflow-x: hidden;

    }
  `;

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
    searchContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      width: "100%",
      maxWidth: { xs: "100%", md: "800px" },
      margin: "0 auto",
    },
  };

  // Drawer toggle handler
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
              Music Score Search
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
          <ClerkSidebar active="searchArtwork" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <ClerkSidebar active="searchScore" />
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
                   Search Gallery
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

          {/* Basic Search Section */}
          {!showSearchResults && (
            <Container maxWidth="lg" sx={{ mt: { xs: 0, lg: 4 } }}>
              <Box
                sx={{
                  backgroundColor: "#fcfcfc",
                  borderRadius: 2,
                  p: { xs: 2, sm: 3, md: 4 },
                  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                }}
              >
                <Box
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                    gap: { xs: 1, sm: 2 },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "Montserrat",
                      mr: { xs: 0, sm: 2 },
                      fontWeight: 500,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      textAlign: { xs: "left", sm: "right" },
                    }}
                  >
                    Search in:
                  </Typography>
                  <Select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    sx={{
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      width: { xs: "100%", sm: 200 },
                      fontFamily: "Montserrat",
                      backgroundColor: "white",
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
                    {collectionOptions.map((option) => (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{
                          fontFamily: "Montserrat",
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {searchCriteria.map((criteria, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "center" },
                      gap: { xs: 1, sm: 2 },
                      mb: 2,
                      backgroundColor: "white",
                      p: { xs: 1, sm: 2 },
                      borderRadius: 2,
                    }}
                  >
                    {index !== 0 && (
                      <FormControl
                        sx={{
                          width: { xs: "100%", sm: 120 },
                          mb: { xs: 1, sm: 0 },
                        }}
                      >
                        <InputLabel sx={{ fontFamily: "Montserrat" }}>
                          Logic
                        </InputLabel>
                        <Select
                          value={criteria.logic}
                          onChange={(e) =>
                            handleLogicChange(index, e.target.value)
                          }
                          sx={{
                            fontFamily: "Montserrat",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#FFA0B3",
                            },
                          }}
                          label="Logic"
                        >
                          {["AND", "OR", "NOT"].map((option) => (
                            <MenuItem
                              key={option}
                              value={option}
                              sx={{ fontFamily: "Montserrat" }}
                            >
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    <FormControl
                      sx={{
                        width: { xs: "100%", sm: 150 },
                        mb: { xs: 1, sm: 0 },
                      }}
                    >
                      <InputLabel sx={{ fontFamily: "Montserrat" }}>
                        Category
                      </InputLabel>
                      <Select
                        value={criteria.category}
                        onChange={(e) =>
                          handleCategoryChange(index, e.target.value)
                        }
                        label="Category"
                        sx={{
                          fontFamily: "Montserrat",
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
                        {[
                          "All",
                          "Title",
                          "Genre",
                          "Composer",
                          "Instrumentation",
                          "Emotion",
                        ].map((option) => (
                          <MenuItem
                            key={option}
                            value={option}
                            sx={{ fontFamily: "Montserrat" }}
                          >
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      placeholder="Enter your search query..."
                      value={criteria.text}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      sx={{
                        flexGrow: 1,
                        mb: { xs: 1, sm: 0 },
                        "& .MuiOutlinedInput-root": {
                          fontFamily: "Montserrat",
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

                    {searchCriteria.length > 1 && (
                      <IconButton
                        onClick={() => handleDeleteRow(index)}
                        sx={{
                          color: "#B71C1C",
                          alignSelf: { xs: "flex-end", sm: "center" },
                          ml: { xs: 0, sm: 1 },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: { xs: 1, sm: 2 },
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 1, sm: 2 },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {searchCriteria.length < 3 && (
                      <Button
                        onClick={handleAddRow}
                        variant="outlined"
                        fullWidth={isMobile}
                        sx={{
                          ...buttonStyles2,
                          px: { xs: 2, sm: 3 },
                          py: { xs: 0.75, sm: 1 },
                          fontSize: {
                            xs: "0.75rem",
                            sm: "0.875rem",
                            md: "1rem",
                          },
                          minWidth: { xs: "100%", sm: "auto" },
                        }}
                      >
                        Add Row
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        navigate("/clerk-search/clerk-advanced-search")
                      }
                      variant="contained"
                      fullWidth={isMobile}
                      sx={{
                        ...buttonStyles,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.75, sm: 1 },
                        fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                        minWidth: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Advanced Search
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 1, sm: 2 },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    <Button
                      onClick={handleClear}
                      variant="outlined"
                      fullWidth={isMobile}
                      sx={{
                        boxShadow: "none",
                        ...buttonStyles2,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.75, sm: 1 },
                        fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                        minWidth: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleSearch}
                      variant="contained"
                      fullWidth={isMobile}
                      startIcon={<SearchIcon />}
                      sx={{
                        boxShadow: "none",
                        ...buttonStyles,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.75, sm: 1 },
                        fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                        minWidth: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Search
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Container>
          )}

          {/* Search Result Component Start */}
          {showSearchResults && (
            <Box
              sx={{
                flexGrow: 1,
                height: {
                  xs: "calc(100vh - 20px)", // Decreased subtraction for mobile
                  lg: "calc(100vh - 50px)", // Decreased subtraction for larger screens
                },
                width: "100%",
                overflow: "auto",
                p: { xs: 1, sm: -5 },
              }}
            >
              {/* Back Button */}
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleToggleSearchResults}
                  startIcon={<ArrowBackIcon />}
                  sx={buttonStyles2}
                >
                  Back
                </Button>
              </Box>

              {/* Filter Tags Section */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  px: 2,
                  mb: 2,
                  overflow: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {hasFiltered && selectedGenres.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#A2DCEB",
                      color: "white",
                      borderRadius: 50,
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      fontFamily: "Montserrat",
                    }}
                    disabled
                  >
                    {getButtonText("Genre", selectedGenres)}
                  </Button>
                )}

                {hasFiltered && selectedComposers.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#A2DCEB",
                      color: "white",
                      borderRadius: 50,
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      fontFamily: "Montserrat",
                    }}
                    disabled
                  >
                    {getButtonText("Composer", selectedComposers)}
                  </Button>
                )}

                {hasFiltered && selectedInstruments.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#A2DCEB",
                      color: "white",
                      borderRadius: 50,
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      fontFamily: "Montserrat",
                    }}
                    disabled
                  >
                    {getButtonText("Instrumentation", selectedInstruments)}
                  </Button>
                )}

                {hasFiltered && selectedEmotions.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#A2DCEB",
                      color: "white",
                      borderRadius: 50,
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      fontFamily: "Montserrat",
                    }}
                    disabled
                  >
                    {getButtonText("Emotion", selectedEmotions)}
                  </Button>
                )}
              </Box>

              {/* Main content grid */}
              <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ flexGrow: 1 }}>
                {/* Refine search sidebar */}
                <Grid
                  item
                  xs={12}
                  sm={4}
                  md={3}
                  sx={{
                    mb: { xs: 2, sm: 0 },
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 1, sm: 2 },
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontFamily: "Montserrat", textAlign: "center" }}
                    >
                      Refine Your Search
                    </Typography>

                    <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 } }}>
                      <InputLabel
                        sx={{
                          fontFamily: "Montserrat",
                          fontSize: { xs: "0.75rem", sm: "1rem" },
                        }}
                      >
                        Genre
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedGenres}
                        onChange={handleGenreChange}
                        label="Genre"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "1rem" },
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFB6C1",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFB6C1",
                          },
                        }}
                      >
                        {genreList.map((genre) => (
                          <MenuItem
                            key={genre}
                            value={genre}
                            sx={{
                              fontFamily: "Montserrat",
                              fontSize: { xs: "0.75rem", sm: "1rem" },
                            }}
                          >
                            {genre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 } }}>
                      <InputLabel
                        sx={{
                          fontFamily: "Montserrat",
                          fontSize: { xs: "0.75rem", sm: "1rem" },
                        }}
                      >
                        Composer
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedComposers}
                        onChange={handleComposerChange}
                        label="Composer"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "1rem" },
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFB6C1",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFB6C1",
                          },
                        }}
                      >
                        {composerList.map((composer) => (
                          <MenuItem
                            key={composer}
                            value={composer}
                            sx={{
                              fontFamily: "Montserrat",
                              fontSize: { xs: "0.75rem", sm: "1rem" },
                            }}
                          >
                            {composer}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 } }}>
                      <InputLabel
                        sx={{
                          fontFamily: "Montserrat",
                          fontSize: { xs: "0.75rem", sm: "1rem" },
                        }}
                      >
                        Instrumentation
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedInstruments}
                        onChange={handleInstrumentChange}
                        label="Instrumentation"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "1rem" },
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFB6C1",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFB6C1",
                          },
                        }}
                      >
                        {instrumentationList.map((instrument) => (
                          <MenuItem
                            key={instrument}
                            value={instrument}
                            sx={{
                              fontFamily: "Montserrat",
                              fontSize: { xs: "0.75rem", sm: "1rem" },
                            }}
                          >
                            {instrument}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: { xs: 1, sm: 2 } }}>
                      <InputLabel
                        sx={{
                          fontFamily: "Montserrat",
                          fontSize: { xs: "0.75rem", sm: "1rem" },
                        }}
                      >
                        Emotion
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedEmotions}
                        onChange={handleEmotionChange}
                        label="Emotion"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "1rem" },
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFB6C1",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFB6C1",
                          },
                        }}
                      >
                        {emotionList.map((emotion) => (
                          <MenuItem
                            key={emotion}
                            value={emotion}
                            sx={{
                              fontFamily: "Montserrat",
                              fontSize: { xs: "0.75rem", sm: "1rem" },
                            }}
                          >
                            {emotion}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{ flexGrow: 1 }} />

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleClearFilters}
                      sx={{
                        ...buttonStyles2,
                        mb: { xs: 1, sm: 2 },
                        fontSize: { xs: "0.75rem", sm: "1rem" },
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleRefineClick}
                      sx={{
                        ...buttonStyles,
                        fontSize: { xs: "0.75rem", sm: "1rem" },
                      }}
                    >
                      Refine
                    </Button>
                  </Box>
                </Grid>

                {/* Search Results Grid */}
                <Grid item xs={12} sm={8} md={9}>
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {paginatedResults.length === 0 && hasSearched && (
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "Montserrat",
                          textAlign: "center",
                          mt: 4,
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        No results found
                      </Typography>
                    )}
                    {paginatedResults.length > 0 && (
                      <Box
                        sx={{
                          flexGrow: 1,
                          overflow: "auto",
                          p: { xs: 1, sm: 2 },
                        }}
                      >
                        <List
                          sx={{
                            width: "100%",
                            bgcolor: "background.paper",
                          }}
                        >
                          {paginatedResults.map((item) => (
                            <ListItemButton
                              key={item._id}
                              onClick={() =>
                                navigate(`/clerk-music-score-view/${item._id}`)
                              }
                              sx={{
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: { xs: "flex-start", sm: "center" },
                                gap: { xs: 1, sm: 2 },
                                py: { xs: 1, sm: 2 },
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography
                                    sx={{
                                      fontFamily: "Montserrat",
                                      fontWeight: "bold",
                                      fontSize: { xs: "0.875rem", sm: "1rem" },
                                    }}
                                  >
                                    {item.title}
                                  </Typography>
                                }
                                secondary={
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: "Montserrat",
                                      fontSize: {
                                        xs: "0.75rem",
                                        sm: "0.875rem",
                                      },
                                    }}
                                  >
                                    {`Genre: ${item.genre} | Composer: ${item.composer} | Artist: ${item.artist}`}
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          ))}
                        </List>
                        <Box sx={{ mt: "auto", py: 0 }}>
                          <Pagination
                            count={Math.ceil(
                              (hasFiltered
                                ? filteredResults.length
                                : searchResults.length) / itemsPerPage
                            )}
                            page={page}
                            onChange={handlePageChange}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                              mt: 2,
                              display: "flex",
                              justifyContent: "center",
                              "& .MuiPaginationItem-root": {
                                fontSize: { xs: "0.75rem", sm: "1rem" },
                                borderRadius: 2,
                                fontFamily: "Montserrat",
                                backgroundColor: "primary",
                                color: "#000",
                                "&.Mui-selected": {
                                  backgroundColor: "#FFB6C1",
                                  color: "#fff",
                                  "&:hover": {
                                    backgroundColor: "#FFB6C1",
                                  },
                                },
                                "&:hover": {
                                  backgroundColor: "#D3D3D3",
                                },
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          {/* Search Result Frontend Component End */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={2000} // Set the duration before the snackbar disappears
            onClose={(event, reason) => {
              if (reason === "clickaway") {
                return; // Prevent snackbar from closing on clickaway if desired
              }
              handleSnackbarClose(); // Close the snackbar
              if (snackbar.reload) {
                window.location.reload(); // Reload the page after snackbar closes
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
      </Box>
    </ThemeProvider>
  );
}
