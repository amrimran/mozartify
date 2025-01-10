import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Avatar,
  Divider,
  Box,
  List,
  Tabs,
  Tab,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Grid,
  InputLabel,
  FormControl,
  Pagination,
} from "@mui/material";
import { Favorite, PlayArrow } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar from "./CustomerSidebar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function CustomerSearch() {
  const [user, setUser] = useState(null);

  const [searchCriteria, setSearchCriteria] = useState([
    { logic: "AND", category: "All", text: "" },
  ]);

  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

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

  const genreList = [
    "Classical",
    "Jazz",
    "Rock",
    "Pop",
    "Electronic",
    "Blues",
    "Country",
    "HipHop",
    "Reggae",
    "R&B",
    "Folk",
    "Metal",
    "Punk",
    "Soul",
    "Opera",
    "Latin",
    "Indie",
    "Experimental",
    "Techno",
    "House",
    "Ambient",
    "Funk",
    "Disco",
    "Psychedelic",
    "Gospel",
    "Ska",
    "Alternative",
    "NewAge",
    "World",
    "Dancehall",
    "KPop",
    "Afrobeat",
    "Reggaeton",
  ];

  const composerList = [
    "Beethoven",
    "Chopin",
    "Debussy",
    "Erik Satie",
    "Gershwin",
    "Holst",
    "Liszt",
    "Mozart",
    "Pachelbel",
    "Ravel",
  ];

  const instrumentList = [
    "All",
    "Strings",
    "Woodwind",
    "Brass",
    "Percussion",
    "Keyboard",
    "Guitar",
    "Violin",
    "Cello",
    "DoubleBass",
    "Flute",
    "Clarinet",
    "Saxophone",
    "Oboe",
    "Bassoon",
    "Trumpet",
    "Trombone",
    "FrenchHorn",
    "Tuba",
    "Drums",
    "SnareDrum",
    "BassDrum",
    "Cymbals",
    "Timpani",
    "Xylophone",
    "Piano",
    "Organ",
    "Harpsichord",
    "ElectricGuitar",
    "AcousticGuitar",
    "BassGuitar",
    "Harp",
    "Accordion",
    "Mandolin",
    "Sitar",
    "Bagpipes",
    "Marimba",
    "Vibraphone",
    "Tambourine",
    "Glockenspiel",
  ];

  const emotionList = [
    "Angry",
    "Happy",
    "Relaxed",
    "Sad",
  ];

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

  const addToCart = async (scoreId) => {
    try {
      await axios.post("http://localhost:3000/add-to-cart", {
        musicScoreId: scoreId,
      });
      setAddedToCartScores([...addedToCartScores, scoreId]);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const toggleFavorite = async (musicScoreId) => {
    try {
      const response = await axios.post("http://localhost:3000/set-favorites", {
        musicScoreId,
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

  const searchOptionsMap = {
    title: "Title",
    genre: "Genre",
    emotion: "Emotion",
    composer: "Composer",
    artist: "Artist",
    instrumentation: "Instrumentation",
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
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <CustomerSidebar />
          <Box sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column",             marginLeft: "229px", // 225px (sidebar width) + 4px (yellow line)
 }}>
        
           <Box
                       sx={{
                        
                         display: "flex",
                         justifyContent: "space-between",
                         alignItems: "center",
                         mb: 3,
                       }}
                     >
            <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h4" sx={{ fontFamily: "Montserrat", fontWeight: "bold", mt: 4, ml: 1 }}>
              Music Score Repository Search
            </Typography>            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {user ? (
                <>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    {user.username}
                  </Typography>
                  <Avatar
                    alt={user.username}
                    src={
                      user && user.profile_picture
                        ? user.profile_picture
                        : null
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
                  backgroundColor: "#f5f5f5", 
                  borderRadius: 2, 
                  p: 4,
                  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)', // Added elevation
                  border: '1px solid rgba(0, 0, 0, 0.12)' // Added subtle border
                }}
              >
                <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: "Montserrat", 
                      mr: 2,
                      fontWeight: 500 
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
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#67ADC1'
                      },
                      '& .MuiSelect-select': {
                        fontFamily: "Montserrat"
                      }
                    }}
                  >
                    {collectionOptions.map(option => (
                      <MenuItem key={option} value={option} sx={{ fontFamily: "Montserrat" }}>
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
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                  >
                    {index !== 0 && (
                      <FormControl sx={{ width: 120 }}>
                        <InputLabel sx={{ fontFamily: "Montserrat" }}>Logic</InputLabel>
                        <Select
                          value={criteria.logic}
                          onChange={(e) => handleLogicChange(index, e.target.value)}
                          sx={{
                            fontFamily: "Montserrat",
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#67ADC1'
                            }
                          }}
                          label="Logic"
                        >
                          {["AND", "OR", "NOT"].map(option => (
                            <MenuItem key={option} value={option} sx={{ fontFamily: "Montserrat" }}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    <FormControl sx={{ width: 150 }}>
                      <InputLabel sx={{ fontFamily: "Montserrat" }}>Category</InputLabel>
                      <Select
                        value={criteria.category}
                        onChange={(e) => handleCategoryChange(index, e.target.value)}
                        label="Category"
                        sx={{
                          fontFamily: "Montserrat",
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#67ADC1'
                          }
                        }}
                      >
                        {[
                          "All", 
                          "Title", 
                          "Genre", 
                          "Composer", 
                          "Instrumentation", // Added
                          "Emotion" // Added
                        ].map(option => (
                          <MenuItem key={option} value={option} sx={{ fontFamily: "Montserrat" }}>
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
                        '& .MuiOutlinedInput-root': {
                          fontFamily: "Montserrat",
                          '& fieldset': {
                            borderColor: '#67ADC1',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: "Montserrat"
                        }
                      }}
                    />

                    {searchCriteria.length > 1 && (
                      <IconButton 
                        onClick={() => handleDeleteRow(index)}
                        sx={{ color: '#67ADC1' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {searchCriteria.length < 3 && (
                      <Button
                        onClick={handleAddRow}
                        variant="outlined"
                        sx={{
                          fontFamily: "Montserrat",
                          color: "#67ADC1",
                          borderColor: "#67ADC1",
                          '&:hover': {
                            backgroundColor: "#67ADC1",
                            color: "white"
                          }
                        }}
                      >
                        Add Row
                      </Button>
                    )}
                    <Button
                      onClick={() => navigate('/customer-search/customer-advanced-search')}
                      variant="contained"
                      sx={{
                        fontFamily: "Montserrat",
                        backgroundColor: "#3B3183", // Green color
                        color: "white",
                        '&:hover': {
                          backgroundColor: "#8BD3E6" // Darker green on hover
                        }
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
                        fontFamily: "Montserrat",
                        color: "#67ADC1",
                        borderColor: "#67ADC1",
                        '&:hover': {
                          backgroundColor: "#67ADC1",
                          color: "white"
                        }
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleSearch}
                      variant="contained"
                      startIcon={<SearchIcon />}
                      sx={{
                        fontFamily: "Montserrat",
                        backgroundColor: "#67ADC1",
                        '&:hover': {
                          backgroundColor: "#78BBCC"
                        }
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
                p: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={handleToggleSearchResults}
                startIcon={<ArrowBackIcon />} // Add the left arrow icon here
                sx={{
                  backgroundColor: "#78BBCC",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#67ADC1",
                  },
                }}
              >
                Back
              </Button>
              {/* "Refined by" Typography */}
              <Typography variant="h6" sx={{ marginRight: 2 }}>
                Refined by:
              </Typography>

              {/* Buttons Container */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 2,

                  overflowX: "auto", // Enable horizontal scrolling
                  flexGrow: 1, // Allow it to take up the remaining width
                  maxWidth: "50vw", // Ensure the container is limited to the viewport width
                }}
              >
                {/* Genre Button */}
                {hasFiltered && selectedGenres.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#E4C1F9", // Pastel light purple
                      color: "black",
                      borderRadius: 50, // High border-radius for rounded buttons
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap", // Prevent text from wrapping
                    }}
                    disabled
                  >
                    {getButtonText("Genre", selectedGenres)}
                  </Button>
                )}

                {/* Composer Button */}
                {hasFiltered && selectedComposers.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#E4C1F9",
                      color: "black",
                      borderRadius: 50,
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap", // Prevent text from wrapping
                    }}
                    disabled
                  >
                    {getButtonText("Composer", selectedComposers)}
                  </Button>
                )}

                {/* Instrument Button */}
                {hasFiltered && selectedInstruments.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#E4C1F9",
                      color: "#FFFFFF",
                      borderRadius: 50,
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap", // Prevent text from wrapping
                    }}
                    disabled
                  >
                    {getButtonText("Instrumentation", selectedInstruments)}
                  </Button>
                )}

                {/* Emotion Button */}
                {hasFiltered && selectedEmotions.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#E4C1F9",
                      color: "black",
                      borderRadius: 50,
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap", // Prevent text from wrapping
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
                height: "100%",
                width: "100%",
                overflow: "auto",
                pl: 2,
                pt: 1,
              }}
            >
              <Grid container spacing={2}>
                {/* Refinement section on the left */}
                <Grid item xs={3}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      height: "100%",
                      position: "relative",
                      flexDirection: "column",
                      display: "flex",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontFamily: "Montserrat, sans-serif", // Apply Montserrat font
                        textAlign: "center", // Center the text horizontally
                      }}
                    >
                      Refine Your Search
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Genre</InputLabel>
                      <Select
                        multiple // Allow multiple selections
                        value={selectedGenres} // state for multiple selections
                        onChange={handleGenreChange} // handler to update selected genres
                        label="Genre"
                        renderValue={(selected) => selected.join(", ")} // Display selected genres as a comma-separated string
                        sx={{
                          borderRadius: "16px", // Apply border-radius to the Select component itself
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderRadius: "16px", // Apply border-radius to the outline when the Select is focused
                          },
                          "& .MuiSelect-icon": {
                            borderRadius: "100%", // Optional: round the dropdown icon
                          },
                        }}
                      >
                        {/* Generate MenuItems dynamically from genreList */}
                        {genreList.map((genre) => (
                          <MenuItem
                            key={genre}
                            value={genre}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              "&:hover": {
                                backgroundColor: "#78BBCC", // Hover effect
                              },
                              "&.Mui-selected": {
                                backgroundColor: "#67ADC1", // Selected item effect
                                color: "#FFFFFF",
                                "&:hover": {
                                  backgroundColor: "#67ADC1", // Keep the color when selected and hovered
                                },
                              },
                            }}
                          >
                            {genre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Composer</InputLabel>
                      <Select
                        multiple // Allow multiple selections
                        value={selectedComposers} // state for multiple selections
                        onChange={handleComposerChange} // handler to update selected genres
                        label="Composer"
                        renderValue={(selected) => selected.join(", ")} // Display selected genres as a comma-separated string
                        sx={{
                          borderRadius: "16px", // Apply border-radius to the Select component itself
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderRadius: "16px", // Apply border-radius to the outline when the Select is focused
                          },
                          "& .MuiSelect-icon": {
                            borderRadius: "100%", // Optional: round the dropdown icon
                          },
                        }}
                      >
                        {/* Generate MenuItems dynamically from genreList */}
                        {composerList.map((composer) => (
                          <MenuItem
                            key={composer}
                            value={composer}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              "&:hover": {
                                backgroundColor: "#78BBCC", // Hover effect
                              },
                              "&.Mui-selected": {
                                backgroundColor: "#67ADC1", // Selected item effect
                                color: "#FFFFFF",
                                "&:hover": {
                                  backgroundColor: "#67ADC1", // Keep the color when selected and hovered
                                },
                              },
                            }}
                          >
                            {composer}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Section refinement dropdown example */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Instrument</InputLabel>
                      <Select
                        multiple // Allow multiple selections
                        value={selectedInstruments} // state for multiple selections
                        onChange={handleInstrumentChange} // handler to update selected genres
                        label="Instrument"
                        renderValue={(selected) => selected.join(", ")} // Display selected genres as a comma-separated string
                        sx={{
                          borderRadius: "16px", // Apply border-radius to the Select component itself
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderRadius: "16px", // Apply border-radius to the outline when the Select is focused
                          },
                          "& .MuiSelect-icon": {
                            borderRadius: "100%", // Optional: round the dropdown icon
                          },
                        }}
                      >
                        {instrumentList.map((instrument) => (
                          <MenuItem
                            key={instrument}
                            value={instrument}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              "&:hover": {
                                backgroundColor: "#78BBCC", // Hover effect
                              },
                              "&.Mui-selected": {
                                backgroundColor: "#67ADC1", // Selected item effect
                                color: "#FFFFFF",
                                "&:hover": {
                                  backgroundColor: "#67ADC1", // Keep the color when selected and hovered
                                },
                              },
                            }}
                          >
                            {instrument}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Emotion</InputLabel>
                      <Select
                        multiple // Allow multiple selections
                        value={selectedEmotions} // state for multiple selections
                        onChange={handleEmotionChange} // handler to update selected genres
                        label="Emotion"
                        renderValue={(selected) => selected.join(", ")} // Display selected genres as a comma-separated string
                        sx={{
                          borderRadius: "16px", // Apply border-radius to the Select component itself
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderRadius: "16px", // Apply border-radius to the outline when the Select is focused
                          },
                          "& .MuiSelect-icon": {
                            borderRadius: "100%", // Optional: round the dropdown icon
                          },
                        }}
                      >
                        {/* Generate MenuItems dynamically from genreList */}
                        {emotionList.map((emotion) => (
                          <MenuItem
                            key={emotion}
                            value={emotion}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              "&:hover": {
                                backgroundColor: "#78BBCC", // Hover effect
                              },
                              "&.Mui-selected": {
                                backgroundColor: "#67ADC1", // Selected item effect
                                color: "#FFFFFF",
                                "&:hover": {
                                  backgroundColor: "#67ADC1", // Keep the color when selected and hovered
                                },
                              },
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
                      sx={{
                        borderColor: "#78BBCC", // Set the border color to #78BBCC
                        color: "#78BBCC", // Set the text color to #78BBCC
                        padding: "8px 16px", // Padding for the button
                        textTransform: "none", // Disable text transformation
                        height: "40px", // Set the height
                        marginBottom: 2, // Add bottom margin of 2
                        "&:hover": {
                          borderColor: "#78BBCC", // Ensure border color stays consistent on hover
                          backgroundColor: "#E0E0E0", // Transparent background on hover
                        },
                      }}
                      onClick={() => {
                        handleClearFilters();
                      }}
                    >
                      Clear Filters
                    </Button>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleRefineClick}
                      sx={{
                        backgroundColor: "#78BBCC", // Pastel dark purple
                        color: "#ffffff",
                        "&:hover": {
                          backgroundColor: "#67ADC1", // Darker purple on hover
                        },
                        width: "100%",
                        mb: 2,
                      }}
                    >
                      Refine
                    </Button>
                  </Box>
                </Grid>

                {/* Search results section on the right */}
                <Grid item xs={9}>
                  {searchResults.length === 0 && hasSearched && (
                    <Typography variant="body1">No results found</Typography>
                  )}

                  {searchResults.length > 0 && (
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
                              primary={item.title}
                              secondary={`Genre: ${item.genre} | Composer: ${item.composer} | Artist: ${item.artist}`}
                            />

                            <ListItemIcon>
                              {!purchasedScores.includes(item._id) &&
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
                            </ListItemIcon>

                            <ListItemIcon>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle play button action here
                                }}
                              >
                                <PlayArrow />
                              </IconButton>
                            </ListItemIcon>
                          </ListItemButton>
                        ))}
                      </List>

                      {/* Pagination */}
                      <Pagination
                        count={Math.ceil(searchResults.length / itemsPerPage)} // Calculate total pages
                        page={page} // Set the current page
                        onChange={handlePageChange} // Handle page change
                        sx={{
                          mt: 2,
                          display: "flex",
                          justifyContent: "center",
                        }} // Style the pagination component
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Search Result Frontend Component End */}
        </Box>
      </Box>
    </>
  );
}
