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
  InputLabel,
  FormControl,
  Pagination,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicEntryClerkSidebar";
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

export default function MusicEntryClerkSearch() {
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

  const emotionList = ["Angry", "Happy", "Relaxed", "Sad"];

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
      overflow-x:hidden;
    }
  `;

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", minHeight: "100vh", maxHeight: "100vh" }}>
        <ClerkSidebar active="searchScore" />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
            marginLeft: "229px", // 225px (sidebar width) + 4px (yellow line)
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
                        navigate("/clerk-search/clerk-advanced-search")
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
                p: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={handleToggleSearchResults}
                startIcon={<ArrowBackIcon />} // Add the left arrow icon here
                sx={{
                  boxShadow: "none",
                  px: 5,
                  ...buttonStyles2,
                }}
              >
                Back
              </Button>

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
                      fontFamily: "Montserrat",
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
                      whiteSpace: "nowrap",
                      fontFamily: "Montserrat",
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
                      whiteSpace: "nowrap",
                      fontFamily: "Montserrat",
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
                height: "calc(100vh - 200px)", // Adjust this value based on your header/navigation height
                width: "100%",
                overflow: "hidden", // Prevent outer box from scrolling
                p: 2,
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
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontFamily: "Montserrat, sans-serif",
                        textAlign: "center",
                        mb: 2,
                      }}
                    >
                      Refine Your Search
                    </Typography>

                    {/* Filters for Genre, Composer, Instrument, Emotion */}
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
                        Instrument
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedInstruments}
                        onChange={handleInstrumentChange}
                        label="Instrument"
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
                        {instrumentList.map((instrument) => (
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

                {/* Search results section on the right */}
                <Grid item xs={9}>
                  {paginatedResults.length === 0 && hasSearched && (
                    <Typography sx={{ fontFamily: "Montserrat" }}>
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
                              navigate(`/clerk-music-score-view/${item._id}`)
                            }
                            sx={{
                              "& .MuiTypography-root": {
                                fontFamily: "Montserrat",
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  sx={{
                                    fontFamily: "Montserrat",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {item.title}
                                </Typography>
                              }
                              secondary={
                                <Typography
                                  variant="body2"
                                  sx={{ fontFamily: "Montserrat" }}
                                >
                                  {`Genre: ${item.genre} | Composer: ${item.composer} | Artist: ${item.artist}`}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        ))}
                      </List>

                      {/* Pagination */}
                      <Box
                        sx={{
                          mt: 3,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Pagination
                          count={Math.ceil(
                            (hasFiltered
                              ? filteredResults.length
                              : searchResults.length) / itemsPerPage
                          )}
                          page={page}
                          onChange={handlePageChange}
                          sx={{
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
