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
  Skeleton,
} from "@mui/material";
import { Favorite, PlayArrow } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar from "./CustomerSidebar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const buttonStyles2 = {
  px: 5,
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#8BD3E6",
  backgroundColor: "#FFFFFF",
  border: "1px solid #8BD3E6",
  borderColor: "#8BD3E6",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
    backgroundColor: "#E6F8FB", // Subtle light blue hover effect
    color: "#7AB9C4", // Slightly darker shade of the text
    borderColor: "#7AB9C4", // Matches the text color for consistency
  },
};

const buttonStyles = {
  px: 10,
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  borderColor: "#8BD3E6",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
    backgroundColor: "#6FBCCF", // Slightly darker blue for hover
    color: "#FFFFFF", // Keeps the text color consistent
    borderColor: "#6FBCCF", // Matches the background color for cohesion
  },
};

export default function CustomerSearch() {
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

  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const addToCart = async (scoreId) => {
    try {
      await axios.post("http://localhost:3000/add-to-cart", {
        musicScoreId: scoreId,
      });
      setAddedToCartScores([...addedToCartScores, scoreId]);
      setSnackbar({
        open: true,
        message: "Added to cart successfully!",
        type: "cart",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const toggleFavorite = async (musicScoreId) => {
    try {
      const isFavorite = user?.favorites?.includes(musicScoreId);

      const response = await axios.post("http://localhost:3000/set-favorites", {
        musicScoreId,
        action: isFavorite ? "remove" : "add", // Explicitly specify the action
      });
      setFavorites(response.data.favorites);

      // Show appropriate snackbar message
      setSnackbar({
        open: true,
        message: isFavorite
          ? "Removed from favorites successfully!"
          : "Added to favorites successfully!",
        type: isFavorite ? "unfavorite" : "favorite",
        reload: true, // Add a flag to determine whether to reload after snackbar
      });
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

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
    }
  `;

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", minHeight: "100vh", maxHeight: "100vh" }}>
        <CustomerSidebar active="search" />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
            marginLeft: "229px", // 225px (sidebar width) + 4px (yellow line)
            overflowX: "hidden", // Prevent horizontal scrolling
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "Montserrat",
                  fontWeight: "bold",
                  mt: 4,
                  ml: 1,
                }}
              >
                Music Score Repository Search
              </Typography>{" "}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {user ? (
                <>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    {user.username}
                  </Typography>
                  <Avatar
                    alt={user.username}
                    src={
                      user && user.profile_picture ? user.profile_picture : null
                    }
                  >
                    {(!user || !user.profile_picture) &&
                      user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Loading...
                  </Typography>
                  <Avatar></Avatar>
                </>
              )}
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />

          {/* Basic Search Section */}
          {!showSearchResults && (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
              <Box
                sx={{
                  backgroundColor: "#fcfcfc",

                  borderRadius: 2,
                  p: 4,
                  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)", // Added elevation
                  border: "1px solid rgba(0, 0, 0, 0.12)", // Added subtle border
                }}
              >
                <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "Montserrat",
                      mr: 2,
                      fontWeight: 500,
                    }}
                  >
                    Search in:
                  </Typography>
                  <Select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    sx={{
                      minWidth: 200,
                      fontFamily: "Montserrat",
                      backgroundColor: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8BD3E6", // Default color
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#67ADC1", // Hover color
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#67ADC1", // Selected/focused color
                      },
                      "& .MuiSelect-select": {
                        fontFamily: "Montserrat",
                      },
                    }}
                  >
                    {collectionOptions.map((option) => (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{ fontFamily: "Montserrat" }}
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
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                      backgroundColor: "white",
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    {index !== 0 && (
                      <FormControl sx={{ width: 120 }}>
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
                              borderColor: "#67ADC1",
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

                    <FormControl sx={{ width: 150 }}>
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
                            borderColor: "#8BD3E6", // Default color
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#67ADC1", // Hover color
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#67ADC1", // Selected/focused color
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
                        "& .MuiOutlinedInput-root": {
                          fontFamily: "Montserrat",
                          "& fieldset": {
                            borderColor: "#8BD3E6",
                          },
                          "&:hover fieldset": {
                            borderColor: "#67ADC1",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#67ADC1",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontFamily: "Montserrat",
                        },
                      }}
                    />

                    {searchCriteria.length > 1 && (
                      <IconButton
                        onClick={() => handleDeleteRow(index)}
                        sx={{ color: "#B71C1C" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 3,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {searchCriteria.length < 3 && (
                      <Button
                        onClick={handleAddRow}
                        variant="outlined"
                        sx={{
                          ...buttonStyles2,
                        }}
                      >
                        Add Row
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        navigate("/customer-search/customer-advanced-search")
                      }
                      variant="contained"
                      sx={{
                        ...buttonStyles,
                      }}
                    >
                      Advanced Search
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      onClick={handleClear}
                      variant="outlined"
                      sx={{
                        boxShadow: "none",
                        ...buttonStyles2,
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleSearch}
                      variant="contained"
                      startIcon={<SearchIcon />}
                      sx={{
                        boxShadow: "none",
                        ...buttonStyles,
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
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 2,
                mt: 1,
                ml: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={handleToggleSearchResults}
                startIcon={<ArrowBackIcon />}
                sx={buttonStyles2}
              >
                Back
              </Button>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 2,
                  overflowX: "auto",
                  flexGrow: 1,
                  maxWidth: "50vw",
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
            </Box>
          )}

          {showSearchResults && (
            <Box
              sx={{
                flexGrow: 1,
                height: "calc(100vh - 200px)",
                width: "100%",
                overflow: "hidden",
                p: 2,
              }}
            >
              {/* Main content grid */}
              <Grid
                container
                spacing={2}
                sx={{ flexGrow: 1, overflow: "hidden" }}
              >
                {/* Refine search sidebar */}
                <Grid item xs={3}>
                  <Box
                    sx={{
                      p: 2,
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

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontFamily: "Montserrat" }}>
                        Genre
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedGenres}
                        onChange={handleGenreChange}
                        label="Genre"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                        }}
                      >
                        {genreList.map((genre) => (
                          <MenuItem
                            key={genre}
                            value={genre}
                            sx={{ fontFamily: "Montserrat" }}
                          >
                            {genre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontFamily: "Montserrat" }}>
                        Composer
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedComposers}
                        onChange={handleComposerChange}
                        label="Composer"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                        }}
                      >
                        {composerList.map((composer) => (
                          <MenuItem
                            key={composer}
                            value={composer}
                            sx={{ fontFamily: "Montserrat" }}
                          >
                            {composer}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontFamily: "Montserrat" }}>
                        Instrumentation
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedInstruments}
                        onChange={handleInstrumentChange}
                        label="Instrumentation"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                        }}
                      >
                        {instrumentationList.map((instrument) => (
                          <MenuItem
                            key={instrument}
                            value={instrument}
                            sx={{ fontFamily: "Montserrat" }}
                          >
                            {instrument}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontFamily: "Montserrat" }}>
                        Emotion
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedEmotions}
                        onChange={handleEmotionChange}
                        label="Emotion"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                        }}
                      >
                        {emotionList.map((emotion) => (
                          <MenuItem
                            key={emotion}
                            value={emotion}
                            sx={{ fontFamily: "Montserrat" }}
                          >
                            {emotion}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{ flexGrow: 1 }} />
                    {/* Add Clear Refine button */}
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleClearFilters}
                      sx={{ ...buttonStyles2, mb: 2 }}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleRefineClick}
                      sx={buttonStyles}
                    >
                      Refine
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={9}>
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {" "}
                    {paginatedResults.length === 0 && hasSearched && (
                      <Typography
                        variant="body1"
                        sx={{ fontFamily: "Montserrat" }}
                      >
                        No results found
                      </Typography>
                    )}
                    {paginatedResults.length > 0 && (
                      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
                        <List>
                          {paginatedResults.map((item) => (
                            <ListItemButton
                              key={item._id}
                              onClick={() =>
                                navigate(
                                  `/customer-library/customer-music-score-view/${item._id}`
                                )
                              }
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
                                        fontSize: {
                                          xs: "0.8rem",
                                          sm: "0.9rem",
                                        },
                                        mt: { xs: 1, sm: 0 },
                                      }}
                                    >
                                      Genre: {item.genre} | Composer:{" "}
                                      {item.composer} | Artist: {item.artist}
                                    </Typography>
                                  )
                                }
                              />

                              <ListItemIcon>
                                {loading
                                  ? null
                                  : !purchasedScores.includes(item._id) &&
                                    !addedToCartScores.includes(item._id) && (
                                      <IconButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addToCart(item._id);
                                        }}
                                      >
                                        <ShoppingCartIcon />
                                      </IconButton>
                                    )}
                              </ListItemIcon>

                              <ListItemIcon>
                                {loading ? null : (
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(item._id);
                                    }}
                                  >
                                    <Favorite
                                      color={
                                        favorites.includes(item._id)
                                          ? "error"
                                          : "disabled"
                                      }
                                    />
                                  </IconButton>
                                )}
                              </ListItemIcon>
                            </ListItemButton>
                          ))}
                        </List>

                        <Box sx={{ mt: "auto", py: 2 }}>
                          <Pagination
                            count={Math.ceil(
                              (hasFiltered
                                ? filteredResults.length
                                : searchResults.length) / itemsPerPage
                            )}
                            page={page}
                            onChange={handlePageChange}
                            sx={{
                              mt: 3,
                              display: "flex",
                              justifyContent: "center",
                              "& .MuiPaginationItem-root": {
                                borderRadius: 2,
                                fontFamily: "Montserrat",
                                backgroundColor: "primary",
                                color: "#000",
                                "&.Mui-selected": {
                                  backgroundColor: "#8BD3E6", // Blue for selected
                                  color: "#fff",
                                  "&:hover": {
                                    backgroundColor: "#8BD3E6", // Keep blue when hovered if selected
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
    </>
  );
}
